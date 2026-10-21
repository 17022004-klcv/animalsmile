import type { ResultadoParseo } from "@/src/types/common";
import type { EstadoSolicitud } from "@/src/types/enums";
import { ESTADOS_SOLICITUD } from "@/src/types/enums";

export type SolicitanteInput = {
  documento_identidad: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo_vivienda: string | null;
  tiene_mascotas: boolean;
};

export type SolicitudInput = {
  id_solicitante: string;
  id_animal: string;
};

export type EvaluacionSolicitudInput = {
  estado: EstadoSolicitud;
  notas_evaluacion: string | null;
};

export type AdopcionInput = {
  id_solicitud: string;
  fecha_adopcion: string;
  contrato_firmado_url: string | null;
};

export type SeguimientoInput = {
  id_adopcion: string;
  num_mes: number;
  fecha_programada: string;
};

export type SeguimientoResultadoInput = {
  fecha_realizada: string;
  estado_evaluacion: string | null;
  observaciones: string | null;
  evidencias_fotos: string[] | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function textoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
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
      tiene_mascotas: b.tiene_mascotas === true || b.tiene_mascotas === "true",
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

  return {
    ok: true,
    valor: { id_solicitante: idSolicitante, id_animal: idAnimal },
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

  const fecha =
    typeof b.fecha_adopcion === "string" && b.fecha_adopcion.trim()
      ? b.fecha_adopcion.trim()
      : null;

  return {
    ok: true,
    valor: {
      id_solicitud: idSolicitud,
      fecha_adopcion: fecha ?? new Date().toISOString().slice(0, 10),
      contrato_firmado_url: textoOpcional(b.contrato_firmado_url),
    },
  };
}

/** Valida y normaliza la programación de un seguimiento. */
export function parseSeguimientoInput(
  raw: unknown,
): ResultadoParseo<SeguimientoInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const idAdopcion =
    typeof b.id_adopcion === "string" ? b.id_adopcion.trim() : "";
  if (!idAdopcion) {
    return { ok: false, error: "Debes indicar la adopción." };
  }

  const numMes = Number(b.num_mes);
  if (!Number.isInteger(numMes) || numMes < 1) {
    return { ok: false, error: "El número de mes debe ser un entero positivo." };
  }

  const fecha =
    typeof b.fecha_programada === "string" ? b.fecha_programada.trim() : "";
  if (!fecha) {
    return { ok: false, error: "La fecha programada es obligatoria." };
  }

  return {
    ok: true,
    valor: { id_adopcion: idAdopcion, num_mes: numMes, fecha_programada: fecha },
  };
}

/** Valida el resultado de un seguimiento realizado. */
export function parseSeguimientoResultado(
  raw: unknown,
): ResultadoParseo<SeguimientoResultadoInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const fecha =
    typeof b.fecha_realizada === "string" && b.fecha_realizada.trim()
      ? b.fecha_realizada.trim()
      : new Date().toISOString().slice(0, 10);

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
