import { pedir } from "@/src/services/common/http";
import type {
  ExpedienteConRelaciones,
  ExpedienteInput,
  ExpedienteListado,
  HistorialClinico,
  HistorialInput,
} from "@/src/services/medical/medical-validation";

const BASE = "/api/admin/medical";

export async function obtenerExpedientes(): Promise<ExpedienteListado[]> {
  const data = await pedir<{ expedientes: ExpedienteListado[] }>(BASE);
  return data.expedientes;
}

export async function obtenerExpediente(
  idAnimal: string,
): Promise<ExpedienteConRelaciones | null> {
  const data = await pedir<{ expediente: ExpedienteConRelaciones | null }>(
    `${BASE}/${idAnimal}`,
  );
  return data.expediente;
}

export async function guardarExpediente(
  idAnimal: string,
  input: ExpedienteInput,
): Promise<ExpedienteConRelaciones> {
  const data = await pedir<{ expediente: ExpedienteConRelaciones }>(
    `${BASE}/${idAnimal}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.expediente;
}

export async function agregarHistorial(
  idExpediente: string,
  input: HistorialInput,
): Promise<HistorialClinico> {
  const data = await pedir<{ historial: HistorialClinico }>(
    `${BASE}/${idExpediente}/history`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.historial;
}

export async function eliminarHistorial(id: string): Promise<void> {
  await pedir(`${BASE}/history/${id}`, { method: "DELETE" });
}
