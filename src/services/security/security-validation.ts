import type { ResultadoParseo } from "@/src/types/common";
import type {
  EstadoBackup,
  TipoBackup,
  TipoEventoAcceso,
} from "@/src/types/enums";
import {
  ESTADOS_BACKUP,
  TIPOS_BACKUP,
  TIPOS_EVENTO_ACCESO,
} from "@/src/types/enums";

export type BackupInput = {
  nombre_archivo: string;
  ruta_almacenamiento: string;
  tipo_backup: TipoBackup;
  hash_checksum: string | null;
  es_automatico: boolean;
};

export type BitacoraAuditoriaInput = {
  tabla_afectada: string;
  id_registro_afectado: string | null;
  operacion: "INSERT" | "UPDATE" | "DELETE" | "SOFT_DELETE";
  datos_anteriores: unknown | null;
  datos_nuevos: unknown | null;
  ip_origen: string | null;
};

/** Filtros comunes para consultar bitácoras. */
export type FiltroBitacora = {
  desde: string | null;
  hasta: string | null;
  id_usuario: string | null;
  tipo_evento: TipoEventoAcceso | null;
  exito: boolean | null;
  busqueda: string | null;
  limite: number;
};

/** Normaliza los filtros de consulta de bitácoras. */
export function parseFiltroBitacora(
  raw: unknown,
): ResultadoParseo<FiltroBitacora> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const desde = typeof b.desde === "string" && b.desde ? b.desde : null;
  const hasta = typeof b.hasta === "string" && b.hasta ? b.hasta : null;
  const idUsuario =
    typeof b.id_usuario === "string" && b.id_usuario ? b.id_usuario : null;

  const tipoEventoRaw =
    typeof b.tipo_evento === "string" && b.tipo_evento ? b.tipo_evento : null;
  if (
    tipoEventoRaw &&
    !(TIPOS_EVENTO_ACCESO as readonly string[]).includes(tipoEventoRaw)
  ) {
    return { ok: false, error: "El tipo de evento no es válido." };
  }

  let exito: boolean | null = null;
  if (b.exito === true || b.exito === "true") exito = true;
  else if (b.exito === false || b.exito === "false") exito = false;

  const busqueda =
    typeof b.busqueda === "string" && b.busqueda.trim()
      ? b.busqueda.trim().slice(0, 150)
      : null;

  const limiteNum = Number(b.limite);
  const limite =
    Number.isInteger(limiteNum) && limiteNum > 0 && limiteNum <= 500
      ? limiteNum
      : 500;

  return {
    ok: true,
    valor: {
      desde,
      hasta,
      id_usuario: idUsuario,
      tipo_evento: tipoEventoRaw as TipoEventoAcceso | null,
      exito,
      busqueda,
      limite,
    },
  };
}

/** Filtros de consulta para el listado de backups. */
export type FiltroBackup = {
  desde: string | null;
  hasta: string | null;
  tipo_backup: TipoBackup | null;
  estado: EstadoBackup | null;
  busqueda: string | null;
  limite: number;
};

/** Datos para actualizar el estado de un backup. */
export type CambioEstadoBackupInput = {
  estado: EstadoBackup;
  detalle_error: string | null;
  tamano_bytes: number | null;
  hash_checksum: string | null;
};

/** Normaliza los filtros de consulta de backups. */
export function parseFiltroBackup(raw: unknown): ResultadoParseo<FiltroBackup> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const desde = typeof b.desde === "string" && b.desde ? b.desde : null;
  const hasta = typeof b.hasta === "string" && b.hasta ? b.hasta : null;

  const tipoRaw =
    typeof b.tipo_backup === "string" && b.tipo_backup ? b.tipo_backup : null;
  if (tipoRaw && !(TIPOS_BACKUP as readonly string[]).includes(tipoRaw)) {
    return { ok: false, error: "El tipo de backup no es válido." };
  }

  const estadoRaw =
    typeof b.estado === "string" && b.estado ? b.estado : null;
  if (
    estadoRaw &&
    !(ESTADOS_BACKUP as readonly string[]).includes(estadoRaw)
  ) {
    return { ok: false, error: "El estado del backup no es válido." };
  }

  const busqueda =
    typeof b.busqueda === "string" && b.busqueda.trim()
      ? b.busqueda.trim().slice(0, 150)
      : null;

  const limiteNum = Number(b.limite);
  const limite =
    Number.isInteger(limiteNum) && limiteNum > 0 && limiteNum <= 500
      ? limiteNum
      : 500;

  return {
    ok: true,
    valor: {
      desde,
      hasta,
      tipo_backup: tipoRaw as TipoBackup | null,
      estado: estadoRaw as EstadoBackup | null,
      busqueda,
      limite,
    },
  };
}

/** Valida y normaliza el cambio de estado de un backup. */
export function parseCambioEstadoBackup(
  raw: unknown,
): ResultadoParseo<CambioEstadoBackupInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  if (
    typeof b.estado !== "string" ||
    !(ESTADOS_BACKUP as readonly string[]).includes(b.estado)
  ) {
    return { ok: false, error: "El estado del backup no es válido." };
  }

  let tamano: number | null = null;
  if (b.tamano_bytes !== undefined && b.tamano_bytes !== null && b.tamano_bytes !== "") {
    const numero = Number(b.tamano_bytes);
    if (!Number.isInteger(numero) || numero < 0) {
      return { ok: false, error: "El tamaño del backup no es válido." };
    }
    tamano = numero;
  }

  return {
    ok: true,
    valor: {
      estado: b.estado as EstadoBackup,
      detalle_error:
        typeof b.detalle_error === "string" && b.detalle_error.trim()
          ? b.detalle_error.trim().slice(0, 2000)
          : null,
      tamano_bytes: tamano,
      hash_checksum:
        typeof b.hash_checksum === "string" && b.hash_checksum.trim()
          ? b.hash_checksum.trim()
          : null,
    },
  };
}

/** Valida y normaliza el registro de un backup. */
export function parseBackupInput(raw: unknown): ResultadoParseo<BackupInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const nombre = typeof b.nombre_archivo === "string" ? b.nombre_archivo.trim() : "";
  if (!nombre) return { ok: false, error: "El nombre del archivo es obligatorio." };

  const ruta =
    typeof b.ruta_almacenamiento === "string" ? b.ruta_almacenamiento.trim() : "";
  if (!ruta) {
    return { ok: false, error: "La ruta de almacenamiento es obligatoria." };
  }

  if (
    typeof b.tipo_backup !== "string" ||
    !(TIPOS_BACKUP as readonly string[]).includes(b.tipo_backup)
  ) {
    return { ok: false, error: "El tipo de backup no es válido." };
  }

  return {
    ok: true,
    valor: {
      nombre_archivo: nombre,
      ruta_almacenamiento: ruta,
      tipo_backup: b.tipo_backup as TipoBackup,
      hash_checksum:
        typeof b.hash_checksum === "string" && b.hash_checksum.trim()
          ? b.hash_checksum.trim()
          : null,
      es_automatico: b.es_automatico !== false,
    },
  };
}
