import { json, pedir } from "@/src/services/common/http";
import type { Solicitante } from "@/src/types/adopcion";
import type {
  SolicitanteConConteo,
  SolicitanteInput,
} from "@/src/types/solicitantes";

const BASE = "/api/admin/adoptions/applicants";

export async function obtenerSolicitantes(): Promise<SolicitanteConConteo[]> {
  const data = await pedir<{ solicitantes: SolicitanteConConteo[] }>(BASE);
  return data.solicitantes;
}

export async function obtenerSolicitante(
  id: string,
): Promise<SolicitanteConConteo> {
  const data = await pedir<{ solicitante: SolicitanteConConteo }>(
    `${BASE}/${encodeURIComponent(id)}`,
  );
  return data.solicitante;
}

export async function crearSolicitante(
  input: SolicitanteInput,
): Promise<Solicitante> {
  const data = await pedir<{ solicitante: Solicitante }>(BASE, json(input));
  return data.solicitante;
}

export async function actualizarSolicitante(
  id: string,
  input: SolicitanteInput,
): Promise<Solicitante> {
  const data = await pedir<{ solicitante: Solicitante }>(
    `${BASE}/${encodeURIComponent(id)}`,
    { ...json(input), method: "PUT" },
  );
  return data.solicitante;
}

export async function eliminarSolicitante(id: string): Promise<void> {
  await pedir<{ ok: boolean }>(`${BASE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
