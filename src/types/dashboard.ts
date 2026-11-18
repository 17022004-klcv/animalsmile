import type { EstadoSolicitud } from "@/src/types/enums";

/** Periodos de tiempo soportados por los filtros del dashboard. */
export type PeriodoDashboard = "hoy" | "esta_semana" | "este_mes" | "anio";

/** Filtro de especie del dashboard. */
export type EspecieDashboard = "todas" | "perros" | "gatos";

export interface FiltroDashboard {
  periodo: PeriodoDashboard;
  especie: EspecieDashboard;
}

export interface ResumenEstadoAnimal {
  disponible: number;
  cuarentena: number;
  tratamiento: number;
  trasladado: number;
  ultimoRescate: string | null;
}

export interface ResumenSalud {
  esterilizadosPct: number;
  consultas: number;
  proximasCirugias: number;
}

export interface SolicitudResumen {
  id: string;
  solicitante: string;
  animal: string;
  codigo: string;
  estado: EstadoSolicitud | string;
}

export interface TrasladoResumen {
  id: string;
  santuario: string;
  animal: string;
  detalle: string;
  estado: string;
}

export interface ResumenInsumos {
  alimentos: number;
  medicamentos: number;
  higiene: number;
}

export interface ResumenSeguridad {
  ultimoBackup: { estado: string; fecha: string | null } | null;
  loginsFallidos: number;
  personalActivo: number;
}

export interface EstadisticasDashboard {
  generadoEn: string;
  filtro: FiltroDashboard;
  kpis: {
    capacidad: { ocupados: number; total: number; porcentaje: number };
    rescates: { total: number; variacionPct: number | null };
    solicitudes: { pendientes: number; enEntrevista: number };
    recaudacion: { total: number; meta: number; porcentaje: number };
  };
  estadoAnimal: ResumenEstadoAnimal;
  salud: ResumenSalud;
  solicitudes: SolicitudResumen[];
  traslados: TrasladoResumen[];
  seguimientosActivos: number;
  insumos: ResumenInsumos;
  seguridad: ResumenSeguridad;
}
