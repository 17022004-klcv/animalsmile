import type { Animal } from "@/src/types/animal";
import type { Usuario } from "@/src/types/usuario";

export const ESTADOS_SOLICITUD = [
  "Pendiente",
  "En_Evaluacion",
  "Entrevista_Domiciliaria",
  "Aprobada",
  "Rechazada",
] as const;

export type EstadoSolicitud = (typeof ESTADOS_SOLICITUD)[number];

/** Modelo `Solicitante` (tabla `solicitantes`). */
export interface Solicitante {
  id_solicitante: string;
  documento_identidad: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo_vivienda: string | null;
  tiene_mascotas: boolean | null;
  creado_en: string | null;
}

/** Modelo `SolicitudAdopcion` (tabla `solicitudes_adopcion`). */
export interface SolicitudAdopcion {
  id_solicitud: string;
  id_solicitante: string;
  id_animal: string;
  fecha_solicitud: string | null;
  estado: EstadoSolicitud | string;
  evaluador_id: string | null;
  notas_evaluacion: string | null;
  actualizado_en: string | null;
}

/** Solicitud con sus relaciones (solicitante, animal y evaluador). */
export interface SolicitudConRelaciones extends SolicitudAdopcion {
  solicitante: Solicitante;
  animal: Pick<Animal, "id_animal" | "codigo_identificador" | "nombre">;
  evaluador?: Pick<
    Usuario,
    "id_usuario" | "nombre" | "apellido" | "email"
  > | null;
}

/** Alias usado por el formulario de detalle. */
export type SolicitudDetalle = SolicitudConRelaciones;

/** Payload de creación de solicitud. */
export type SolicitudInput = {
  id_solicitante: string;
  id_animal: string;
  evaluador_id?: string | null;
  notas_evaluacion?: string | null;
  estado?: EstadoSolicitud | string;
};

/** Payload de actualización parcial de solicitud. */
export type SolicitudParcial = Partial<SolicitudInput>;
