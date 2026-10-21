import type {
  AccionBitacora,
  EstadoBackup,
  OperacionAuditoria,
  TipoBackup,
  TipoEventoAcceso,
} from "@/src/types/enums";

/** Modelo `BitacoraAcceso` (tabla `bitacora_accesos`). */
export interface BitacoraAcceso {
  id_acceso: string;
  id_usuario: string | null;
  email_intentado: string | null;
  tipo_evento: TipoEventoAcceso;
  ip_origen: string | null;
  user_agent: string | null;
  exito: boolean;
  detalle: string | null;
  fecha_evento: string | null;
}

/** Modelo `BitacoraRescate` (tabla `bitacora_rescates`). */
export interface BitacoraRescate {
  id_bitacora_rescate: string;
  id_rescate: string;
  id_usuario: string | null;
  accion: AccionBitacora;
  descripcion: string | null;
  datos_anteriores: unknown | null;
  datos_nuevos: unknown | null;
  fecha_evento: string | null;
}

/** Modelo `BitacoraAuditoria` (tabla `bitacora_auditoria`). */
export interface BitacoraAuditoria {
  id_auditoria: string;
  id_usuario: string | null;
  tabla_afectada: string;
  id_registro_afectado: string | null;
  operacion: OperacionAuditoria;
  datos_anteriores: unknown | null;
  datos_nuevos: unknown | null;
  ip_origen: string | null;
  fecha_evento: string | null;
}

/** Modelo `Backup` (tabla `backups`). */
export interface Backup {
  id_backup: string;
  nombre_archivo: string;
  ruta_almacenamiento: string;
  tipo_backup: TipoBackup;
  tamano_bytes: bigint | null;
  hash_checksum: string | null;
  estado: EstadoBackup;
  ejecutado_por: string | null;
  es_automatico: boolean | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  detalle_error: string | null;
}

/** Modelo `BitacoraBackup` (tabla `bitacora_backups`). */
export interface BitacoraBackup {
  id_bitacora_backup: string;
  id_backup: string;
  id_usuario: string | null;
  accion: AccionBitacora;
  descripcion: string | null;
  ip_origen: string | null;
  fecha_evento: string | null;
}
