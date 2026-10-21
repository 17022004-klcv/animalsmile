import { pedir } from "@/src/services/common/http";
import type { DonacionInput } from "@/src/services/donations/donation-validation";
import type { Donacion } from "@/src/types/donacion";

const BASE = "/api/admin/donations";

export async function obtenerDonaciones(): Promise<Donacion[]> {
  const data = await pedir<{ donaciones: Donacion[] }>(BASE);
  return data.donaciones;
}

export async function obtenerDonacion(id: string): Promise<Donacion> {
  const data = await pedir<{ donacion: Donacion }>(`${BASE}/${id}`);
  return data.donacion;
}

export async function crearDonacion(input: DonacionInput): Promise<Donacion> {
  const data = await pedir<{ donacion: Donacion }>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.donacion;
}

export async function eliminarDonacion(id: string): Promise<void> {
  await pedir(`${BASE}/${id}`, { method: "DELETE" });
}
