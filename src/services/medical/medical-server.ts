import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type {
  ExpedienteInput,
  HistorialInput,
} from "@/src/services/medical/medical-validation";

const MAPA_EXPEDIENTE: Record<string, { status: number; mensaje: string }> = {
  P2002: { status: 409, mensaje: "Este animal ya tiene un expediente médico." },
  P2003: { status: 409, mensaje: "El animal indicado no existe." },
  P2025: { status: 404, mensaje: "Expediente no encontrado." },
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
};

const MAPA_HISTORIAL: Record<string, { status: number; mensaje: string }> = {
  P2003: { status: 409, mensaje: "El expediente indicado no existe." },
  P2025: { status: 404, mensaje: "Registro clínico no encontrado." },
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
};

/** Lista animales con su expediente médico (o null) y el conteo de historiales. */
export async function listarExpedientes() {
  return prisma.animal.findMany({
    orderBy: { creado_en: "desc" },
    select: {
      id_animal: true,
      codigo_identificador: true,
      nombre: true,
      estado: true,
      foto_principal: true,
      especie: { select: { id_especie: true, nombre_comun: true } },
      expediente_medico: {
        include: {
          historiales_clinicos: {
            orderBy: { fecha_consulta: "desc" },
            take: 1,
            select: { fecha_consulta: true, proxima_cita: true },
          },
          _count: { select: { historiales_clinicos: true } },
        },
      },
    },
  });
}

/** Obtiene el expediente de un animal (con historial completo) o null. */
export async function obtenerExpedientePorAnimal(idAnimal: string) {
  const animal = await prisma.animal.findUnique({
    where: { id_animal: idAnimal },
    select: { id_animal: true },
  });
  if (!animal) {
    throw new ErrorServicio(404, "Animal no encontrado.");
  }

  return prisma.expedienteMedico.findUnique({
    where: { id_animal: idAnimal },
    include: {
      historiales_clinicos: { orderBy: { fecha_consulta: "desc" } },
    },
  });
}

/** Crea o actualiza el expediente médico de un animal (upsert por id_animal). */
export async function guardarExpediente(
  idAnimal: string,
  input: ExpedienteInput,
) {
  const animal = await prisma.animal.findUnique({
    where: { id_animal: idAnimal },
    select: { id_animal: true },
  });
  if (!animal) {
    throw new ErrorServicio(404, "Animal no encontrado.");
  }

  const data = {
    esterilizado: input.esterilizado,
    fecha_esterilizacion: input.fecha_esterilizacion
      ? new Date(input.fecha_esterilizacion)
      : null,
    observaciones_generales: input.observaciones_generales,
    actualizado_en: new Date(),
  };

  try {
    return await prisma.expedienteMedico.upsert({
      where: { id_animal: idAnimal },
      create: { id_animal: idAnimal, ...data },
      update: data,
    });
  } catch (error) {
    console.error("Error al guardar expediente:", error);
    throw mapearErrorPrisma(error, MAPA_EXPEDIENTE, {
      status: 500,
      mensaje: "No se pudo guardar el expediente.",
    });
  }
}

/** Agrega una entrada al historial clínico de un expediente. */
export async function agregarHistorial(
  idExpediente: string,
  input: HistorialInput,
  veterinarioId: string,
) {
  const expediente = await prisma.expedienteMedico.findUnique({
    where: { id_expediente: idExpediente },
    select: { id_expediente: true },
  });
  if (!expediente) {
    throw new ErrorServicio(404, "Expediente no encontrado.");
  }

  try {
    return await prisma.historialClinico.create({
      data: {
        id_expediente: idExpediente,
        id_veterinario: veterinarioId,
        tipo_registro: input.tipo_registro,
        descripcion: input.descripcion,
        diagnostico: input.diagnostico,
        tratamiento: input.tratamiento,
        proxima_cita: input.proxima_cita
          ? new Date(input.proxima_cita)
          : null,
      },
    });
  } catch (error) {
    console.error("Error al agregar historial clínico:", error);
    throw mapearErrorPrisma(error, MAPA_HISTORIAL, {
      status: 500,
      mensaje: "No se pudo registrar la entrada clínica.",
    });
  }
}

/** Elimina una entrada del historial clínico. */
export async function eliminarHistorial(id: string) {
  try {
    await prisma.historialClinico.delete({ where: { id_historial: id } });
  } catch (error) {
    console.error("Error al eliminar historial clínico:", error);
    throw mapearErrorPrisma(error, MAPA_HISTORIAL, {
      status: 500,
      mensaje: "No se pudo eliminar el registro clínico.",
    });
  }
}
