import type {
  EspecieInput,
  TaxonomiaInput,
} from "@/src/types/classification";
import type { ResultadoParseo } from "@/src/types/common";

/** Valida y normaliza la creación de una especie. */
export function parseEspecieInput(
  raw: unknown,
): ResultadoParseo<EspecieInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const nombre =
    typeof b.nombre_comun === "string" ? b.nombre_comun.trim() : "";
  if (!nombre) {
    return { ok: false, error: "El nombre común es obligatorio." };
  }

  const idTaxonomia = Number(b.id_taxonomia);
  if (!Number.isInteger(idTaxonomia)) {
    return { ok: false, error: "Debes seleccionar una taxonomía válida." };
  }

  return {
    ok: true,
    valor: {
      nombre_comun: nombre,
      id_taxonomia: idTaxonomia,
      es_domestico: b.es_domestico !== false,
    },
  };
}

/** Valida y normaliza la actualización parcial de una especie. */
export function parseEspecieParcial(
  raw: unknown,
): ResultadoParseo<Partial<EspecieInput>> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const data: Partial<EspecieInput> = {};

  if (b.nombre_comun !== undefined) {
    const nombre =
      typeof b.nombre_comun === "string" ? b.nombre_comun.trim() : "";
    if (!nombre) {
      return { ok: false, error: "El nombre común es obligatorio." };
    }
    data.nombre_comun = nombre;
  }

  if (b.id_taxonomia !== undefined) {
    const idTaxonomia = Number(b.id_taxonomia);
    if (!Number.isInteger(idTaxonomia)) {
      return { ok: false, error: "Debes seleccionar una taxonomía válida." };
    }
    data.id_taxonomia = idTaxonomia;
  }

  if (b.es_domestico !== undefined) {
    data.es_domestico = b.es_domestico !== false;
  }

  return { ok: true, valor: data };
}

/** Valida y normaliza la creación de una taxonomía. */
export function parseTaxonomiaInput(
  raw: unknown,
): ResultadoParseo<TaxonomiaInput> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const nombre = typeof b.nombre_clase === "string" ? b.nombre_clase.trim() : "";
  if (!nombre) {
    return { ok: false, error: "El nombre de la clase es obligatorio." };
  }
  return { ok: true, valor: { nombre_clase: nombre } };
}
