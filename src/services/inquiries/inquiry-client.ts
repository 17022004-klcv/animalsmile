import { pedir } from "@/src/services/common/http";
import type {
  CatalogosMedicos,
  ConsultaConRelaciones,
  DetalleAnimalConsultas,
  ItemCatalogo,
} from "@/src/services/inquiries/inquiry-validation";
import type {
  ConsultaActualizacion,
  PlanVacunasResumen,
} from "@/src/types/inquiry";

const BASE = "/api/admin/inquiries";

export type AnimalConConsultas = {
  id_animal: string;
  codigo_identificador: string;
  nombre: string;
  estado: string;
  foto_principal: string | null;
  edad_estimada_meses: number | null;
  especie: {
    id_especie: number;
    nombre_comun: string;
    taxonomia: { id_taxonomia: number; nombre_clase: string };
  };
  plan: PlanVacunasResumen;
  ultima_consulta: string | null;
  total_consultas: number;
};

export async function obtenerAnimalesConConsultas(): Promise<
  AnimalConConsultas[]
> {
  const data = await pedir<{ animales: AnimalConConsultas[] }>(
    `${BASE}/animales`,
  );
  return data.animales;
}

export async function obtenerAnimalConConsultas(
  idAnimal: string,
): Promise<DetalleAnimalConsultas> {
  const data = await pedir<{ animal: DetalleAnimalConsultas }>(
    `${BASE}/animales/${idAnimal}`,
  );
  return data.animal;
}

export async function registrarConsulta(
  idAnimal: string,
  input: Omit<ConsultaActualizacion, "id_animal">,
): Promise<ConsultaConRelaciones> {
  const data = await pedir<{ consulta: ConsultaConRelaciones }>(
    `${BASE}/animales/${idAnimal}/consultas`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.consulta;
}

export async function actualizarConsulta(
  idConsulta: string,
  input: ConsultaActualizacion,
): Promise<ConsultaConRelaciones> {
  const data = await pedir<{ consulta: ConsultaConRelaciones }>(
    `${BASE}/consultas/${idConsulta}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.consulta;
}

export async function eliminarConsulta(idConsulta: string): Promise<void> {
  await pedir(`${BASE}/consultas/${idConsulta}`, { method: "DELETE" });
}

export async function obtenerCatalogos(): Promise<CatalogosMedicos> {
  return pedir<CatalogosMedicos>(`${BASE}/catalogos`);
}

export async function crearCatalogo(
  tipo: "vacuna" | "medicamento" | "enfermedad",
  datos: Record<string, unknown>,
): Promise<ItemCatalogo> {
  const data = await pedir<{ item: ItemCatalogo }>(`${BASE}/catalogos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...datos, tipo }),
  });
  return data.item;
}

export async function actualizarCatalogo(
  tipo: "vacuna" | "medicamento" | "enfermedad",
  id: number,
  datos: Record<string, unknown>,
): Promise<ItemCatalogo> {
  const data = await pedir<{ item: ItemCatalogo }>(
    `${BASE}/catalogos/${tipo}/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    },
  );
  return data.item;
}

export async function eliminarCatalogo(
  tipo: "vacuna" | "medicamento" | "enfermedad",
  id: number,
): Promise<void> {
  await pedir(`${BASE}/catalogos/${tipo}/${id}`, { method: "DELETE" });
}
