import type { SolicitudAdopcion, Solicitante } from "./adopcion";

export const TIPOS_VIVIENDA = [
  "Casa_Propia",
  "Casa_Alquilada",
  "Apartamento",
  "Finca_Parcela",
  "Otro",
] as const;

export type TipoVivienda = (typeof TIPOS_VIVIENDA)[number];

export interface SolicitanteConSolicitudes extends Solicitante {
  solicitudes: SolicitudAdopcion[];
}

export interface SolicitanteConConteo extends Solicitante {
  _count: { solicitudes: number };
}

export type SolicitanteDetalle = SolicitanteConConteo;

export type SolicitanteInput = Pick<
  Solicitante,
  | "documento_identidad"
  | "nombre"
  | "apellido"
  | "email"
  | "telefono"
  | "direccion"
  | "tipo_vivienda"
  | "tiene_mascotas"
>;

export type SolicitanteParcial = Partial<SolicitanteInput>;
