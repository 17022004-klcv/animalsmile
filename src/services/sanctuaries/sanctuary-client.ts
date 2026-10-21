import { pedir } from "@/src/services/common/http";
import type {
  SantuarioInput,
  TrasladoInput,
} from "@/src/services/sanctuaries/sanctuary-validation";
import type { Santuario, Traslado } from "@/src/types/animal";

export interface SantuarioConTraslados extends Santuario {
  _count?: { traslados: number };
}

export interface TrasladoConRelaciones extends Traslado {
  animal: { id_animal: string; nombre: string; codigo_identificador: string };
  santuario: { id_santuario: string; nombre: string };
}

const BASE = "/api/admin/sanctuaries";

export async function obtenerSantuarios(): Promise<SantuarioConTraslados[]> {
  const data = await pedir<{ santuarios: SantuarioConTraslados[] }>(BASE);
  return data.santuarios;
}

export async function crearSantuario(
  input: SantuarioInput,
): Promise<SantuarioConTraslados> {
  const data = await pedir<{ santuario: SantuarioConTraslados }>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.santuario;
}

export async function actualizarSantuario(
  id: string,
  input: Partial<SantuarioInput>,
): Promise<SantuarioConTraslados> {
  const data = await pedir<{ santuario: SantuarioConTraslados }>(
    `${BASE}/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.santuario;
}

export async function eliminarSantuario(id: string): Promise<void> {
  await pedir(`${BASE}/${id}`, { method: "DELETE" });
}

export async function obtenerTraslados(): Promise<TrasladoConRelaciones[]> {
  const data = await pedir<{ traslados: TrasladoConRelaciones[] }>(
    `${BASE}/transfers`,
  );
  return data.traslados;
}

export async function crearTraslado(
  input: TrasladoInput,
): Promise<Traslado> {
  const data = await pedir<{ traslado: Traslado }>(`${BASE}/transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.traslado;
}

export async function eliminarTraslado(id: string): Promise<void> {
  await pedir(`${BASE}/transfers/${id}`, { method: "DELETE" });
}
