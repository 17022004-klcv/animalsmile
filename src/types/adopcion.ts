import type { EstadoSolicitud } from "@/src/types/enums";

/** Modelo `Solicitante` (tabla `solicitantes`). */
export interface Solicitante {
  id_solicitante: string;
  documento_identidad: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo_vivienda: string | null;
  tiene_mascotas: boolean | null;
  creado_en: string | null;
}

/** Modelo `SolicitudAdopcion` (tabla `solicitudes_adopcion`). */
export interface SolicitudAdopcion {
  id_solicitud: string;
  id_solicitante: string;
  id_animal: string;
  fecha_solicitud: string | null;
  estado: EstadoSolicitud;
  evaluador_id: string | null;
  notas_evaluacion: string | null;
  actualizado_en: string | null;
}

/** Modelo `Adopcion` (tabla `adopciones`). */
export interface Adopcion {
  id_adopcion: string;
  id_solicitud: string;
  fecha_adopcion: string;
  contrato_firmado_url: string | null;
  encargado_id: string | null;
  creado_en: string | null;
}

/** Modelo `SeguimientoPostAdopcion` (tabla `seguimientos_post_adopcion`). */
export interface SeguimientoPostAdopcion {
  id_seguimiento: string;
  id_adopcion: string;
  num_mes: number;
  fecha_programada: string;
  fecha_realizada: string | null;
  estado_evaluacion: string | null;
  observaciones: string | null;
  evidencias_fotos: string[] | null;
  realizado_por: string | null;
}
