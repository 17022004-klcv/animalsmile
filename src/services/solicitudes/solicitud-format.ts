import type { EstadoSolicitud } from "@/src/types/solicitud";

export function formatearEstadoSolicitud(
  estado: EstadoSolicitud | string,
): string {
  const formatos: Record<string, string> = {
    Pendiente: "Pendiente",
    En_Evaluacion: "En Evaluación",
    Entrevista_Domiciliaria: "Entrevista Domiciliaria",
    Aprobada: "Aprobada",
    Rechazada: "Rechazada",
  };
  return formatos[estado] || estado;
}

export function fechaCorta(fecha: Date | string | null): string {
  if (!fecha) return "—";
  const d = new Date(fecha);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-SV", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
