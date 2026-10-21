import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type { DonacionInput } from "@/src/services/donations/donation-validation";

const MAPA_DONACION: Record<string, { status: number; mensaje: string }> = {
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
  P2025: { status: 404, mensaje: "Donación no encontrada." },
};

export async function listarDonaciones() {
  return prisma.donacion.findMany({
    orderBy: { fecha_donacion: "desc" },
  });
}

export async function obtenerDonacion(id: string) {
  const donacion = await prisma.donacion.findUnique({
    where: { id_donacion: id },
  });
  if (!donacion) {
    throw new ErrorServicio(404, "Donación no encontrada.");
  }
  return donacion;
}

export async function crearDonacion(input: DonacionInput, registradoPor: string) {
  try {
    return await prisma.donacion.create({
      data: {
        donante_nombre: input.donante_nombre,
        donante_email: input.donante_email,
        tipo: input.tipo,
        monto: input.monto,
        metodo_pago: input.metodo_pago,
        cantidad: input.cantidad,
        unidad_medida: input.unidad_medida,
        descripcion_detalle: input.descripcion_detalle,
        comprobante_url: input.comprobante_url,
        registrado_por: registradoPor,
      },
    });
  } catch (error) {
    console.error("Error al registrar donación:", error);
    throw mapearErrorPrisma(error, MAPA_DONACION, {
      status: 500,
      mensaje: "No se pudo registrar la donación.",
    });
  }
}

export async function eliminarDonacion(id: string) {
  try {
    await prisma.donacion.delete({ where: { id_donacion: id } });
  } catch (error) {
    console.error("Error al eliminar donación:", error);
    throw mapearErrorPrisma(error, MAPA_DONACION, {
      status: 500,
      mensaje: "No se pudo eliminar la donación.",
    });
  }
}
