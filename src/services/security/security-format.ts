import type {
  AccionBitacora,
  EstadoBackup,
  TipoEventoAcceso,
} from "@/src/types/enums";

const ETIQUETAS_EVENTO: Record<TipoEventoAcceso, string> = {
  Login: "Inicio de sesión",
  Logout: "Cierre de sesión",
  Login_Fallido: "Inicio fallido",
  Bloqueo_Cuenta: "Cuenta bloqueada",
  Cambio_Password: "Cambio de contraseña",
};

const ETIQUETAS_ACCION: Record<AccionBitacora, string> = {
  Creacion: "Creación",
  Actualizacion: "Actualización",
  Cambio_Estado: "Cambio de estado",
  Asignacion_Animal: "Asignación de animal",
  Adjunto_Foto: "Adjunto de foto",
  Eliminacion: "Eliminación",
  Restauracion: "Restauración",
  Verificacion: "Verificación",
  Descarga: "Descarga",
};

/** Devuelve una etiqueta legible para un evento de acceso. */
export function etiquetaEvento(evento: TipoEventoAcceso): string {
  return ETIQUETAS_EVENTO[evento] ?? evento.replace(/_/g, " ");
}

/** Devuelve una etiqueta legible para una acción de bitácora. */
export function etiquetaAccionBitacora(accion: AccionBitacora): string {
  return ETIQUETAS_ACCION[accion] ?? accion.replace(/_/g, " ");
}

/** Devuelve una etiqueta legible para el estado de un backup. */
export function etiquetaEstadoBackup(estado: EstadoBackup): string {
  return estado.replace(/_/g, " ");
}

/** Formatea una fecha ISO con fecha y hora en formato español. */
export function fechaHora(iso: string | null): string {
  if (!iso) return "—";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
