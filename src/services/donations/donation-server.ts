import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type { DonacionFinancieraInput } from "@/src/services/donations/donation-validation";

const MAPA_DONACION: Record<string, { status: number; mensaje: string }> = {
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
  P2025: { status: 404, mensaje: "Donación no encontrada." },
};

const RELACIONES_DONACION = {
  registrador: {
    select: {
      id_usuario: true,
      nombre: true,
      apellido: true,
      email: true,
    },
  },
} as const;

const FILTRO_FINANCIERA = { tipo: "Financiera" } as const;

function normalizarDonacion<T extends { monto: unknown; cantidad: unknown }>(
  donacion: T,
) {
  return {
    ...donacion,
    monto:
      donacion.monto === null || donacion.monto === undefined
        ? null
        : Number(donacion.monto),
    cantidad:
      donacion.cantidad === null || donacion.cantidad === undefined
        ? null
        : Number(donacion.cantidad),
  };
}

function fechaDonacion(valor: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ? new Date(`${valor}T12:00:00.000Z`)
    : new Date(valor);
}

export async function listarDonacionesFinancieras() {
  const donaciones = await prisma.donacion.findMany({
    where: FILTRO_FINANCIERA,
    orderBy: { fecha_donacion: "desc" },
    include: RELACIONES_DONACION,
  });
  return donaciones.map(normalizarDonacion);
}

export async function obtenerDonacionFinanciera(id: string) {
  const donacion = await prisma.donacion.findFirst({
    where: { id_donacion: id, ...FILTRO_FINANCIERA },
    include: RELACIONES_DONACION,
  });
  if (!donacion) {
    throw new ErrorServicio(404, "Donación no encontrada.");
  }
  return normalizarDonacion(donacion);
}

export async function crearDonacionFinanciera(
  input: DonacionFinancieraInput,
  registradoPor: string,
) {
  try {
    const donacion = await prisma.donacion.create({
      data: {
        donante_nombre: input.donante_nombre,
        donante_email: input.donante_email,
        tipo: "Financiera",
        monto: input.monto,
        metodo_pago: input.metodo_pago,
        descripcion_detalle: input.descripcion_detalle,
        comprobante_url: input.comprobante_url,
        fecha_donacion: fechaDonacion(input.fecha_donacion),
        registrado_por: registradoPor,
      },
      include: RELACIONES_DONACION,
    });
    return normalizarDonacion(donacion);
  } catch (error) {
    console.error("Error al registrar donación:", error);
    throw mapearErrorPrisma(error, MAPA_DONACION, {
      status: 500,
      mensaje: "No se pudo registrar la donación.",
    });
  }
}

export async function actualizarDonacionFinanciera(
  id: string,
  input: DonacionFinancieraInput,
) {
  try {
    const existente = await prisma.donacion.findFirst({
      where: { id_donacion: id, ...FILTRO_FINANCIERA },
      select: { id_donacion: true },
    });
    if (!existente) {
      throw new ErrorServicio(404, "Donación no encontrada.");
    }

    const donacion = await prisma.donacion.update({
      where: { id_donacion: id },
      data: {
        donante_nombre: input.donante_nombre,
        donante_email: input.donante_email,
        monto: input.monto,
        metodo_pago: input.metodo_pago,
        descripcion_detalle: input.descripcion_detalle,
        comprobante_url: input.comprobante_url,
        fecha_donacion: fechaDonacion(input.fecha_donacion),
      },
      include: RELACIONES_DONACION,
    });
    return normalizarDonacion(donacion);
  } catch (error) {
    if (error instanceof ErrorServicio) throw error;
    console.error("Error al actualizar donación:", error);
    throw mapearErrorPrisma(error, MAPA_DONACION, {
      status: 500,
      mensaje: "No se pudo actualizar la donación.",
    });
  }
}

export async function eliminarDonacionFinanciera(id: string) {
  try {
    const existente = await prisma.donacion.findFirst({
      where: { id_donacion: id, ...FILTRO_FINANCIERA },
      select: { id_donacion: true },
    });
    if (!existente) {
      throw new ErrorServicio(404, "Donación no encontrada.");
    }

    await prisma.donacion.delete({ where: { id_donacion: id } });
  } catch (error) {
    if (error instanceof ErrorServicio) throw error;
    console.error("Error al eliminar donación:", error);
    throw mapearErrorPrisma(error, MAPA_DONACION, {
      status: 500,
      mensaje: "No se pudo eliminar la donación.",
    });
  }
}
