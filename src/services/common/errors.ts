export class ErrorServicio extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ErrorServicio";
    this.status = status;
  }
}

type MapeoPrisma = Record<string, { status: number; mensaje: string }>;

/**
 * Convierte un error de Prisma en un ErrorServicio con mensaje en español.
 * Si el código no está en `mapeo`, devuelve el mensaje por defecto.
 */
export function mapearErrorPrisma(
  error: unknown,
  mapeo: MapeoPrisma,
  porDefecto: { status: number; mensaje: string },
): ErrorServicio {
  const code = (error as { code?: string }).code;
  if (code && mapeo[code]) {
    const entrada = mapeo[code];
    return new ErrorServicio(entrada.status, entrada.mensaje);
  }
  return new ErrorServicio(porDefecto.status, porDefecto.mensaje);
}

export function codigoPrisma(error: unknown): string | undefined {
  return (error as { code?: string }).code;
}
