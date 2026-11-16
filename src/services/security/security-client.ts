import { pedir } from "@/src/services/common/http";
import type {
  BackupInput,
  CambioEstadoBackupInput,
  FiltroBackup,
  FiltroBitacora,
} from "@/src/services/security/security-validation";
import type {
  AccesoConUsuario,
  Backup,
  BackupConEjecutor,
  BackupDetalle,
  BitacoraAuditoria,
  BitacoraBackupConUsuario,
} from "@/src/types/bitacora";

export type {
  AccesoConUsuario,
  BackupConEjecutor,
  BackupDetalle,
} from "@/src/types/bitacora";

export interface AuditoriaConUsuario extends BitacoraAuditoria {
  usuario: { id_usuario: string; nombre: string; apellido: string } | null;
}

const BASE = "/api/admin/security";

function query(filtro: FiltroBitacora): string {
  const params = new URLSearchParams();
  if (filtro.desde) params.set("desde", filtro.desde);
  if (filtro.hasta) params.set("hasta", filtro.hasta);
  if (filtro.id_usuario) params.set("id_usuario", filtro.id_usuario);
  if (filtro.tipo_evento) params.set("tipo_evento", filtro.tipo_evento);
  if (filtro.exito !== null) params.set("exito", String(filtro.exito));
  if (filtro.busqueda) params.set("busqueda", filtro.busqueda);
  params.set("limite", String(filtro.limite));
  return params.toString();
}

function queryBackup(filtro: FiltroBackup): string {
  const params = new URLSearchParams();
  if (filtro.desde) params.set("desde", filtro.desde);
  if (filtro.hasta) params.set("hasta", filtro.hasta);
  if (filtro.tipo_backup) params.set("tipo_backup", filtro.tipo_backup);
  if (filtro.estado) params.set("estado", filtro.estado);
  if (filtro.busqueda) params.set("busqueda", filtro.busqueda);
  params.set("limite", String(filtro.limite));
  return params.toString();
}

export async function obtenerAccesos(
  filtro: FiltroBitacora,
): Promise<AccesoConUsuario[]> {
  const data = await pedir<{ accesos: AccesoConUsuario[] }>(
    `${BASE}/access?${query(filtro)}`,
  );
  return data.accesos;
}

export async function obtenerAuditoria(
  filtro: FiltroBitacora,
): Promise<AuditoriaConUsuario[]> {
  const data = await pedir<{ auditoria: AuditoriaConUsuario[] }>(
    `${BASE}/audit?${query(filtro)}`,
  );
  return data.auditoria;
}

export async function obtenerBackups(
  filtro: FiltroBackup,
): Promise<BackupConEjecutor[]> {
  const data = await pedir<{ backups: BackupConEjecutor[] }>(
    `${BASE}/backups?${queryBackup(filtro)}`,
  );
  return data.backups;
}

export async function obtenerBackupDetalle(id: string): Promise<BackupDetalle> {
  const data = await pedir<{ backup: BackupDetalle }>(
    `${BASE}/backups/${encodeURIComponent(id)}`,
  );
  return data.backup;
}

export async function obtenerBitacoraBackups(
  idBackup: string,
): Promise<BitacoraBackupConUsuario[]> {
  const data = await obtenerBackupDetalle(idBackup);
  return data.bitacoras;
}

export async function registrarBackup(input: BackupInput): Promise<Backup> {
  const data = await pedir<{ backup: Backup }>(`${BASE}/backups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.backup;
}

export async function cambiarEstadoBackup(
  id: string,
  input: CambioEstadoBackupInput,
): Promise<Backup> {
  const data = await pedir<{ backup: Backup }>(
    `${BASE}/backups/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.backup;
}

export async function eliminarBackup(id: string): Promise<void> {
  await pedir(`${BASE}/backups/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
