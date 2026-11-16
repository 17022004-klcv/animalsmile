import { pedir } from "@/src/services/common/http";
import type {
  SolicitudConRelaciones,
  SolicitudInput,
  SolicitudParcial,
} from "@/src/types/solicitud";

const BASE = "/api/admin/adoptions/applications";

export async function obtenerSolicitudes(): Promise<SolicitudConRelaciones[]> {
  const data = await pedir<{ solicitudes: SolicitudConRelaciones[] }>(BASE);
  return data.solicitudes;
}

export async function obtenerSolicitud(
  id: string,
): Promise<SolicitudConRelaciones> {
  const data = await pedir<{ solicitud: SolicitudConRelaciones }>(
    `${BASE}/${id}`,
  );
  return data.solicitud;
}

export async function crearSolicitud(
  input: SolicitudInput,
): Promise<SolicitudConRelaciones> {
  const data = await pedir<{ solicitud: SolicitudConRelaciones }>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.solicitud;
}

export async function actualizarSolicitud(
  id: string,
  input: SolicitudParcial,
): Promise<SolicitudConRelaciones> {
  const data = await pedir<{ solicitud: SolicitudConRelaciones }>(
    `${BASE}/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.solicitud;
}

export async function eliminarSolicitud(id: string): Promise<void> {
  await pedir(`${BASE}/${id}`, { method: "DELETE" });
}
