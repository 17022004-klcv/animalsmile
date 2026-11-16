/** Modelo `Santuario` (tabla `santuarios`). */
export interface Santuario {
  id_santuario: string;
  nombre: string;
  contacto_principal: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  tipo_fauna_permitida: string | null;
  creado_en: string | null;
}

/** Santuario con el conteo de traslados asociados. */
export interface SantuarioConTraslados extends Santuario {
  _count?: { traslados: number };
}

/** Payload de creación de un santuario. */
export interface SantuarioInput {
  nombre: string;
  contacto_principal: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  tipo_fauna_permitida: string | null;
}

/** Payload de actualización parcial de un santuario. */
export type SantuarioParcial = Partial<SantuarioInput>;

