import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type {
  BackupInput,
  CambioEstadoBackupInput,
  FiltroBackup,
  FiltroBitacora,
} from "@/src/services/security/security-validation";
import type { Prisma } from "@/src/generated/prisma/client";
import type {
  EstadoBackup,
  TipoBackup,
  TipoEventoAcceso,
} from "@/src/types/enums";
import {
  ESTADOS_BACKUP,
  TIPOS_BACKUP,
  TIPOS_EVENTO_ACCESO,
} from "@/src/types/enums";

const MAPA_BACKUP: Record<string, { status: number; mensaje: string }> = {
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
  P2025: { status: 404, mensaje: "Backup no encontrado." },
};

function aFecha(valor: string, finDelDia = false): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return new Date(`${valor}T${finDelDia ? "23:59:59.999" : "00:00:00.000"}`);
  }
  return new Date(valor);
}

function rangoFechas(filtro: { desde: string | null; hasta: string | null }) {
  const rango: Prisma.DateTimeNullableFilter = {};
  if (filtro.desde) {
    const fecha = aFecha(filtro.desde);
    if (!Number.isNaN(fecha.getTime())) rango.gte = fecha;
  }
  if (filtro.hasta) {
    const fecha = aFecha(filtro.hasta, true);
    if (!Number.isNaN(fecha.getTime())) rango.lte = fecha;
  }
  return Object.keys(rango).length > 0 ? rango : undefined;
}

export async function listarAccesos(filtro: FiltroBitacora) {
  const where: Prisma.BitacoraAccesoWhereInput = {};
  if (filtro.id_usuario) where.id_usuario = filtro.id_usuario;
  if (filtro.tipo_evento) where.tipo_evento = filtro.tipo_evento;
  if (filtro.exito !== null) where.exito = filtro.exito;

  const rango = rangoFechas(filtro);
  if (rango) where.fecha_evento = rango;

  if (filtro.busqueda) {
    const texto = filtro.busqueda;
    where.OR = [
      { email_intentado: { contains: texto, mode: "insensitive" } },
      { ip_origen: { contains: texto, mode: "insensitive" } },
      { detalle: { contains: texto, mode: "insensitive" } },
      {
        usuario: {
          is: {
            OR: [
              { nombre: { contains: texto, mode: "insensitive" } },
              { apellido: { contains: texto, mode: "insensitive" } },
              { email: { contains: texto, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  return prisma.bitacoraAcceso.findMany({
    where,
    orderBy: { fecha_evento: "desc" },
    take: filtro.limite,
    include: {
      usuario: {
        select: {
          id_usuario: true,
          nombre: true,
          apellido: true,
          email: true,
        },
      },
    },
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

const SELECT_EJECUTOR = {
  id_usuario: true,
  nombre: true,
  apellido: true,
  email: true,
} as const;

function serializarBackup<T extends { tamano_bytes: bigint | null }>(backup: T) {
  return {
    ...backup,
    tamano_bytes:
      backup.tamano_bytes === null ? null : Number(backup.tamano_bytes),
  };
}

export async function listarBackups(filtro: FiltroBackup) {
  const where: Prisma.BackupWhereInput = {};
  if (filtro.tipo_backup) where.tipo_backup = filtro.tipo_backup;
  if (filtro.estado) where.estado = filtro.estado;

  const rango = rangoFechas(filtro);
  if (rango) where.fecha_inicio = rango;

  if (filtro.busqueda) {
    const texto = filtro.busqueda;
    where.OR = [
      { nombre_archivo: { contains: texto, mode: "insensitive" } },
      { ruta_almacenamiento: { contains: texto, mode: "insensitive" } },
      { hash_checksum: { contains: texto, mode: "insensitive" } },
      {
        ejecutor: {
          is: {
            OR: [
              { nombre: { contains: texto, mode: "insensitive" } },
              { apellido: { contains: texto, mode: "insensitive" } },
              { email: { contains: texto, mode: "insensitive" } },
            ],
          },
        },
      },
    ];
  }

  const backups = await prisma.backup.findMany({
    where,
    orderBy: { fecha_inicio: "desc" },
    take: filtro.limite,
    include: { ejecutor: { select: SELECT_EJECUTOR } },
  });

  return backups.map(serializarBackup);
}

export async function obtenerBackupDetalle(id: string) {
  const backup = await prisma.backup.findUnique({
    where: { id_backup: id },
    include: {
      ejecutor: { select: SELECT_EJECUTOR },
      bitacoras_backup: {
        orderBy: { fecha_evento: "desc" },
        include: { usuario: { select: SELECT_EJECUTOR } },
      },
    },
  });

  if (!backup) {
    throw new ErrorServicio(404, "Backup no encontrado.");
  }

  const { bitacoras_backup, ...resto } = backup;
  return { ...serializarBackup(resto), bitacoras: bitacoras_backup };
}

export async function listarBitacoraBackups(idBackup: string) {
  return prisma.bitacoraBackup.findMany({
    where: { id_backup: idBackup },
    orderBy: { fecha_evento: "desc" },
    include: { usuario: { select: SELECT_EJECUTOR } },
  });
}

export async function registrarBackup(
  input: BackupInput,
  ejecutadoPor: string,
) {
  try {
    const backup = await prisma.$transaction(async (tx) => {
      const creado = await tx.backup.create({
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

      await tx.bitacoraBackup.create({
        data: {
          id_backup: creado.id_backup,
          id_usuario: ejecutadoPor,
          accion: "Creacion",
          descripcion: `Backup ${input.tipo_backup} registrado.`,
        },
      });

      return creado;
    });

    return serializarBackup(backup);
  } catch (error) {
    console.error("Error al registrar backup:", error);
    throw mapearErrorPrisma(error, MAPA_BACKUP, {
      status: 500,
      mensaje: "No se pudo registrar el backup.",
    });
  }
}

export async function cambiarEstadoBackup(
  id: string,
  input: CambioEstadoBackupInput,
  usuarioId: string,
) {
  try {
    const backup = await prisma.$transaction(async (tx) => {
      const actualizado = await tx.backup.update({
        where: { id_backup: id },
        data: {
          estado: input.estado,
          detalle_error: input.detalle_error,
          tamano_bytes:
            input.tamano_bytes === null ? null : BigInt(input.tamano_bytes),
          hash_checksum: input.hash_checksum,
          fecha_fin: input.estado === "En_Proceso" ? null : new Date(),
        },
      });

      await tx.bitacoraBackup.create({
        data: {
          id_backup: id,
          id_usuario: usuarioId,
          accion:
            input.estado === "Restaurado" ? "Restauracion" : "Cambio_Estado",
          descripcion: `Estado actualizado a ${input.estado.replace(/_/g, " ")}.`,
        },
      });

      return actualizado;
    });

    return serializarBackup(backup);
  } catch (error) {
    console.error("Error al actualizar el estado del backup:", error);
    throw mapearErrorPrisma(error, MAPA_BACKUP, {
      status: 500,
      mensaje: "No se pudo actualizar el estado del backup.",
    });
  }
}

export async function eliminarBackup(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.bitacoraBackup.deleteMany({ where: { id_backup: id } });
      await tx.backup.delete({ where: { id_backup: id } });
    });
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
  const tipoEvento = params.get("tipo_evento");
  const exito = params.get("exito");

  return {
    desde: params.get("desde") || null,
    hasta: params.get("hasta") || null,
    id_usuario: params.get("id_usuario") || null,
    tipo_evento:
      tipoEvento &&
      (TIPOS_EVENTO_ACCESO as readonly string[]).includes(tipoEvento)
        ? (tipoEvento as TipoEventoAcceso)
        : null,
    exito: exito === "true" ? true : exito === "false" ? false : null,
    busqueda: params.get("busqueda")?.trim() || null,
    limite:
      Number.isInteger(limite) && limite > 0 && limite <= 500 ? limite : 500,
  };
}

export function parseFiltroBackupDesdeUrl(url: string): FiltroBackup {
  const params = new URL(url).searchParams;
  const limite = Number(params.get("limite"));
  const tipoBackup = params.get("tipo_backup");
  const estado = params.get("estado");

  return {
    desde: params.get("desde") || null,
    hasta: params.get("hasta") || null,
    tipo_backup:
      tipoBackup &&
      (TIPOS_BACKUP as readonly string[]).includes(tipoBackup)
        ? (tipoBackup as TipoBackup)
        : null,
    estado:
      estado && (ESTADOS_BACKUP as readonly string[]).includes(estado)
        ? (estado as EstadoBackup)
        : null,
    busqueda: params.get("busqueda")?.trim() || null,
    limite:
      Number.isInteger(limite) && limite > 0 && limite <= 500 ? limite : 500,
  };
}

export { ErrorServicio };
