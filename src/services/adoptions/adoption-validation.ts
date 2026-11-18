import type { ResultadoParseo } from "@/src/types/common";
import type { EstadoSolicitud } from "@/src/types/enums";
import { ESTADOS_SOLICITUD } from "@/src/types/enums";
import type { SolicitanteInput } from "@/src/types/solicitantes";
import type {
  AdopcionInput,
  AdopcionParcial,
  SeguimientoInput,
  SeguimientoProgramacionParcial,
  SeguimientoResultadoInput,
} from "@/src/types/adopcion";

export type { SolicitanteInput } from "@/src/types/solicitantes";
export type {
  AdopcionInput,
  AdopcionParcial,
  SeguimientoInput,
  SeguimientoProgramacionParcial,
  SeguimientoResultadoInput,
} from "@/src/types/adopcion";

export type SolicitudInput = {
  id_solicitante: string;
  id_animal: string;
  estado?: EstadoSolicitud;
  notas_evaluacion?: string | null;
};

export type EvaluacionSolicitudInput = {
  estado: EstadoSolicitud;
  notas_evaluacion: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function textoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

function fechaISO(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const texto = valor.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  const fecha = new Date(`${texto}T00:00:00Z`);
  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== texto
  ) {
    return null;
  }
  return texto;
}

/** Valida y normaliza el registro de un solicitante. */
export function parseSolicitanteInput(
  raw: unknown,
): ResultadoParseo<SolicitanteInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const documento =
    typeof b.documento_identidad === "string" ? b.documento_identidad.trim() : "";
  if (!documento) {
    return { ok: false, error: "El documento de identidad es obligatorio." };
  }

  const nombre = typeof b.nombre === "string" ? b.nombre.trim() : "";
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };

  const apellido = typeof b.apellido === "string" ? b.apellido.trim() : "";
  if (!apellido) return { ok: false, error: "El apellido es obligatorio." };

  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "El correo electrónico no es válido." };
  }

  const telefono = typeof b.telefono === "string" ? b.telefono.trim() : "";
  if (!telefono) return { ok: false, error: "El teléfono es obligatorio." };

  const direccion = typeof b.direccion === "string" ? b.direccion.trim() : "";
  if (!direccion) return { ok: false, error: "La dirección es obligatoria." };

  const tieneMascotas = b.tiene_mascotas;
  if (
    tieneMascotas !== undefined &&
    tieneMascotas !== null &&
    typeof tieneMascotas !== "boolean" &&
    tieneMascotas !== "true" &&
    tieneMascotas !== "false"
  ) {
    return { ok: false, error: "El valor de mascotas no es válido." };
  }

  return {
    ok: true,
    valor: {
      documento_identidad: documento,
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      tipo_vivienda: textoOpcional(b.tipo_vivienda),
      tiene_mascotas:
        tieneMascotas === null
          ? null
          : tieneMascotas === true || tieneMascotas === "true",
    },
  };
}

/** Valida y normaliza la creación de una solicitud de adopción. */
export function parseSolicitudInput(raw: unknown): ResultadoParseo<SolicitudInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const idSolicitante =
    typeof b.id_solicitante === "string" ? b.id_solicitante.trim() : "";
  if (!idSolicitante) {
    return { ok: false, error: "Debes seleccionar un solicitante." };
  }

  const idAnimal = typeof b.id_animal === "string" ? b.id_animal.trim() : "";
  if (!idAnimal) return { ok: false, error: "Debes seleccionar un animal." };

  const estado = b.estado;
  if (
    estado !== undefined &&
    estado !== null &&
    (typeof estado !== "string" ||
      !(ESTADOS_SOLICITUD as readonly string[]).includes(estado))
  ) {
    return { ok: false, error: "El estado seleccionado no es válido." };
  }

  return {
    ok: true,
    valor: {
      id_solicitante: idSolicitante,
      id_animal: idAnimal,
      ...(typeof estado === "string"
        ? { estado: estado as EstadoSolicitud }
        : {}),
      notas_evaluacion: textoOpcional(b.notas_evaluacion),
    },
  };
}

/** Valida y normaliza la evaluación (cambio de estado) de una solicitud. */
export function parseEvaluacionSolicitud(
  raw: unknown,
): ResultadoParseo<EvaluacionSolicitudInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  if (
    typeof b.estado !== "string" ||
    !(ESTADOS_SOLICITUD as readonly string[]).includes(b.estado)
  ) {
    return { ok: false, error: "El estado seleccionado no es válido." };
  }

  return {
    ok: true,
    valor: {
      estado: b.estado as EstadoSolicitud,
      notas_evaluacion: textoOpcional(b.notas_evaluacion),
    },
  };
}

/** Valida y normaliza el registro de una adopción. */
export function parseAdopcionInput(raw: unknown): ResultadoParseo<AdopcionInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const idSolicitud =
    typeof b.id_solicitud === "string" ? b.id_solicitud.trim() : "";
  if (!idSolicitud) {
    return { ok: false, error: "Debes indicar la solicitud aprobada." };
  }

  let fecha = new Date().toISOString().slice(0, 10);
  if (
    b.fecha_adopcion !== undefined &&
    b.fecha_adopcion !== null &&
    b.fecha_adopcion !== ""
  ) {
    const fechaNormalizada = fechaISO(b.fecha_adopcion);
    if (!fechaNormalizada) {
      return { ok: false, error: "La fecha de adopción no es válida." };
    }
    fecha = fechaNormalizada;
  }

  return {
    ok: true,
    valor: {
      id_solicitud: idSolicitud,
      fecha_adopcion: fecha,
      contrato_firmado_url: textoOpcional(b.contrato_firmado_url),
    },
  };
}

export function parseAdopcionParcial(
  raw: unknown,
): ResultadoParseo<AdopcionParcial> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const valor: AdopcionParcial = {};

  if ("fecha_adopcion" in b) {
    const fecha = fechaISO(b.fecha_adopcion);
    if (!fecha) {
      return { ok: false, error: "La fecha de adopción no es válida." };
    }
    valor.fecha_adopcion = fecha;
  }

  if ("contrato_firmado_url" in b) {
    valor.contrato_firmado_url = textoOpcional(b.contrato_firmado_url);
  }

  if (Object.keys(valor).length === 0) {
    return { ok: false, error: "No se indicaron cambios para la adopción." };
  }

  return { ok: true, valor };
}

function numeroMes(valor: unknown): number | null {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

export function parseSeguimientoInput(
  raw: unknown,
): ResultadoParseo<SeguimientoInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const idAdopcion =
    typeof b.id_adopcion === "string" ? b.id_adopcion.trim() : "";
  if (!idAdopcion) {
    return { ok: false, error: "Debes indicar la adopción." };
  }

  const numMes = numeroMes(b.num_mes);
  if (numMes === null) {
    return { ok: false, error: "El número de mes debe ser un entero positivo." };
  }

  const fecha = fechaISO(b.fecha_programada);
  if (!fecha) {
    return { ok: false, error: "La fecha programada no es válida." };
  }

  return {
    ok: true,
    valor: { id_adopcion: idAdopcion, num_mes: numMes, fecha_programada: fecha },
  };
}

export function parseProgramacionSeguimiento(
  raw: unknown,
): ResultadoParseo<SeguimientoProgramacionParcial> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const valor: SeguimientoProgramacionParcial = {};

  if ("num_mes" in b) {
    const numMes = numeroMes(b.num_mes);
    if (numMes === null) {
      return {
        ok: false,
        error: "El número de mes debe ser un entero positivo.",
      };
    }
    valor.num_mes = numMes;
  }

  if ("fecha_programada" in b) {
    const fecha = fechaISO(b.fecha_programada);
    if (!fecha) {
      return { ok: false, error: "La fecha programada no es válida." };
    }
    valor.fecha_programada = fecha;
  }

  if (Object.keys(valor).length === 0) {
    return {
      ok: false,
      error: "No se indicaron cambios para la programación.",
    };
  }

  return { ok: true, valor };
}

export function parseSeguimientoResultado(
  raw: unknown,
): ResultadoParseo<SeguimientoResultadoInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  let fecha = new Date().toISOString().slice(0, 10);
  if (
    b.fecha_realizada !== undefined &&
    b.fecha_realizada !== null &&
    b.fecha_realizada !== ""
  ) {
    const fechaNormalizada = fechaISO(b.fecha_realizada);
    if (!fechaNormalizada) {
      return { ok: false, error: "La fecha de realización no es válida." };
    }
    fecha = fechaNormalizada;
  }

  const fotos = Array.isArray(b.evidencias_fotos)
    ? b.evidencias_fotos.filter((f): f is string => typeof f === "string")
    : null;

  return {
    ok: true,
    valor: {
      fecha_realizada: fecha,
      estado_evaluacion: textoOpcional(b.estado_evaluacion),
      observaciones: textoOpcional(b.observaciones),
      evidencias_fotos: fotos && fotos.length ? fotos : null,
    },
  };
}
