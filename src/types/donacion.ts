import type { TipoDonacion } from "@/src/types/enums";

/** Modelo `Donacion` (tabla `donaciones`). */
export interface Donacion {
  id_donacion: string;
  donante_nombre: string | null;
  donante_email: string | null;
  tipo: TipoDonacion;
  monto: number | null;
  metodo_pago: string | null;
  cantidad: number | null;
  unidad_medida: string | null;
  descripcion_detalle: string | null;
  comprobante_url: string | null;
  fecha_donacion: string | null;
  registrado_por: string | null;
}
