import type { ResultadoParseo } from "@/src/types/common";
import type { TipoBackup } from "@/src/types/enums";
import { TIPOS_BACKUP } from "@/src/types/enums";

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

  const limiteNum = Number(b.limite);
  const limite =
    Number.isInteger(limiteNum) && limiteNum > 0 && limiteNum <= 500
      ? limiteNum
      : 100;

  return { ok: true, valor: { desde, hasta, id_usuario: idUsuario, limite } };
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
