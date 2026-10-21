import { pedir } from "@/src/services/common/http";
import type {
  EspecieConRelaciones,
  EspecieInput,
  TaxonomiaConEspecies,
  TaxonomiaInput,
} from "@/src/types/classification";

const BASE = "/api/admin/classifications";

export async function obtenerEspecies(): Promise<EspecieConRelaciones[]> {
  const data = await pedir<{ especies: EspecieConRelaciones[] }>(`${BASE}/species`);
  return data.especies;
}

export async function obtenerTaxonomias(): Promise<TaxonomiaConEspecies[]> {
  const data = await pedir<{ taxonomias: TaxonomiaConEspecies[] }>(`${BASE}/taxonomies`);
  return data.taxonomias;
}

export async function obtenerClasificaciones(): Promise<{
  especies: EspecieConRelaciones[];
  taxonomias: TaxonomiaConEspecies[];
}> {
  const [especies, taxonomias] = await Promise.all([
    obtenerEspecies(),
    obtenerTaxonomias(),
  ]);
  return { especies, taxonomias };
}

export async function crearEspecie(input: EspecieInput): Promise<EspecieConRelaciones> {
  const data = await pedir<{ especie: EspecieConRelaciones }>(`${BASE}/species`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.especie;
}

export async function actualizarEspecie(
  id: number,
  input: Partial<EspecieInput>,
): Promise<EspecieConRelaciones> {
  const data = await pedir<{ especie: EspecieConRelaciones }>(`${BASE}/species/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.especie;
}

export async function eliminarEspecie(id: number): Promise<void> {
  await pedir(`${BASE}/species/${id}`, { method: "DELETE" });
}

export async function crearTaxonomia(input: TaxonomiaInput): Promise<TaxonomiaConEspecies> {
  const data = await pedir<{ taxonomia: TaxonomiaConEspecies }>(`${BASE}/taxonomies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.taxonomia;
}

export async function actualizarTaxonomia(
  id: number,
  input: TaxonomiaInput,
): Promise<TaxonomiaConEspecies> {
  const data = await pedir<{ taxonomia: TaxonomiaConEspecies }>(
    `${BASE}/taxonomies/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.taxonomia;
}

export async function eliminarTaxonomia(id: number): Promise<void> {
  await pedir(`${BASE}/taxonomies/${id}`, { method: "DELETE" });
}
