import { pedir } from "@/src/services/common/http";
import type {
  BackupInput,
  FiltroBitacora,
} from "@/src/services/security/security-validation";
import type {
  Backup,
  BitacoraAcceso,
  BitacoraAuditoria,
  BitacoraBackup,
} from "@/src/types/bitacora";

export interface AccesoConUsuario extends BitacoraAcceso {
  usuario: { id_usuario: string; nombre: string; apellido: string } | null;
}

export interface AuditoriaConUsuario extends BitacoraAuditoria {
  usuario: { id_usuario: string; nombre: string; apellido: string } | null;
}

export interface BackupConEjecutor extends Backup {
  ejecutor: { id_usuario: string; nombre: string; apellido: string } | null;
}

const BASE = "/api/admin/security";

function query(filtro: FiltroBitacora): string {
  const params = new URLSearchParams();
  if (filtro.desde) params.set("desde", filtro.desde);
  if (filtro.hasta) params.set("hasta", filtro.hasta);
  if (filtro.id_usuario) params.set("id_usuario", filtro.id_usuario);
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

export async function obtenerBackups(): Promise<BackupConEjecutor[]> {
  const data = await pedir<{ backups: BackupConEjecutor[] }>(`${BASE}/backups`);
  return data.backups;
}

export async function obtenerBitacoraBackups(
  idBackup: string,
): Promise<BitacoraBackup[]> {
  const data = await pedir<{ bitacoras: BitacoraBackup[] }>(
    `${BASE}/backups/${idBackup}`,
  );
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

export async function eliminarBackup(id: string): Promise<void> {
  await pedir(`${BASE}/backups/${id}`, { method: "DELETE" });
}
