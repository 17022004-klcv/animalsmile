import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type {
  SantuarioInput,
  TrasladoInput,
} from "@/src/services/sanctuaries/sanctuary-validation";

const MAPA_SANTUARIO: Record<string, { status: number; mensaje: string }> = {
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
  P2025: { status: 404, mensaje: "Santuario no encontrado." },
};

const MAPA_SANTUARIO_ELIMINAR: Record<string, { status: number; mensaje: string }> = {
  P2003: {
    status: 409,
    mensaje: "No se puede eliminar: hay traslados asociados a este santuario.",
  },
  P2025: { status: 404, mensaje: "Santuario no encontrado." },
};

const MAPA_TRASLADO: Record<string, { status: number; mensaje: string }> = {
  P2003: { status: 409, mensaje: "El animal o el santuario no existen." },
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
  P2025: { status: 404, mensaje: "Traslado no encontrado." },
};

export async function listarSantuarios() {
  return prisma.santuario.findMany({
    orderBy: { nombre: "asc" },
    include: { _count: { select: { traslados: true } } },
  });
}

export async function obtenerSantuario(id: string) {
  const santuario = await prisma.santuario.findUnique({
    where: { id_santuario: id },
  });
  if (!santuario) {
    throw new ErrorServicio(404, "Santuario no encontrado.");
  }
  return santuario;
}

export async function crearSantuario(input: SantuarioInput) {
  try {
    return await prisma.santuario.create({ data: input });
  } catch (error) {
    console.error("Error al crear santuario:", error);
    throw mapearErrorPrisma(error, MAPA_SANTUARIO, {
      status: 500,
      mensaje: "No se pudo crear el santuario.",
    });
  }
}

export async function actualizarSantuario(
  id: string,
  input: Partial<SantuarioInput>,
) {
  try {
    return await prisma.santuario.update({
      where: { id_santuario: id },
      data: input,
    });
  } catch (error) {
    console.error("Error al actualizar santuario:", error);
    throw mapearErrorPrisma(error, MAPA_SANTUARIO, {
      status: 500,
      mensaje: "No se pudo actualizar el santuario.",
    });
  }
}

export async function eliminarSantuario(id: string) {
  try {
    await prisma.santuario.delete({ where: { id_santuario: id } });
  } catch (error) {
    console.error("Error al eliminar santuario:", error);
    throw mapearErrorPrisma(error, MAPA_SANTUARIO_ELIMINAR, {
      status: 500,
      mensaje: "No se pudo eliminar el santuario.",
    });
  }
}

export async function listarTraslados() {
  return prisma.traslado.findMany({
    orderBy: { fecha_traslado: "desc" },
    include: {
      animal: { select: { id_animal: true, nombre: true, codigo_identificador: true } },
      santuario: { select: { id_santuario: true, nombre: true } },
    },
  });
}

export async function crearTraslado(input: TrasladoInput, registradoPor: string) {
  const animal = await prisma.animal.findUnique({
    where: { id_animal: input.id_animal },
    select: { id_animal: true },
  });
  if (!animal) {
    throw new ErrorServicio(409, "El animal seleccionado no existe.");
  }
  const santuario = await prisma.santuario.findUnique({
    where: { id_santuario: input.id_santuario },
    select: { id_santuario: true },
  });
  if (!santuario) {
    throw new ErrorServicio(409, "El santuario seleccionado no existe.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const traslado = await tx.traslado.create({
        data: {
          id_animal: input.id_animal,
          id_santuario: input.id_santuario,
          fecha_traslado: new Date(input.fecha_traslado),
          motivo: input.motivo,
          responsable_transporte: input.responsable_transporte,
          estado_salida: input.estado_salida,
          estado_llegada: input.estado_llegada,
          registrado_por: registradoPor,
        },
      });
      await tx.animal.update({
        where: { id_animal: input.id_animal },
        data: { estado: "Trasladado" },
      });
      return traslado;
    });
  } catch (error) {
    console.error("Error al registrar traslado:", error);
    throw mapearErrorPrisma(error, MAPA_TRASLADO, {
      status: 500,
      mensaje: "No se pudo registrar el traslado.",
    });
  }
}

export async function eliminarTraslado(id: string) {
  try {
    await prisma.traslado.delete({ where: { id_traslado: id } });
  } catch (error) {
    console.error("Error al eliminar traslado:", error);
    throw mapearErrorPrisma(error, MAPA_TRASLADO, {
      status: 500,
      mensaje: "No se pudo eliminar el traslado.",
    });
  }
}
