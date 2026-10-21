import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type {
  ConfiguracionSistemaInput,
  ConfiguracionSitioInput,
} from "@/src/services/config/config-validation";

const MAPA_CONFIG: Record<string, { status: number; mensaje: string }> = {
  P2002: { status: 409, mensaje: "Ya existe una configuración con esa clave." },
  P2025: { status: 404, mensaje: "Configuración no encontrada." },
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
};

export async function listarConfigSistema() {
  return prisma.configuracionSistema.findMany({
    orderBy: [{ modulo: "asc" }, { clave: "asc" }],
  });
}

export async function crearConfigSistema(
  input: ConfiguracionSistemaInput,
  actualizadoPor: string,
) {
  try {
    return await prisma.configuracionSistema.create({
      data: { ...input, actualizado_por: actualizadoPor },
    });
  } catch (error) {
    console.error("Error al crear configuración de sistema:", error);
    throw mapearErrorPrisma(error, MAPA_CONFIG, {
      status: 500,
      mensaje: "No se pudo crear la configuración.",
    });
  }
}

export async function actualizarConfigSistema(
  id: string,
  input: Partial<ConfiguracionSistemaInput>,
  actualizadoPor: string,
) {
  try {
    return await prisma.configuracionSistema.update({
      where: { id_config: id },
      data: { ...input, actualizado_por: actualizadoPor },
    });
  } catch (error) {
    console.error("Error al actualizar configuración de sistema:", error);
    throw mapearErrorPrisma(error, MAPA_CONFIG, {
      status: 500,
      mensaje: "No se pudo actualizar la configuración.",
    });
  }
}

export async function eliminarConfigSistema(id: string) {
  try {
    await prisma.configuracionSistema.delete({ where: { id_config: id } });
  } catch (error) {
    console.error("Error al eliminar configuración de sistema:", error);
    throw mapearErrorPrisma(error, MAPA_CONFIG, {
      status: 500,
      mensaje: "No se pudo eliminar la configuración.",
    });
  }
}

export async function listarConfigSitio() {
  return prisma.configuracionSitio.findMany({
    orderBy: [{ seccion: "asc" }, { clave: "asc" }],
  });
}

export async function crearConfigSitio(
  input: ConfiguracionSitioInput,
  actualizadoPor: string,
) {
  try {
    return await prisma.configuracionSitio.create({
      data: { ...input, actualizado_por: actualizadoPor },
    });
  } catch (error) {
    console.error("Error al crear configuración de sitio:", error);
    throw mapearErrorPrisma(error, MAPA_CONFIG, {
      status: 500,
      mensaje: "No se pudo crear la configuración.",
    });
  }
}

export async function actualizarConfigSitio(
  id: string,
  input: Partial<ConfiguracionSitioInput>,
  actualizadoPor: string,
) {
  try {
    return await prisma.configuracionSitio.update({
      where: { id_config_sitio: id },
      data: { ...input, actualizado_por: actualizadoPor },
    });
  } catch (error) {
    console.error("Error al actualizar configuración de sitio:", error);
    throw mapearErrorPrisma(error, MAPA_CONFIG, {
      status: 500,
      mensaje: "No se pudo actualizar la configuración.",
    });
  }
}

export async function eliminarConfigSitio(id: string) {
  try {
    await prisma.configuracionSitio.delete({ where: { id_config_sitio: id } });
  } catch (error) {
    console.error("Error al eliminar configuración de sitio:", error);
    throw mapearErrorPrisma(error, MAPA_CONFIG, {
      status: 500,
      mensaje: "No se pudo eliminar la configuración.",
    });
  }
}

export { ErrorServicio };
