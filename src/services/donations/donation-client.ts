import { pedir } from "@/src/services/common/http";
import type {
  DonacionEspecieInput,
  DonacionFinancieraInput,
} from "@/src/services/donations/donation-validation";
import type { DonacionConRegistrador } from "@/src/types/donacion";

const BASE = "/api/admin/donations/financial";
const BASE_ESPECIE = "/api/admin/donations/kind";

export async function obtenerDonacionesFinancieras(): Promise<
  DonacionConRegistrador[]
> {
  const data = await pedir<{ donaciones: DonacionConRegistrador[] }>(BASE);
  return data.donaciones;
}

export async function obtenerDonacionFinanciera(
  id: string,
): Promise<DonacionConRegistrador> {
  const data = await pedir<{ donacion: DonacionConRegistrador }>(
    `${BASE}/${encodeURIComponent(id)}`,
  );
  return data.donacion;
}

export async function crearDonacionFinanciera(
  input: DonacionFinancieraInput,
): Promise<DonacionConRegistrador> {
  const data = await pedir<{ donacion: DonacionConRegistrador }>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.donacion;
}

export async function actualizarDonacionFinanciera(
  id: string,
  input: DonacionFinancieraInput,
): Promise<DonacionConRegistrador> {
  const data = await pedir<{ donacion: DonacionConRegistrador }>(
    `${BASE}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.donacion;
}

export async function eliminarDonacionFinanciera(id: string): Promise<void> {
  await pedir(`${BASE}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function obtenerDonacionesEspecie(): Promise<
  DonacionConRegistrador[]
> {
  const data = await pedir<{ donaciones: DonacionConRegistrador[] }>(
    BASE_ESPECIE,
  );
  return data.donaciones;
}

export async function obtenerDonacionEspecie(
  id: string,
): Promise<DonacionConRegistrador> {
  const data = await pedir<{ donacion: DonacionConRegistrador }>(
    `${BASE_ESPECIE}/${encodeURIComponent(id)}`,
  );
  return data.donacion;
}

export async function crearDonacionEspecie(
  input: DonacionEspecieInput,
): Promise<DonacionConRegistrador> {
  const data = await pedir<{ donacion: DonacionConRegistrador }>(
    BASE_ESPECIE,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.donacion;
}

export async function actualizarDonacionEspecie(
  id: string,
  input: DonacionEspecieInput,
): Promise<DonacionConRegistrador> {
  const data = await pedir<{ donacion: DonacionConRegistrador }>(
    `${BASE_ESPECIE}/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.donacion;
}

export async function eliminarDonacionEspecie(id: string): Promise<void> {
  await pedir(`${BASE_ESPECIE}/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
