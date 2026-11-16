import { pedir } from "@/src/services/common/http";
import type {
  SantuarioConTraslados,
  SantuarioInput,
  SantuarioParcial,
} from "@/src/types/santuario";
import type {
  TrasladoConRelaciones,
  TrasladoInput,
} from "@/src/types/traslado";

export type { SantuarioConTraslados } from "@/src/types/santuario";
export type { TrasladoConRelaciones } from "@/src/types/traslado";

const BASE = "/api/admin/sanctuaries";

export async function obtenerSantuarios(): Promise<SantuarioConTraslados[]> {
  const data = await pedir<{ santuarios: SantuarioConTraslados[] }>(BASE);
  return data.santuarios;
}

export async function obtenerSantuario(
  id: string,
): Promise<SantuarioConTraslados> {
  const data = await pedir<{ santuario: SantuarioConTraslados }>(
    `${BASE}/${encodeURIComponent(id)}`,
  );
  return data.santuario;
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
  input: SantuarioParcial,
): Promise<SantuarioConTraslados> {
  const data = await pedir<{ santuario: SantuarioConTraslados }>(
    `${BASE}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.santuario;
}

export async function eliminarSantuario(id: string): Promise<void> {
  await pedir(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function obtenerTraslados(): Promise<TrasladoConRelaciones[]> {
  const data = await pedir<{ traslados: TrasladoConRelaciones[] }>(
    `${BASE}/transfers`,
  );
  return data.traslados;
}

export async function obtenerTraslado(
  id: string,
): Promise<TrasladoConRelaciones> {
  const data = await pedir<{ traslado: TrasladoConRelaciones }>(
    `${BASE}/transfers/${encodeURIComponent(id)}`,
  );
  return data.traslado;
}

export async function crearTraslado(
  input: TrasladoInput,
): Promise<TrasladoConRelaciones> {
  const data = await pedir<{ traslado: TrasladoConRelaciones }>(
    `${BASE}/transfers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.traslado;
}

export async function actualizarTraslado(
  id: string,
  input: TrasladoInput,
): Promise<TrasladoConRelaciones> {
  const data = await pedir<{ traslado: TrasladoConRelaciones }>(
    `${BASE}/transfers/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.traslado;
}

export async function eliminarTraslado(id: string): Promise<void> {
  await pedir(`${BASE}/transfers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
