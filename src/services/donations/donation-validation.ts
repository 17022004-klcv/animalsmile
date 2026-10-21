import type { ResultadoParseo } from "@/src/types/common";
import type { TipoDonacion } from "@/src/types/enums";
import { TIPOS_DONACION } from "@/src/types/enums";

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

/** Valida y normaliza el registro de una donación. */
export function parseDonacionInput(raw: unknown): ResultadoParseo<DonacionInput> {
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
      metodo_pago: esFinanciera
        ? typeof b.metodo_pago === "string" && b.metodo_pago.trim()
          ? b.metodo_pago.trim()
          : null
        : null,
      cantidad: esFinanciera ? null : cantidad,
      unidad_medida: esFinanciera
        ? null
        : typeof b.unidad_medida === "string" && b.unidad_medida.trim()
          ? b.unidad_medida.trim()
          : null,
      descripcion_detalle:
        typeof b.descripcion_detalle === "string" && b.descripcion_detalle.trim()
          ? b.descripcion_detalle.trim()
          : null,
      comprobante_url:
        typeof b.comprobante_url === "string" && b.comprobante_url.trim()
          ? b.comprobante_url.trim()
          : null,
    },
  };
}
