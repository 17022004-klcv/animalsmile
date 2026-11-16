import type { ResultadoParseo } from "@/src/types/common";
import type { DonacionFinancieraInput } from "@/src/types/donacion";
import type { TipoDonacion } from "@/src/types/enums";
import { TIPOS_DONACION } from "@/src/types/enums";

export type { DonacionFinancieraInput } from "@/src/types/donacion";

export type DonacionInput = {
  donante_nombre: string;
  donante_email: string | null;
  tipo: TipoDonacion;
  monto: number | null;
  metodo_pago: string | null;
  cantidad: number | null;
  unidad_medida: string | null;
  descripcion_detalle: string | null;
  comprobante_url: string | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONTO_MAXIMO = 99999999.99;

function esTipoValido(valor: unknown): valor is TipoDonacion {
  return (
    typeof valor === "string" &&
    (TIPOS_DONACION as readonly string[]).includes(valor)
  );
}

function numeroOpcional(valor: unknown): number | null {
  if (valor === undefined || valor === null || valor === "") return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function textoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

/** Valida y normaliza el registro de una donación genérica. */
export function parseDonacionInput(
  raw: unknown,
): ResultadoParseo<DonacionInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  if (!esTipoValido(b.tipo)) {
    return { ok: false, error: "El tipo de donación no es válido." };
  }

  const esFinanciera = b.tipo === "Financiera";
  const monto = numeroOpcional(b.monto);
  const cantidad = numeroOpcional(b.cantidad);

  if (esFinanciera && (monto === null || monto <= 0)) {
    return { ok: false, error: "Debes indicar un monto válido." };
  }
  if (!esFinanciera && (cantidad === null || cantidad <= 0)) {
    return { ok: false, error: "Debes indicar una cantidad válida." };
  }

  const donanteNombre =
    typeof b.donante_nombre === "string" && b.donante_nombre.trim()
      ? b.donante_nombre.trim()
      : "Anónimo";

  const donanteEmail =
    typeof b.donante_email === "string" && b.donante_email.trim()
      ? b.donante_email.trim().toLowerCase()
      : null;

  return {
    ok: true,
    valor: {
      donante_nombre: donanteNombre,
      donante_email: donanteEmail,
      tipo: b.tipo,
      monto: esFinanciera ? monto : null,
      metodo_pago: esFinanciera ? textoOpcional(b.metodo_pago) : null,
      cantidad: esFinanciera ? null : cantidad,
      unidad_medida: esFinanciera ? null : textoOpcional(b.unidad_medida),
      descripcion_detalle: textoOpcional(b.descripcion_detalle),
      comprobante_url: textoOpcional(b.comprobante_url),
    },
  };
}

/** Valida y normaliza el registro de una donación financiera. */
export function parseDonacionFinancieraInput(
  raw: unknown,
): ResultadoParseo<DonacionFinancieraInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const monto = numeroOpcional(b.monto);
  if (monto === null || monto <= 0) {
    return { ok: false, error: "Debes indicar un monto válido." };
  }
  if (monto > MONTO_MAXIMO) {
    return { ok: false, error: "El monto supera el límite permitido." };
  }

  const fechaTexto =
    typeof b.fecha_donacion === "string" ? b.fecha_donacion.trim() : "";
  if (!fechaTexto) {
    return { ok: false, error: "La fecha de la donación es obligatoria." };
  }
  const fecha = new Date(fechaTexto);
  if (Number.isNaN(fecha.getTime())) {
    return { ok: false, error: "La fecha de la donación no es válida." };
  }

  const email = textoOpcional(b.donante_email);
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: "El correo electrónico no es válido." };
  }

  const donanteNombre =
    typeof b.donante_nombre === "string" && b.donante_nombre.trim()
      ? b.donante_nombre.trim()
      : "Anónimo";

  return {
    ok: true,
    valor: {
      donante_nombre: donanteNombre,
      donante_email: email ? email.toLowerCase() : null,
      monto: Math.round(monto * 100) / 100,
      metodo_pago: textoOpcional(b.metodo_pago),
      fecha_donacion: fechaTexto,
      descripcion_detalle: textoOpcional(b.descripcion_detalle),
      comprobante_url: textoOpcional(b.comprobante_url),
    },
  };
}

export interface DonacionEspecieInput {
  donante_nombre: string;
  donante_email: string | null;
  tipo: TipoDonacion;
  cantidad: number;
  unidad_medida: string;
  descripcion_detalle: string | null; // Ej: "10 bolsas de arroz de 5lbs"
  fecha_donacion: string;
  comprobante_url: string | null;
}

export function parseDonacionEspecieInput(
  raw: unknown,
): ResultadoParseo<DonacionEspecieInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  // 1. Validar que el tipo sea válido
  if (!esTipoValido(b.tipo) || b.tipo === "Financiera") {
    return { ok: false, error: "El tipo de donación en especie no es válido." };
  }

  // 2. Validar cantidad
  const cantidad = numeroOpcional(b.cantidad);
  if (cantidad === null || cantidad <= 0) {
    return { ok: false, error: "Debes indicar una cantidad válida." };
  }

  // 3. Validar unidad de medida
  const unidadMedida = textoOpcional(b.unidad_medida);
  if (!unidadMedida) {
    return { ok: false, error: "La unidad de medida es obligatoria." };
  }

  // 4. Validar fecha
  const fechaTexto =
    typeof b.fecha_donacion === "string" ? b.fecha_donacion.trim() : "";
  if (!fechaTexto) {
    return { ok: false, error: "La fecha de la donación es obligatoria." };
  }
  const fecha = new Date(fechaTexto);
  if (Number.isNaN(fecha.getTime())) {
    return { ok: false, error: "La fecha de la donación no es válida." };
  }

  // 5. Validar correo opcional
  const email = textoOpcional(b.donante_email);
  if (email && !EMAIL_RE.test(email)) {
    return { ok: false, error: "El correo electrónico no es válido." };
  }

  const donanteNombre =
    typeof b.donante_nombre === "string" && b.donante_nombre.trim()
      ? b.donante_nombre.trim()
      : "Anónimo";

  return {
    ok: true,
    valor: {
      donante_nombre: donanteNombre,
      donante_email: email ? email.toLowerCase() : null,
      tipo: b.tipo as TipoDonacion, // <-- Pasamos el tipo validado
      cantidad,
      unidad_medida: unidadMedida,
      descripcion_detalle: textoOpcional(b.descripcion_detalle),
      fecha_donacion: fechaTexto,
      comprobante_url: textoOpcional(b.comprobante_url),
    },
  };
}
