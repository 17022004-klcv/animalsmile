import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type { EspecieInput, TaxonomiaInput } from "@/src/types/classification";

const MAPA_ESPECIE: Record<string, { status: number; mensaje: string }> = {
  P2003: { status: 409, mensaje: "La taxonomía seleccionada no existe." },
  P2025: { status: 404, mensaje: "Especie no encontrada." },
  P2002: { status: 409, mensaje: "Ya existe una especie con ese nombre." },
};

const MAPA_ESPECIE_ELIMINAR: Record<string, { status: number; mensaje: string }> = {
  P2003: {
    status: 409,
    mensaje: "No se puede eliminar: hay animales registrados de esta especie.",
  },
  P2025: { status: 404, mensaje: "Especie no encontrada." },
};

const MAPA_TAXONOMIA: Record<string, { status: number; mensaje: string }> = {
  P2002: { status: 409, mensaje: "Ya existe una taxonomía con ese nombre." },
  P2025: { status: 404, mensaje: "Taxonomía no encontrada." },
  P2003: { status: 409, mensaje: "No se puede modificar: hay datos referenciados." },
};

const MAPA_TAXONOMIA_ELIMINAR: Record<string, { status: number; mensaje: string }> = {
  P2003: {
    status: 409,
    mensaje: "No se puede eliminar: hay especies asignadas a esta taxonomía.",
  },
  P2025: { status: 404, mensaje: "Taxonomía no encontrada." },
};

export async function listarEspecies() {
  return prisma.especie.findMany({
    orderBy: { nombre_comun: "asc" },
    include: {
      taxonomia: true,
      _count: { select: { animales: true } },
    },
  });
}

export async function listarTaxonomias() {
  return prisma.taxonomia.findMany({
    orderBy: { nombre_clase: "asc" },
    include: { _count: { select: { especies: true } } },
  });
}

export async function listarClasificaciones() {
  const [especies, taxonomias] = await Promise.all([
    listarEspecies(),
    listarTaxonomias(),
  ]);
  return { especies, taxonomias };
}

export async function crearEspecie(input: EspecieInput) {
  try {
    return await prisma.especie.create({
      data: {
        nombre_comun: input.nombre_comun,
        id_taxonomia: input.id_taxonomia,
        es_domestico: input.es_domestico,
      },
      include: { taxonomia: true },
    });
  } catch (error) {
    console.error("Error al crear especie:", error);
    throw mapearErrorPrisma(error, MAPA_ESPECIE, {
      status: 500,
      mensaje: "No se pudo crear la especie.",
    });
  }
}

export async function actualizarEspecie(
  id: number,
  data: Partial<EspecieInput>,
) {
  try {
    return await prisma.especie.update({
      where: { id_especie: id },
      data,
      include: { taxonomia: true },
    });
  } catch (error) {
    console.error("Error al actualizar especie:", error);
    throw mapearErrorPrisma(error, MAPA_ESPECIE, {
      status: 500,
      mensaje: "No se pudo actualizar la especie.",
    });
  }
}

export async function eliminarEspecie(id: number) {
  try {
    await prisma.especie.delete({ where: { id_especie: id } });
  } catch (error) {
    console.error("Error al eliminar especie:", error);
    throw mapearErrorPrisma(error, MAPA_ESPECIE_ELIMINAR, {
      status: 500,
      mensaje: "No se pudo eliminar la especie.",
    });
  }
}

export async function crearTaxonomia(input: TaxonomiaInput) {
  try {
    return await prisma.taxonomia.create({
      data: { nombre_clase: input.nombre_clase },
    });
  } catch (error) {
    console.error("Error al crear taxonomía:", error);
    throw mapearErrorPrisma(error, MAPA_TAXONOMIA, {
      status: 500,
      mensaje: "No se pudo crear la taxonomía.",
    });
  }
}

export async function actualizarTaxonomia(id: number, nombre: string) {
  try {
    return await prisma.taxonomia.update({
      where: { id_taxonomia: id },
      data: { nombre_clase: nombre },
    });
  } catch (error) {
    console.error("Error al actualizar taxonomía:", error);
    throw mapearErrorPrisma(error, MAPA_TAXONOMIA, {
      status: 500,
      mensaje: "No se pudo actualizar la taxonomía.",
    });
  }
}

export async function eliminarTaxonomia(id: number) {
  try {
    await prisma.taxonomia.delete({ where: { id_taxonomia: id } });
  } catch (error) {
    console.error("Error al eliminar taxonomía:", error);
    throw mapearErrorPrisma(error, MAPA_TAXONOMIA_ELIMINAR, {
      status: 500,
      mensaje: "No se pudo eliminar la taxonomía.",
    });
  }
}

export function parseIntId(valor: string): number {
  const id = Number(valor);
  if (!Number.isInteger(id)) {
    throw new ErrorServicio(400, "ID inválido.");
  }
  return id;
}
