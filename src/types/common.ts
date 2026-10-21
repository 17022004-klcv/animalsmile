/** Resultado de validación/parseo: éxito con valor o error con mensaje. */
export type ResultadoParseo<T> =
  | { ok: true; valor: T }
  | { ok: false; error: string };

/** Respuesta genérica de error de las API. */
export interface RespuestaError {
  error: string;
}

/** Valor JSON almacenado en columnas `Json?` de Prisma. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [clave: string]: JsonValue };
