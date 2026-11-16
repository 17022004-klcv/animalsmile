import type { EstadoAnimal } from "@/src/types/enums";

// =============================================================================
// CONSULTAS VETERINARIAS
// =============================================================================

/** Tipos de consulta admitidos (reflejan el enum `TipoConsulta` de Prisma). */
export const TIPOS_CONSULTA = [
  "Vacunacion",
  "Desparasitacion",
  "Medicacion",
  "Enfermedad",
  "Consulta_General",
  "Cirugia",
  "Examen",
  "Seguimiento",
  "Otro",
] as const;

export type TipoConsultaValor = (typeof TIPOS_CONSULTA)[number];

/** Estados del plan de vacunas de un animal. */
export const ESTADOS_VACUNA = [
  "Aplicada",
  "Al_Dia",
  "Vencida",
  "Pendiente",
  "No_Corresponde",
] as const;

export type EstadoVacuna = (typeof ESTADOS_VACUNA)[number];

/** Alcance de una vacuna dentro del catálogo. */
export const ALCANCES_VACUNA = ["General", "Taxonomia", "Especie"] as const;

export type AlcanceVacuna = (typeof ALCANCES_VACUNA)[number];

/** Modelo `Vacuna` (tabla `vacunas`). */
export interface Vacuna {
  id_vacuna: number;
  nombre: string;
  id_especie: number | null;
  id_taxonomia: number | null;
  descripcion: string | null;
  edad_minima_meses: number | null;
  intervalo_dias: number | null;
  dosis_recomendada: string | null;
  activa: boolean | null;
}

/** Vacuna con los nombres de su especie/taxonomía (para mostrar en la interfaz). */
export interface VacunaCatalogo extends Vacuna {
  especie: { id_especie: number; nombre_comun: string } | null;
  taxonomia: { id_taxonomia: number; nombre_clase: string } | null;
  alcance: AlcanceVacuna;
}

/** Modelo `Medicamento` (tabla `medicamentos`). */
export interface Medicamento {
  id_medicamento: number;
  nombre: string;
  descripcion: string | null;
  vias: string | null;
  activo: boolean | null;
}

/** Modelo `Enfermedad` (tabla `enfermedades`). */
export interface Enfermedad {
  id_enfermedad: number;
  nombre: string;
  descripcion: string | null;
  es_contagiosa: boolean | null;
  requiere_aislamiento: boolean | null;
  activa: boolean | null;
}

/** Modelo `Consulta` (tabla `consultas`). */
export interface Consulta {
  id_consulta: string;
  id_expediente: string;
  id_veterinario: string | null;
  id_enfermedad: number | null;
  fecha_consulta: string | null;
  tipo_consulta: string;
  motivo: string;
  diagnostico: string | null;
  tratamiento: string | null;
  peso_kg: string | number | null;
  proxima_cita: string | null;
  observaciones: string | null;
  registrado_por: string | null;
  creado_en: string | null;
}

/** Modelo `VacunaAplicada` (tabla `vacunas_aplicadas`). */
export interface VacunaAplicada {
  id_aplicacion: string;
  id_consulta: string;
  id_vacuna: number;
  lote: string | null;
  fecha_aplicacion: string | null;
  proxima_dosis: string | null;
  observaciones: string | null;
}

/** Modelo `MedicamentoAplicado` (tabla `medicamentos_aplicados`). */
export interface MedicamentoAplicado {
  id_aplicacion: string;
  id_consulta: string;
  id_medicamento: number;
  dosis: string | null;
  via_administracion: string | null;
  fecha_aplicacion: string | null;
  observaciones: string | null;
}

// =============================================================================
// PAYLOADS DE ENTRADA
// =============================================================================

/** Vacuna aplicada dentro de una consulta. */
export type VacunaInput = {
  id_vacuna: number;
  lote: string | null;
  fecha_aplicacion: string | null;
  proxima_dosis: string | null;
  observaciones: string | null;
};

/** Medicamento administrado dentro de una consulta. */
export type MedicamentoInput = {
  id_medicamento: number;
  dosis: string | null;
  via_administracion: string | null;
  fecha_aplicacion: string | null;
  observaciones: string | null;
};

/** Payload de creación de una consulta veterinaria. */
export type ConsultaInput = {
  id_animal: string;
  tipo_consulta: string;
  fecha_consulta: string | null;
  motivo: string;
  diagnostico: string | null;
  tratamiento: string | null;
  id_enfermedad: number | null;
  peso_kg: number | null;
  proxima_cita: string | null;
  observaciones: string | null;
  vacunas: VacunaInput[];
  medicamentos: MedicamentoInput[];
};

/** Payload de actualización de una consulta veterinaria. */
export type ConsultaActualizacion = Omit<ConsultaInput, "id_animal">;

// =============================================================================
// PLAN DE VACUNAS
// =============================================================================

/** Vacuna del plan con el estado calculado para un animal. */
export interface ItemPlanVacunas {
  id_vacuna: number;
  nombre: string;
  descripcion: string | null;
  dosis_recomendada: string | null;
  edad_minima_meses: number | null;
  intervalo_dias: number | null;
  alcance: AlcanceVacuna;
  ultima_aplicacion: string | null;
  proxima_dosis: string | null;
  estado: EstadoVacuna;
}

/** Resumen del plan de vacunas de un animal. */
export interface ResumenPlanVacunas {
  total: number;
  aplicadas: number;
  al_dia: number;
  vencidas: number;
  pendientes: number;
}

/** Plan de vacunas completo de un animal. */
export interface PlanVacunas {
  id_animal: string;
  codigo_identificador: string;
  nombre: string;
  especie: { id_especie: number; nombre_comun: string };
  taxonomia: { id_taxonomia: number; nombre_clase: string };
  edad_estimada_meses: number | null;
  resumen: ResumenPlanVacunas;
  vacunas: ItemPlanVacunas[];
}

/** Animal con el resumen de su plan de vacunas (para el listado). */
export interface PlanVacunasResumen {
  total: number;
  al_dia: number;
  vencidas: number;
  pendientes: number;
}

/** Animal con estado y plan resumido (para el listado de consultas). */
export interface AnimalPlanResumen {
  id_animal: string;
  codigo_identificador: string;
  nombre: string;
  estado: EstadoAnimal | string;
  foto_principal: string | null;
  especie: {
    id_especie: number;
    nombre_comun: string;
    taxonomia: { id_taxonomia: number; nombre_clase: string };
  };
  plan: PlanVacunasResumen;
}
