import type { AlcanceVacuna, EstadoVacuna } from "@/src/types/inquiry";

const ETIQUETAS_TIPO_CONSULTA: Record<string, string> = {
  Vacunacion: "Vacunación",
  Desparasitacion: "Desparasitación",
  Medicacion: "Medicación",
  Enfermedad: "Enfermedad",
  Consulta_General: "Consulta general",
  Cirugia: "Cirugía",
  Examen: "Examen",
  Seguimiento: "Seguimiento",
  Otro: "Otro",
};

const ETIQUETAS_ESTADO_VACUNA: Record<string, string> = {
  Al_Dia: "Al día",
  Vencida: "Vencida",
  Pendiente: "Pendiente",
  No_Corresponde: "No corresponde",
  Aplicada: "Aplicada",
};

const ETIQUETAS_ALCANCE: Record<string, string> = {
  General: "General",
  Taxonomia: "Taxonomía",
  Especie: "Especie",
};

/** Etiqueta legible para el tipo de consulta. */
export function formatearTipoConsulta(tipo: string): string {
  return ETIQUETAS_TIPO_CONSULTA[tipo] ?? tipo.replace(/_/g, " ");
}

/** Etiqueta legible para el estado de una vacuna en el plan. */
export function formatearEstadoVacuna(estado: EstadoVacuna | string): string {
  return ETIQUETAS_ESTADO_VACUNA[estado] ?? estado.replace(/_/g, " ");
}

/** Etiqueta legible para el alcance de una vacuna del catálogo. */
export function formatearAlcanceVacuna(alcance: AlcanceVacuna | string): string {
  return ETIQUETAS_ALCANCE[alcance] ?? alcance;
}

/** Clases de estilo según el estado de la vacuna. */
export function clasesEstadoVacuna(estado: EstadoVacuna | string): string {
  switch (estado) {
    case "Al_Dia":
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    case "Vencida":
      return "bg-red-50 text-red-600 border border-red-200";
    case "Pendiente":
      return "bg-amber-50 text-amber-600 border border-amber-200";
    case "No_Corresponde":
      return "bg-slate-100 text-slate-500 border border-slate-200";
    default:
      return "bg-slate-100 text-slate-500 border border-slate-200";
  }
}

/** Clases de estilo según el tipo de consulta. */
export function clasesTipoConsulta(tipo: string): string {
  switch (tipo) {
    case "Vacunacion":
      return "bg-sky-50 text-sky-600 border border-sky-200";
    case "Desparasitacion":
      return "bg-teal-50 text-teal-600 border border-teal-200";
    case "Medicacion":
      return "bg-violet-50 text-violet-600 border border-violet-200";
    case "Enfermedad":
      return "bg-rose-50 text-rose-600 border border-rose-200";
    case "Cirugia":
      return "bg-orange-50 text-orange-600 border border-orange-200";
    default:
      return "bg-slate-100 text-slate-600 border border-slate-200";
  }
}
