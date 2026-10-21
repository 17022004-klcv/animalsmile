import type { Animal } from "@/src/types/animal";

/** Modelo `Taxonomia` (tabla `taxonomias`). */
export interface Taxonomia {
  id_taxonomia: number;
  nombre_clase: string;
}

/** Modelo `Especie` (tabla `especies`). */
export interface Especie {
  id_especie: number;
  id_taxonomia: number;
  nombre_comun: string;
  es_domestico: boolean | null;
  creado_en: string | null;
}

/** Taxonomía con su relación inversa `especies`. */
export interface TaxonomiaConEspecies extends Taxonomia {
  especies?: Especie[];
  _count?: { especies: number };
}

/** Especie con su taxonomía y animales relacionados. */
export interface EspecieConRelaciones extends Especie {
  taxonomia: Taxonomia;
  animales?: Animal[];
  _count?: { animales: number };
}

/** Payload de creación de especie. */
export type EspecieInput = {
  nombre_comun: string;
  id_taxonomia: number;
  es_domestico: boolean;
};

/** Payload de creación de taxonomía. */
export type TaxonomiaInput = {
  nombre_clase: string;
};
