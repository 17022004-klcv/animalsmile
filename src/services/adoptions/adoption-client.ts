import { pedir } from "@/src/services/common/http";
import type {
  AdopcionInput,
  AdopcionParcial,
  EvaluacionSolicitudInput,
  SeguimientoInput,
  SeguimientoProgramacionParcial,
  SeguimientoResultadoInput,
  SolicitudInput,
} from "@/src/services/adoptions/adoption-validation";

import type {
  Adopcion,
  AdopcionConRelaciones,
  SeguimientoConRelaciones,
  Solicitante,
  SolicitudAdopcion,
} from "@/src/types/adopcion";

export type {
  AdopcionConRelaciones,
  SeguimientoConRelaciones,
} from "@/src/types/adopcion";

export interface SolicitudConRelaciones extends SolicitudAdopcion {
  solicitante: Solicitante;
  animal: { id_animal: string; nombre: string; codigo_identificador: string };
  evaluador: { id_usuario: string; nombre: string; apellido: string } | null;
}

const BASE = "/api/admin/adoptions";

export {
  actualizarSolicitante,
  crearSolicitante,
  eliminarSolicitante,
  obtenerSolicitante,
  obtenerSolicitantes,
} from "@/src/services/applicants/applicants-client";

export async function obtenerSolicitudes(): Promise<SolicitudConRelaciones[]> {
  const data = await pedir<{ solicitudes: SolicitudConRelaciones[] }>(
    `${BASE}/applications`,
  );
  return data.solicitudes;
}

export async function crearSolicitud(
  input: SolicitudInput,
): Promise<SolicitudAdopcion> {
  const data = await pedir<{ solicitud: SolicitudAdopcion }>(
    `${BASE}/applications`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.solicitud;
}

export async function evaluarSolicitud(
  id: string,
  input: EvaluacionSolicitudInput,
): Promise<SolicitudAdopcion> {
  const data = await pedir<{ solicitud: SolicitudAdopcion }>(
    `${BASE}/applications/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.solicitud;
}

export async function obtenerAdopciones(): Promise<AdopcionConRelaciones[]> {
  const data = await pedir<{ adopciones: AdopcionConRelaciones[] }>(
    `${BASE}/contracts`,
  );
  return data.adopciones;
}

export async function crearAdopcion(input: AdopcionInput): Promise<Adopcion> {
  const data = await pedir<{ adopcion: Adopcion }>(`${BASE}/contracts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.adopcion;
}

export async function obtenerAdopcion(
  id: string,
): Promise<AdopcionConRelaciones> {
  const data = await pedir<{ adopcion: AdopcionConRelaciones }>(
    `${BASE}/contracts/${id}`,
  );
  return data.adopcion;
}

export async function actualizarAdopcion(
  id: string,
  input: AdopcionParcial,
): Promise<AdopcionConRelaciones> {
  const data = await pedir<{ adopcion: AdopcionConRelaciones }>(
    `${BASE}/contracts/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.adopcion;
}

export async function eliminarAdopcion(id: string): Promise<void> {
  await pedir(`${BASE}/contracts/${id}`, { method: "DELETE" });
}

export async function obtenerSolicitudesParaAdoptar(): Promise<
  SolicitudConRelaciones[]
> {
  const data = await pedir<{ solicitudes: SolicitudConRelaciones[] }>(
    `${BASE}/contracts/available`,
  );
  return data.solicitudes;
}

export async function obtenerSeguimientos(): Promise<
  SeguimientoConRelaciones[]
> {
  const data = await pedir<{ seguimientos: SeguimientoConRelaciones[] }>(
    `${BASE}/followup`,
  );
  return data.seguimientos;
}

export async function obtenerSeguimientosPorAdopcion(
  idAdopcion: string,
): Promise<SeguimientoConRelaciones[]> {
  const parametros = new URLSearchParams({ id_adopcion: idAdopcion });
  const data = await pedir<{ seguimientos: SeguimientoConRelaciones[] }>(
    `${BASE}/followup?${parametros.toString()}`,
  );
  return data.seguimientos;
}

export async function obtenerSeguimiento(
  id: string,
): Promise<SeguimientoConRelaciones> {
  const data = await pedir<{ seguimiento: SeguimientoConRelaciones }>(
    `${BASE}/followup/${id}`,
  );
  return data.seguimiento;
}

export async function crearSeguimiento(
  input: SeguimientoInput,
): Promise<SeguimientoConRelaciones> {
  const data = await pedir<{ seguimiento: SeguimientoConRelaciones }>(
    `${BASE}/followup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.seguimiento;
}

export async function actualizarProgramacionSeguimiento(
  id: string,
  input: SeguimientoProgramacionParcial,
): Promise<SeguimientoConRelaciones> {
  const data = await pedir<{ seguimiento: SeguimientoConRelaciones }>(
    `${BASE}/followup/${id}/programacion`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.seguimiento;
}

export async function registrarResultadoSeguimiento(
  id: string,
  input: SeguimientoResultadoInput,
): Promise<SeguimientoConRelaciones> {
  const data = await pedir<{ seguimiento: SeguimientoConRelaciones }>(
    `${BASE}/followup/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.seguimiento;
}

export async function eliminarSeguimiento(id: string): Promise<void> {
  await pedir(`${BASE}/followup/${id}`, { method: "DELETE" });
}

// En adoption-client.ts
export async function obtenerSolicitud(
  id: string,
): Promise<SolicitudConRelaciones> {
  const data = await pedir<{ solicitud: SolicitudConRelaciones }>(
    `${BASE}/applications/${id}`, // Tu backend debe tener este GET
  );
  return data.solicitud;
}
