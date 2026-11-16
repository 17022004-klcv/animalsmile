import type { TipoDonacion } from "@/src/types/enums";

/** Métodos de pago disponibles para donaciones financieras. */
export const METODOS_PAGO = [
  "Efectivo",
  "Transferencia",
  "Tarjeta",
  "PayPal",
  "Otro",
] as const;

/** Tipos de donación que se registran como donaciones en especie. */
export const TIPOS_DONACION_ESPECIE = [
  "Alimentos",
  "Medicamentos",
  "Higiene_Limpieza",
  "Equipamiento_Otros",
] as const;

/** Unidades de medida disponibles para donaciones en especie. */
export const UNIDADES_MEDIDA = [
  "Unidad",
  "Caja",
  "Bolsa",
  "Paquete",
  "Frasco",
  "Kg",
  "Litro",
  "Otra",
] as const;

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

/** Donación con el usuario que la registró. */
export interface DonacionConRegistrador extends Donacion {
  registrador: {
    id_usuario: string;
    nombre: string;
    apellido: string;
    email: string;
  } | null;
}

/** Payload para registrar o actualizar una donación financiera. */
export interface DonacionFinancieraInput {
  donante_nombre: string;
  donante_email: string | null;
  monto: number;
  metodo_pago: string | null;
  fecha_donacion: string;
  descripcion_detalle: string | null;
  comprobante_url: string | null;
}
