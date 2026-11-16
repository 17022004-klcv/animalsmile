import type { EstadoAnimal } from "@/src/types/enums";
import type { Especie } from "@/src/types/classification";
import type { Usuario } from "@/src/types/usuario";

export const ESTADOS_ANIMAL = [
  "En_Cuarentena",
  "Disponible_Adopcion",
  "En_Tratamiento",
  "Trasladado",
  "Adoptado",
  "Fallecido",
] as const;

export const NIVELES_ENERGIA = ["Bajo", "Medio", "Alto"] as const;

export type NivelEnergia = (typeof NIVELES_ENERGIA)[number];

export { EstadoAnimal };

/** Modelo `Rescate` (tabla `rescates`). */
export interface Rescate {
  id_rescate: string;
  fecha_rescate: string;
  ubicacion_hallazgo: string;
  nombre_rescatista: string | null;
  contacto_rescatista: string | null;
  condicion_inicial: string;
  fotos_ingreso: string[] | null;
  creado_por: string | null;
  creado_en: string | null;
}

/** Rescate con su usuario creador. */
export interface RescateConUsuario extends Rescate {
  usuario_creador?: Usuario | null;
}

/** Modelo `Animal` (tabla `animales`). */
export interface Animal {
  id_animal: string;
  codigo_identificador: string;
  nombre: string;
  id_especie: number;
  id_rescate: string | null;
  raza_variedad: string | null;
  edad_estimada_meses: number | null;
  temperamento: string | null;
  nivel_energia: string | null;
  compatibilidad: unknown | null;
  estado: EstadoAnimal | string;
  foto_principal: string | null;
  creado_en: string | null;
}

/** Animal con sus relaciones (especie y rescate). */
export interface AnimalConRelaciones extends Animal {
  especie: Pick<Especie, "id_especie" | "nombre_comun">;
  rescate: Rescate | null;
}

/** Alias usado por el formulario de detalle. */
export type AnimalDetalle = AnimalConRelaciones;

/** Especie mínima usada en formularios. */
export type EspecieBasica = Pick<Especie, "id_especie" | "nombre_comun">;

/** Payload de rescate al crear/editar un animal. */
export type RescateInput = {
  fecha_rescate: string;
  ubicacion_hallazgo: string;
  nombre_rescatista: string | null;
  contacto_rescatista: string | null;
  condicion_inicial: string;
  fotos_ingreso: string[];
};

/** Payload de creación de animal. */
export type AnimalInput = {
  nombre: string;
  id_especie: number;
  codigo_identificador: string | null;
  raza_variedad: string | null;
  edad_estimada_meses: number | null;
  temperamento: string | null;
  nivel_energia: string | null;
  estado: string;
  foto_principal: string | null;
  rescate: RescateInput | null;
};

/** Payload de actualización parcial de animal. */
export type AnimalParcial = Partial<
  Omit<AnimalInput, "codigo_identificador" | "rescate">
> & {
  id_rescate?: string | null;
};

/** Modelo `ExpedienteMedico` (tabla `expedientes_medicos`). */
export interface ExpedienteMedico {
  id_expediente: string;
  id_animal: string;
  esterilizado: boolean | null;
  fecha_esterilizacion: string | null;
  observaciones_generales: string | null;
  actualizado_en: string | null;
}

/** Modelo `HistorialClinico` (tabla `historial_clinico`). */
export interface HistorialClinico {
  id_historial: string;
  id_expediente: string;
  id_veterinario: string | null;
  fecha_consulta: string | null;
  tipo_registro: string;
  descripcion: string;
  diagnostico: string | null;
  tratamiento: string | null;
  proxima_cita: string | null;
}

