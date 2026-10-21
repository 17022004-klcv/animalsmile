import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type {
  BackupInput,
  FiltroBitacora,
} from "@/src/services/security/security-validation";
import type { Prisma } from "@/src/generated/prisma/client";

const MAPA_BACKUP: Record<string, { status: number; mensaje: string }> = {
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
  P2025: { status: 404, mensaje: "Backup no encontrado." },
};

function rangoFechas(filtro: FiltroBitacora) {
  if (!filtro.desde && !filtro.hasta) return undefined;
  const rango: Prisma.DateTimeNullableFilter = {};
  if (filtro.desde) rango.gte = new Date(filtro.desde);
  if (filtro.hasta) rango.lte = new Date(filtro.hasta);
  return rango;
}

export async function listarAccesos(filtro: FiltroBitacora) {
  return prisma.bitacoraAcceso.findMany({
    where: {
      ...(filtro.id_usuario ? { id_usuario: filtro.id_usuario } : {}),
      ...(rangoFechas(filtro) ? { fecha_evento: rangoFechas(filtro) } : {}),
    },
    orderBy: { fecha_evento: "desc" },
    take: filtro.limite,
    include: { usuario: { select: { id_usuario: true, nombre: true, apellido: true } } },
  });
}

export async function listarAuditoria(filtro: FiltroBitacora) {
  return prisma.bitacoraAuditoria.findMany({
    where: {
      ...(filtro.id_usuario ? { id_usuario: filtro.id_usuario } : {}),
      ...(rangoFechas(filtro) ? { fecha_evento: rangoFechas(filtro) } : {}),
    },
    orderBy: { fecha_evento: "desc" },
    take: filtro.limite,
    include: { usuario: { select: { id_usuario: true, nombre: true, apellido: true } } },
  });
}

export async function listarBackups() {
  return prisma.backup.findMany({
    orderBy: { fecha_inicio: "desc" },
    include: { ejecutor: { select: { id_usuario: true, nombre: true, apellido: true } } },
  });
}

export async function listarBitacoraBackups(idBackup: string) {
  return prisma.bitacoraBackup.findMany({
    where: { id_backup: idBackup },
    orderBy: { fecha_evento: "desc" },
  });
}

export async function registrarBackup(input: BackupInput, ejecutadoPor: string) {
  try {
    return await prisma.backup.create({
      data: {
        nombre_archivo: input.nombre_archivo,
        ruta_almacenamiento: input.ruta_almacenamiento,
        tipo_backup: input.tipo_backup,
        hash_checksum: input.hash_checksum,
        es_automatico: input.es_automatico,
        ejecutado_por: ejecutadoPor,
        estado: "En_Proceso",
      },
    });
  } catch (error) {
    console.error("Error al registrar backup:", error);
    throw mapearErrorPrisma(error, MAPA_BACKUP, {
      status: 500,
      mensaje: "No se pudo registrar el backup.",
    });
  }
}

export async function eliminarBackup(id: string) {
  try {
    await prisma.backup.delete({ where: { id_backup: id } });
  } catch (error) {
    console.error("Error al eliminar backup:", error);
    throw mapearErrorPrisma(error, MAPA_BACKUP, {
      status: 500,
      mensaje: "No se pudo eliminar el backup.",
    });
  }
}

export function parseFiltroDesdeUrl(url: string): FiltroBitacora {
  const params = new URL(url).searchParams;
  const limite = Number(params.get("limite"));
  return {
    desde: params.get("desde"),
    hasta: params.get("hasta"),
    id_usuario: params.get("id_usuario"),
    limite:
      Number.isInteger(limite) && limite > 0 && limite <= 500 ? limite : 100,
  };
}

export { ErrorServicio };
