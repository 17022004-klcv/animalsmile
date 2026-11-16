import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type {
  AdopcionInput,
  EvaluacionSolicitudInput,
  SeguimientoInput,
  SeguimientoResultadoInput,
  SolicitanteInput,
  SolicitudInput,
} from "@/src/services/adoptions/adoption-validation";

const MAPA_SOLICITANTE: Record<string, { status: number; mensaje: string }> = {
  P2002: { status: 409, mensaje: "Ya existe un solicitante con ese documento." },
  P2025: { status: 404, mensaje: "Solicitante no encontrado." },
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
};

const MAPA_SOLICITUD: Record<string, { status: number; mensaje: string }> = {
  P2003: { status: 409, mensaje: "El solicitante o el animal no existen." },
  P2025: { status: 404, mensaje: "Solicitud no encontrada." },
};

const MAPA_ADOPCION: Record<string, { status: number; mensaje: string }> = {
  P2002: { status: 409, mensaje: "Esa solicitud ya tiene una adopción registrada." },
  P2003: { status: 409, mensaje: "La solicitud indicada no existe." },
  P2025: { status: 404, mensaje: "Adopción no encontrada." },
};

const MAPA_SEGUIMIENTO: Record<string, { status: number; mensaje: string }> = {
  P2003: { status: 409, mensaje: "La adopción indicada no existe." },
  P2025: { status: 404, mensaje: "Seguimiento no encontrado." },
};

const RELACIONES_SOLICITUD = {
  solicitante: true,
  animal: {
    select: { id_animal: true, nombre: true, codigo_identificador: true },
  },
  evaluador: { select: { id_usuario: true, nombre: true, apellido: true } },
} as const;

export async function listarSolicitantes() {
  return prisma.solicitante.findMany({
    orderBy: { creado_en: "desc" },
    include: { _count: { select: { solicitudes: true } } },
  });
}

export async function obtenerSolicitante(id: string) {
  const solicitante = await prisma.solicitante.findUnique({
    where: { id_solicitante: id },
    include: { _count: { select: { solicitudes: true } } },
  });
  if (!solicitante) {
    throw new ErrorServicio(404, "Solicitante no encontrado.");
  }
  return solicitante;
}

export async function crearSolicitante(input: SolicitanteInput) {
  try {
    return await prisma.solicitante.create({ data: input });
  } catch (error) {
    console.error("Error al crear solicitante:", error);
    throw mapearErrorPrisma(error, MAPA_SOLICITANTE, {
      status: 500,
      mensaje: "No se pudo registrar el solicitante.",
    });
  }
}

export async function actualizarSolicitante(
  id: string,
  input: SolicitanteInput,
) {
  try {
    return await prisma.solicitante.update({
      where: { id_solicitante: id },
      data: input,
    });
  } catch (error) {
    console.error("Error al actualizar solicitante:", error);
    throw mapearErrorPrisma(error, MAPA_SOLICITANTE, {
      status: 500,
      mensaje: "No se pudo actualizar el solicitante.",
    });
  }
}

export async function eliminarSolicitante(id: string) {
  try {
    await prisma.solicitante.delete({ where: { id_solicitante: id } });
  } catch (error) {
    console.error("Error al eliminar solicitante:", error);
    throw mapearErrorPrisma(
      error,
      {
        P2025: {
          status: 404,
          mensaje: "Solicitante no encontrado.",
        },
        P2003: {
          status: 409,
          mensaje:
            "No se puede eliminar el solicitante porque tiene solicitudes de adopción asociadas.",
        },
      },
      {
        status: 500,
        mensaje: "No se pudo eliminar el solicitante.",
      },
    );
  }
}

export async function listarSolicitudes() {
  return prisma.solicitudAdopcion.findMany({
    orderBy: { fecha_solicitud: "desc" },
    include: RELACIONES_SOLICITUD,
  });
}

export async function obtenerSolicitud(id: string) {
  const solicitud = await prisma.solicitudAdopcion.findUnique({
    where: { id_solicitud: id },
    include: RELACIONES_SOLICITUD,
  });
  if (!solicitud) {
    throw new ErrorServicio(404, "Solicitud no encontrada.");
  }
  return solicitud;
}

async function validarRelaciones(idSolicitante: string, idAnimal: string) {
  const animal = await prisma.animal.findUnique({
    where: { id_animal: idAnimal },
    select: { id_animal: true },
  });
  if (!animal) {
    throw new ErrorServicio(409, "El animal seleccionado no existe.");
  }
  const solicitante = await prisma.solicitante.findUnique({
    where: { id_solicitante: idSolicitante },
    select: { id_solicitante: true },
  });
  if (!solicitante) {
    throw new ErrorServicio(409, "El solicitante seleccionado no existe.");
  }
}

export async function crearSolicitud(input: SolicitudInput) {
  await validarRelaciones(input.id_solicitante, input.id_animal);

  try {
    return await prisma.solicitudAdopcion.create({
      data: {
        id_solicitante: input.id_solicitante,
        id_animal: input.id_animal,
        ...(input.estado ? { estado: input.estado } : {}),
        notas_evaluacion: input.notas_evaluacion ?? null,
      },
      include: RELACIONES_SOLICITUD,
    });
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    throw mapearErrorPrisma(error, MAPA_SOLICITUD, {
      status: 500,
      mensaje: "No se pudo registrar la solicitud.",
    });
  }
}

export async function actualizarSolicitud(id: string, input: SolicitudInput) {
  await validarRelaciones(input.id_solicitante, input.id_animal);

  try {
    return await prisma.solicitudAdopcion.update({
      where: { id_solicitud: id },
      data: {
        id_solicitante: input.id_solicitante,
        id_animal: input.id_animal,
        ...(input.estado ? { estado: input.estado } : {}),
        notas_evaluacion: input.notas_evaluacion ?? null,
        actualizado_en: new Date(),
      },
      include: RELACIONES_SOLICITUD,
    });
  } catch (error) {
    console.error("Error al actualizar solicitud:", error);
    throw mapearErrorPrisma(error, MAPA_SOLICITUD, {
      status: 500,
      mensaje: "No se pudo actualizar la solicitud.",
    });
  }
}

export async function eliminarSolicitud(id: string) {
  try {
    await prisma.solicitudAdopcion.delete({ where: { id_solicitud: id } });
  } catch (error) {
    console.error("Error al eliminar solicitud:", error);
    throw mapearErrorPrisma(
      error,
      {
        P2025: { status: 404, mensaje: "Solicitud no encontrada." },
        P2003: {
          status: 409,
          mensaje:
            "No se puede eliminar la solicitud porque tiene una adopción registrada.",
        },
      },
      {
        status: 500,
        mensaje: "No se pudo eliminar la solicitud.",
      },
    );
  }
}

export async function evaluarSolicitud(
  id: string,
  input: EvaluacionSolicitudInput,
  evaluadorId: string,
) {
  try {
    return await prisma.solicitudAdopcion.update({
      where: { id_solicitud: id },
      data: {
        estado: input.estado,
        notas_evaluacion: input.notas_evaluacion,
        evaluador_id: evaluadorId,
      },
    });
  } catch (error) {
    console.error("Error al evaluar solicitud:", error);
    throw mapearErrorPrisma(error, MAPA_SOLICITUD, {
      status: 500,
      mensaje: "No se pudo actualizar la solicitud.",
    });
  }
}

export async function listarAdopciones() {
  return prisma.adopcion.findMany({
    orderBy: { fecha_adopcion: "desc" },
    include: {
      solicitud: {
        include: {
          solicitante: true,
          animal: { select: { id_animal: true, nombre: true } },
        },
      },
      encargado: { select: { id_usuario: true, nombre: true, apellido: true } },
      _count: { select: { seguimientos_post_adopcion: true } },
    },
  });
}

export async function crearAdopcion(input: AdopcionInput, encargadoId: string) {
  const solicitud = await prisma.solicitudAdopcion.findUnique({
    where: { id_solicitud: input.id_solicitud },
    select: { id_solicitud: true, id_animal: true, estado: true, adopcion: true },
  });
  if (!solicitud) {
    throw new ErrorServicio(409, "La solicitud indicada no existe.");
  }
  if (solicitud.estado !== "Aprobada") {
    throw new ErrorServicio(
      409,
      "Solo se puede adoptar a partir de una solicitud aprobada.",
    );
  }
  if (solicitud.adopcion) {
    throw new ErrorServicio(409, "Esa solicitud ya tiene una adopción registrada.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const adopcion = await tx.adopcion.create({
        data: {
          id_solicitud: input.id_solicitud,
          fecha_adopcion: new Date(input.fecha_adopcion),
          contrato_firmado_url: input.contrato_firmado_url,
          encargado_id: encargadoId,
        },
      });
      await tx.animal.update({
        where: { id_animal: solicitud.id_animal },
        data: { estado: "Adoptado" },
      });
      return adopcion;
    });
  } catch (error) {
    console.error("Error al registrar adopción:", error);
    throw mapearErrorPrisma(error, MAPA_ADOPCION, {
      status: 500,
      mensaje: "No se pudo registrar la adopción.",
    });
  }
}

export async function listarSeguimientos(idAdopcion: string) {
  return prisma.seguimientoPostAdopcion.findMany({
    where: { id_adopcion: idAdopcion },
    orderBy: { num_mes: "asc" },
  });
}

export async function crearSeguimiento(input: SeguimientoInput) {
  try {
    return await prisma.seguimientoPostAdopcion.create({
      data: {
        id_adopcion: input.id_adopcion,
        num_mes: input.num_mes,
        fecha_programada: new Date(input.fecha_programada),
      },
    });
  } catch (error) {
    console.error("Error al crear seguimiento:", error);
    throw mapearErrorPrisma(error, MAPA_SEGUIMIENTO, {
      status: 500,
      mensaje: "No se pudo programar el seguimiento.",
    });
  }
}

export async function registrarResultadoSeguimiento(
  id: string,
  input: SeguimientoResultadoInput,
  realizadoPor: string,
) {
  try {
    return await prisma.seguimientoPostAdopcion.update({
      where: { id_seguimiento: id },
      data: {
        fecha_realizada: new Date(input.fecha_realizada),
        estado_evaluacion: input.estado_evaluacion,
        observaciones: input.observaciones,
        evidencias_fotos: input.evidencias_fotos ?? [],
        realizado_por: realizadoPor,
      },
    });
  } catch (error) {
    console.error("Error al registrar resultado de seguimiento:", error);
    throw mapearErrorPrisma(error, MAPA_SEGUIMIENTO, {
      status: 500,
      mensaje: "No se pudo registrar el seguimiento.",
    });
  }
}
