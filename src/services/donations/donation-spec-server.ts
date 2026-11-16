import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type { DonacionEspecieInput } from "@/src/services/donations/donation-validation";
import { TipoDonacion } from "@/src/types/enums";

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

// Usamos el tipo explícito para evitar problemas con as const y el enum de Prisma
// Filtra todas las donaciones que sean de tipo material/especie
const FILTRO_ESPECIE = {
  tipo: {
    in: [
      TipoDonacion.Alimentos,
      TipoDonacion.Medicamentos,
      TipoDonacion.Higiene_Limpieza,
      TipoDonacion.Equipamiento_Otros,
    ],
  },
};

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

export async function listarDonacionesEspecie() {
  const donaciones = await prisma.donacion.findMany({
    where: FILTRO_ESPECIE,
    orderBy: { fecha_donacion: "desc" },
    include: RELACIONES_DONACION,
  });
  return donaciones.map(normalizarDonacion);
}

export async function obtenerDonacionEspecie(id: string) {
  const donacion = await prisma.donacion.findFirst({
    where: { id_donacion: id, ...FILTRO_ESPECIE },
    include: RELACIONES_DONACION,
  });
  if (!donacion) {
    throw new ErrorServicio(404, "Donación no encontrada.");
  }
  return normalizarDonacion(donacion);
}

export async function crearDonacionEspecie(
  input: DonacionEspecieInput, // Asegúrate que este input incluya el `tipo: TipoDonacion`
  registradoPor: string,
) {
  try {
    const donacion = await prisma.donacion.create({
      data: {
        donante_nombre: input.donante_nombre,
        donante_email: input.donante_email,
        tipo: input.tipo, // Usas el tipo que viene del formulario (Alimentos, Medicamentos, etc.)
        cantidad: input.cantidad,
        unidad_medida: input.unidad_medida,
        descripcion_detalle: input.descripcion_detalle,
        comprobante_url: input.comprobante_url,
        fecha_donacion: fechaDonacion(input.fecha_donacion),
        registrado_por: registradoPor,
      },
      include: RELACIONES_DONACION,
    });
    return normalizarDonacion(donacion);
  } catch (error) {
    console.error("Error al registrar donación en especie:", error);
    throw mapearErrorPrisma(error, MAPA_DONACION, {
      status: 500,
      mensaje: "No se pudo registrar la donación en especie.",
    });
  }
}

export async function actualizarDonacionEspecie(
  id: string,
  input: DonacionEspecieInput,
) {
  try {
    const existente = await prisma.donacion.findFirst({
      where: { id_donacion: id, ...FILTRO_ESPECIE },
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
        tipo: input.tipo,
        cantidad: input.cantidad,
        unidad_medida: input.unidad_medida,
        descripcion_detalle: input.descripcion_detalle,
        comprobante_url: input.comprobante_url,
        fecha_donacion: fechaDonacion(input.fecha_donacion),
      },
      include: RELACIONES_DONACION,
    });
    return normalizarDonacion(donacion);
  } catch (error) {
    if (error instanceof ErrorServicio) throw error;
    console.error("Error al actualizar donación en especie:", error);
    throw mapearErrorPrisma(error, MAPA_DONACION, {
      status: 500,
      mensaje: "No se pudo actualizar la donación en especie.",
    });
  }
}

export async function eliminarDonacionEspecie(id: string) {
  try {
    const existente = await prisma.donacion.findFirst({
      where: { id_donacion: id, ...FILTRO_ESPECIE },
      select: { id_donacion: true },
    });
    if (!existente) {
      throw new ErrorServicio(404, "Donación no encontrada.");
    }

    await prisma.donacion.delete({ where: { id_donacion: id } });
  } catch (error) {
    if (error instanceof ErrorServicio) throw error;
    console.error("Error al eliminar donación en especie:", error);
    throw mapearErrorPrisma(error, MAPA_DONACION, {
      status: 500,
      mensaje: "No se pudo eliminar la donación en especie.",
    });
  }
}
