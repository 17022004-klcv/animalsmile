import type { TipoDonacion } from "@/src/types/enums";

const ETIQUETAS_TIPO: Record<TipoDonacion, string> = {
  Financiera: "Financiera",
  Alimentos: "Alimentos",
  Medicamentos: "Medicamentos",
  Higiene_Limpieza: "Higiene y limpieza",
  Equipamiento_Otros: "Equipamiento y otros",
};

export function etiquetaTipoDonacion(
  tipo: TipoDonacion | string | null | undefined,
): string {
  if (!tipo) return "Sin tipo";
  return ETIQUETAS_TIPO[tipo as TipoDonacion] ?? tipo;
}

export function formatearCantidad(
  cantidad: number | null | undefined,
  unidad: string | null | undefined,
): string {
  if (cantidad === null || cantidad === undefined) return "—";
  const numero = new Intl.NumberFormat("es-ES", {
    maximumFractionDigits: 2,
  }).format(cantidad);
  return unidad ? `${numero} ${unidad}` : numero;
}
