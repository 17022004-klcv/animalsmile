import type { ResultadoParseo } from "@/src/types/common";
import {
  TIPOS_CONSULTA,
  type ConsultaActualizacion,
  type ConsultaInput,
  type MedicamentoInput,
  type PlanVacunas,
  type VacunaInput,
} from "@/src/types/inquiry";

function textoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

function enteroOpcional(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.trunc(numero) : null;
}

function decimalOpcional(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function fechaOpcional(valor: unknown): string | null {
  const texto = textoOpcional(valor);
  if (!texto) return null;
  return Number.isNaN(new Date(texto).getTime()) ? null : texto;
}

/** Normaliza la lista de vacunas aplicadas dentro de una consulta. */
export function parseVacunasInput(raw: unknown): VacunaInput[] {
  if (!Array.isArray(raw)) return [];

  const resultado: VacunaInput[] = [];
  const vistas = new Set<number>();

  for (const item of raw) {
    const registro = (item ?? {}) as Record<string, unknown>;
    const idVacuna = enteroOpcional(registro.id_vacuna);
    if (!idVacuna || vistas.has(idVacuna)) continue;
    vistas.add(idVacuna);

    resultado.push({
      id_vacuna: idVacuna,
      lote: textoOpcional(registro.lote),
      fecha_aplicacion: fechaOpcional(registro.fecha_aplicacion),
      proxima_dosis: fechaOpcional(registro.proxima_dosis),
      observaciones: textoOpcional(registro.observaciones),
    });
  }

  return resultado;
}

/** Normaliza la lista de medicamentos administrados dentro de una consulta. */
export function parseMedicamentosInput(raw: unknown): MedicamentoInput[] {
  if (!Array.isArray(raw)) return [];

  const resultado: MedicamentoInput[] = [];
  const vistas = new Set<number>();

  for (const item of raw) {
    const registro = (item ?? {}) as Record<string, unknown>;
    const idMedicamento = enteroOpcional(registro.id_medicamento);
    if (!idMedicamento || vistas.has(idMedicamento)) continue;
    vistas.add(idMedicamento);

    resultado.push({
      id_medicamento: idMedicamento,
      dosis: textoOpcional(registro.dosis),
      via_administracion: textoOpcional(registro.via_administracion),
      fecha_aplicacion: fechaOpcional(registro.fecha_aplicacion),
      observaciones: textoOpcional(registro.observaciones),
    });
  }

  return resultado;
}

/** Valida y normaliza la creación de una consulta veterinaria. */
export function parseConsultaInput(raw: unknown): ResultadoParseo<ConsultaInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const idAnimal = textoOpcional(b.id_animal);
  if (!idAnimal) {
    return { ok: false, error: "El animal es obligatorio." };
  }

  const tipo = textoOpcional(b.tipo_consulta) ?? "Consulta_General";
  if (!TIPOS_CONSULTA.includes(tipo as (typeof TIPOS_CONSULTA)[number])) {
    return { ok: false, error: "El tipo de consulta no es válido." };
  }

  const motivo = textoOpcional(b.motivo);
  if (!motivo) {
    return { ok: false, error: "El motivo de la consulta es obligatorio." };
  }

  const peso = decimalOpcional(b.peso_kg);
  if (peso !== null && peso <= 0) {
    return { ok: false, error: "El peso debe ser mayor que cero." };
  }

  return {
    ok: true,
    valor: {
      id_animal: idAnimal,
      tipo_consulta: tipo,
      fecha_consulta: fechaOpcional(b.fecha_consulta),
      motivo,
      diagnostico: textoOpcional(b.diagnostico),
      tratamiento: textoOpcional(b.tratamiento),
      id_enfermedad: enteroOpcional(b.id_enfermedad),
      peso_kg: peso,
      proxima_cita: fechaOpcional(b.proxima_cita),
      observaciones: textoOpcional(b.observaciones),
      vacunas: parseVacunasInput(b.vacunas),
      medicamentos: parseMedicamentosInput(b.medicamentos),
    },
  };
}

/** Valida y normaliza la actualización de una consulta veterinaria. */
export function parseConsultaActualizacion(
  raw: unknown,
): ResultadoParseo<ConsultaActualizacion> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const tipo = textoOpcional(b.tipo_consulta) ?? "Consulta_General";
  if (!TIPOS_CONSULTA.includes(tipo as (typeof TIPOS_CONSULTA)[number])) {
    return { ok: false, error: "El tipo de consulta no es válido." };
  }

  const motivo = textoOpcional(b.motivo);
  if (!motivo) {
    return { ok: false, error: "El motivo de la consulta es obligatorio." };
  }

  const peso = decimalOpcional(b.peso_kg);
  if (peso !== null && peso <= 0) {
    return { ok: false, error: "El peso debe ser mayor que cero." };
  }

  return {
    ok: true,
    valor: {
      tipo_consulta: tipo,
      fecha_consulta: fechaOpcional(b.fecha_consulta),
      motivo,
      diagnostico: textoOpcional(b.diagnostico),
      tratamiento: textoOpcional(b.tratamiento),
      id_enfermedad: enteroOpcional(b.id_enfermedad),
      peso_kg: peso,
      proxima_cita: fechaOpcional(b.proxima_cita),
      observaciones: textoOpcional(b.observaciones),
      vacunas: parseVacunasInput(b.vacunas),
      medicamentos: parseMedicamentosInput(b.medicamentos),
    },
  };
}

// =============================================================================
// MODELOS DE VISTA (consumidos por la página del módulo)
// =============================================================================

/** Vacuna aplicada dentro de una consulta, con el detalle del catálogo. */
export interface VacunaAplicadaDetalle {
  id_aplicacion: string;
  id_vacuna: number;
  lote: string | null;
  fecha_aplicacion: string | null;
  proxima_dosis: string | null;
  observaciones: string | null;
  vacuna: {
    id_vacuna: number;
    nombre: string;
    descripcion: string | null;
    dosis_recomendada: string | null;
    intervalo_dias: number | null;
    edad_minima_meses: number | null;
  };
}

/** Medicamento administrado dentro de una consulta. */
export interface MedicamentoAplicadoDetalle {
  id_aplicacion: string;
  id_medicamento: number;
  dosis: string | null;
  via_administracion: string | null;
  fecha_aplicacion: string | null;
  observaciones: string | null;
  medicamento: {
    id_medicamento: number;
    nombre: string;
    descripcion: string | null;
    vias: string | null;
  };
}

/** Consulta con vacunas, medicamentos y enfermedad asociada. */
export interface ConsultaConRelaciones {
  id_consulta: string;
  id_expediente: string;
  id_veterinario: string | null;
  id_enfermedad: number | null;
  fecha_consulta: string | null;
  tipo_consulta: string;
  motivo: string;
  diagnostico: string | null;
  tratamiento: string | null;
  peso_kg: number | null;
  proxima_cita: string | null;
  observaciones: string | null;
  registrado_por: string | null;
  creado_en: string | null;
  enfermedad: {
    id_enfermedad: number;
    nombre: string;
    es_contagiosa: boolean | null;
    requiere_aislamiento: boolean | null;
  } | null;
  vacunas: VacunaAplicadaDetalle[];
  medicamentos: MedicamentoAplicadoDetalle[];
  veterinario: {
    id_usuario: string;
    nombre: string;
    apellido: string;
  } | null;
}

/** Detalle completo de un animal con su plan de vacunas y consultas. */
export interface DetalleAnimalConsultas {
  id_animal: string;
  codigo_identificador: string;
  nombre: string;
  estado: string;
  foto_principal: string | null;
  edad_estimada_meses: number | null;
  raza_variedad: string | null;
  especie: {
    id_especie: number;
    nombre_comun: string;
    taxonomia: { id_taxonomia: number; nombre_clase: string };
  };
  expediente: {
    id_expediente: string;
    esterilizado: boolean | null;
    fecha_esterilizacion: string | null;
    observaciones_generales: string | null;
  } | null;
  plan: PlanVacunas;
  consultas: ConsultaConRelaciones[];
}

/** Elemento de catálogo devuelto por la API de catálogos. */
export interface ItemCatalogo {
  id_vacuna?: number;
  id_medicamento?: number;
  id_enfermedad?: number;
  nombre: string;
  descripcion: string | null;
  vias?: string | null;
  es_contagiosa?: boolean | null;
  requiere_aislamiento?: boolean | null;
  edad_minima_meses?: number | null;
  intervalo_dias?: number | null;
  dosis_recomendada?: string | null;
  id_especie?: number | null;
  id_taxonomia?: number | null;
  alcance?: string;
  especie?: { id_especie: number; nombre_comun: string } | null;
  taxonomia?: { id_taxonomia: number; nombre_clase: string } | null;
  activa?: boolean | null;
  activo?: boolean | null;
}

/** Catálogos médicos completos. */
export interface CatalogosMedicos {
  vacunas: ItemCatalogo[];
  medicamentos: ItemCatalogo[];
  enfermedades: ItemCatalogo[];
}
