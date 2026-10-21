import { pedir } from "@/src/services/common/http";
import type {
  AdopcionInput,
  EvaluacionSolicitudInput,
  SeguimientoInput,
  SeguimientoResultadoInput,
  SolicitanteInput,
  SolicitudInput,
} from "@/src/services/adoptions/adoption-validation";
import type {
  Adopcion,
  SeguimientoPostAdopcion,
  Solicitante,
  SolicitudAdopcion,
} from "@/src/types/adopcion";

export interface SolicitanteConConteo extends Solicitante {
  _count?: { solicitudes: number };
}

export interface SolicitudConRelaciones extends SolicitudAdopcion {
  solicitante: Solicitante;
  animal: { id_animal: string; nombre: string; codigo_identificador: string };
  evaluador: { id_usuario: string; nombre: string; apellido: string } | null;
}

export interface AdopcionConRelaciones extends Adopcion {
  solicitud: SolicitudAdopcion & {
    solicitante: Solicitante;
    animal: { id_animal: string; nombre: string };
  };
  encargado: { id_usuario: string; nombre: string; apellido: string } | null;
  _count?: { seguimientos_post_adopcion: number };
}

const BASE = "/api/admin/adoptions";

export async function obtenerSolicitantes(): Promise<SolicitanteConConteo[]> {
  const data = await pedir<{ solicitantes: SolicitanteConConteo[] }>(
    `${BASE}/applicants`,
  );
  return data.solicitantes;
}

export async function crearSolicitante(
  input: SolicitanteInput,
): Promise<Solicitante> {
  const data = await pedir<{ solicitante: Solicitante }>(
    `${BASE}/applicants`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.solicitante;
}

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

export async function obtenerSeguimientos(
  idAdopcion: string,
): Promise<SeguimientoPostAdopcion[]> {
  const data = await pedir<{ seguimientos: SeguimientoPostAdopcion[] }>(
    `${BASE}/followup/${idAdopcion}`,
  );
  return data.seguimientos;
}

export async function crearSeguimiento(
  input: SeguimientoInput,
): Promise<SeguimientoPostAdopcion> {
  const data = await pedir<{ seguimiento: SeguimientoPostAdopcion }>(
    `${BASE}/followup`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.seguimiento;
}

export async function registrarResultadoSeguimiento(
  id: string,
  input: SeguimientoResultadoInput,
): Promise<SeguimientoPostAdopcion> {
  const data = await pedir<{ seguimiento: SeguimientoPostAdopcion }>(
    `${BASE}/followup/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.seguimiento;
}
