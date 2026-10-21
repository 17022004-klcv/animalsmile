import type { ResultadoParseo } from "@/src/types/common";

export type SantuarioInput = {
  nombre: string;
  contacto_principal: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  tipo_fauna_permitida: string | null;
};

export type TrasladoInput = {
  id_animal: string;
  id_santuario: string;
  fecha_traslado: string;
  motivo: string;
  responsable_transporte: string | null;
  estado_salida: string | null;
  estado_llegada: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function textoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

/** Valida y normaliza la creación de un santuario. */
export function parseSantuarioInput(raw: unknown): ResultadoParseo<SantuarioInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const nombre = typeof b.nombre === "string" ? b.nombre.trim() : "";
  if (!nombre) return { ok: false, error: "El nombre del santuario es obligatorio." };

  const email = textoOpcional(b.email);
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: "El correo electrónico no es válido." };
  }

  return {
    ok: true,
    valor: {
      nombre,
      contacto_principal: textoOpcional(b.contacto_principal),
      telefono: textoOpcional(b.telefono),
      email,
      direccion: textoOpcional(b.direccion),
      tipo_fauna_permitida: textoOpcional(b.tipo_fauna_permitida),
    },
  };
}

/** Valida y normaliza la actualización parcial de un santuario. */
export function parseSantuarioParcial(
  raw: unknown,
): ResultadoParseo<Partial<SantuarioInput>> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const data: Partial<SantuarioInput> = {};

  if (b.nombre !== undefined) {
    const nombre = typeof b.nombre === "string" ? b.nombre.trim() : "";
    if (!nombre) return { ok: false, error: "El nombre del santuario es obligatorio." };
    data.nombre = nombre;
  }

  if (b.email !== undefined) {
    const email = textoOpcional(b.email);
    if (email && !EMAIL_RE.test(email)) {
      return { ok: false, error: "El correo electrónico no es válido." };
    }
    data.email = email;
  }

  for (const campo of [
    "contacto_principal",
    "telefono",
    "direccion",
    "tipo_fauna_permitida",
  ] as const) {
    if (b[campo] !== undefined) {
      data[campo] = textoOpcional(b[campo]);
    }
  }

  return { ok: true, valor: data };
}

/** Valida y normaliza el registro de un traslado. */
export function parseTrasladoInput(raw: unknown): ResultadoParseo<TrasladoInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const idAnimal = typeof b.id_animal === "string" ? b.id_animal.trim() : "";
  if (!idAnimal) return { ok: false, error: "Debes seleccionar un animal." };

  const idSantuario =
    typeof b.id_santuario === "string" ? b.id_santuario.trim() : "";
  if (!idSantuario) return { ok: false, error: "Debes seleccionar un santuario." };

  const fecha = typeof b.fecha_traslado === "string" ? b.fecha_traslado.trim() : "";
  if (!fecha) return { ok: false, error: "La fecha del traslado es obligatoria." };

  const motivo = typeof b.motivo === "string" ? b.motivo.trim() : "";
  if (!motivo) return { ok: false, error: "El motivo del traslado es obligatorio." };

  return {
    ok: true,
    valor: {
      id_animal: idAnimal,
      id_santuario: idSantuario,
      fecha_traslado: fecha,
      motivo,
      responsable_transporte: textoOpcional(b.responsable_transporte),
      estado_salida: textoOpcional(b.estado_salida),
      estado_llegada: textoOpcional(b.estado_llegada),
    },
  };
}
