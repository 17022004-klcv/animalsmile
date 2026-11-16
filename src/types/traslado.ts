/** Modelo `Traslado` (tabla `traslados`). */
export interface Traslado {
  id_traslado: string;
  id_animal: string;
  id_santuario: string;
  fecha_traslado: string;
  motivo: string;
  responsable_transporte: string | null;
  estado_salida: string | null;
  estado_llegada: string | null;
  registrado_por: string | null;
}

/** Traslado con su animal y santuario relacionados. */
export interface TrasladoConRelaciones extends Traslado {
  animal: { id_animal: string; nombre: string; codigo_identificador: string };
  santuario: { id_santuario: string; nombre: string };
}

/** Payload de registro de un traslado. */
export interface TrasladoInput {
  id_animal: string;
  id_santuario: string;
  fecha_traslado: string;
  motivo: string;
  responsable_transporte: string | null;
  estado_salida: string | null;
  estado_llegada: string | null;
}
