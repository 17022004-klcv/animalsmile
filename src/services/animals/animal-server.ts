import { prisma } from "@/src/lib/prisma";
import { generarCodigoEspecie } from "@/src/services/animals/animal-validation";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type { AnimalInput, AnimalParcial, RescateInput } from "@/src/types/animal";
import type { EstadoAnimal } from "@/src/generated/prisma/enums";
import type { Prisma } from "@/src/generated/prisma/client";

const MAPA_ERRORES_CREAR: Record<string, { status: number; mensaje: string }> = {
  P2002: { status: 409, mensaje: "Ya existe un animal con ese código identificador." },
  P2000: {
    status: 400,
    mensaje: "Uno de los campos es demasiado largo (revisa la URL de la foto principal).",
  },
  P2003: { status: 409, mensaje: "Referencia inválida (especie o datos de rescate)." },
  ESPECIE_NO_EXISTE: { status: 409, mensaje: "La especie seleccionada no existe." },
  CODIGO_FAIL: {
    status: 500,
    mensaje: "No se pudo generar un código identificador único. Intenta de nuevo.",
  },
};

const MAPA_ERRORES_ACTUALIZAR: Record<string, { status: number; mensaje: string }> = {
  P2002: { status: 409, mensaje: "Ya existe un animal con ese código identificador." },
  P2000: {
    status: 400,
    mensaje: "Uno de los campos es demasiado largo (revisa la URL de la foto principal).",
  },
  P2003: { status: 409, mensaje: "La especie seleccionada no existe." },
  P2025: { status: 404, mensaje: "Animal no encontrado." },
};

const MAPA_ERRORES_ELIMINAR: Record<string, { status: number; mensaje: string }> = {
  P2003: {
    status: 409,
    mensaje:
      "No se puede eliminar: el animal tiene solicitudes de adopción, expediente médico o traslados registrados.",
  },
  P2025: { status: 404, mensaje: "Animal no encontrado." },
};

const incluirRelaciones = {
  especie: { select: { id_especie: true, nombre_comun: true } },
  rescate: true,
} as const;

export async function listarAnimales() {
  return prisma.animal.findMany({
    orderBy: { creado_en: "desc" },
    include: {
      especie: { select: { id_especie: true, nombre_comun: true } },
      rescate: {
        select: {
          id_rescate: true,
          fecha_rescate: true,
          ubicacion_hallazgo: true,
          nombre_rescatista: true,
          contacto_rescatista: true,
          condicion_inicial: true,
          fotos_ingreso: true,
        },
      },
    },
  });
}

export async function obtenerAnimal(id: string) {
  const animal = await prisma.animal.findUnique({
    where: { id_animal: id },
    include: {
      especie: { select: { id_especie: true, nombre_comun: true } },
      rescate: true,
    },
  });
  if (!animal) {
    throw new ErrorServicio(404, "Animal no encontrado.");
  }
  return animal;
}

export async function crearAnimal(input: AnimalInput, creadoPor: string) {
  const especie = await prisma.especie.findUnique({
    where: { id_especie: input.id_especie },
    select: { nombre_comun: true },
  });
  if (!especie) {
    throw new ErrorServicio(409, "La especie seleccionada no existe.");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      let idRescate: string | null = null;
      if (input.rescate) {
        const fecha = input.rescate.fecha_rescate;
        const fechaIso = fecha.includes("T") ? fecha : `${fecha}T00:00:00.000Z`;
        const creado = await tx.rescate.create({
          data: {
            fecha_rescate: new Date(fechaIso),
            ubicacion_hallazgo: input.rescate.ubicacion_hallazgo,
            nombre_rescatista: input.rescate.nombre_rescatista,
            contacto_rescatista: input.rescate.contacto_rescatista,
            condicion_inicial: input.rescate.condicion_inicial,
            fotos_ingreso: input.rescate.fotos_ingreso ?? [],
            creado_por: creadoPor,
          },
        });
        idRescate = creado.id_rescate;
      }

      let codigo = input.codigo_identificador ?? "";
      if (!codigo) {
        for (let intento = 0; intento < 5; intento++) {
          const candidato = generarCodigoEspecie(especie.nombre_comun);
          const existe = await tx.animal.findUnique({
            where: { codigo_identificador: candidato },
            select: { id_animal: true },
          });
          if (!existe) {
            codigo = candidato;
            break;
          }
        }
        if (!codigo) {
          throw Object.assign(
            new Error("No se pudo generar un código único."),
            { code: "CODIGO_FAIL" },
          );
        }
      }

      return tx.animal.create({
        data: {
          codigo_identificador: codigo,
          nombre: input.nombre,
          id_especie: input.id_especie,
          id_rescate: idRescate,
          raza_variedad: input.raza_variedad ?? undefined,
          edad_estimada_meses: input.edad_estimada_meses,
          temperamento: input.temperamento,
          nivel_energia: input.nivel_energia,
          estado: input.estado as EstadoAnimal,
          foto_principal: input.foto_principal,
        },
        include: incluirRelaciones,
      });
    });
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "CODIGO_FAIL") {
      throw new ErrorServicio(
        500,
        "No se pudo generar un código identificador único. Intenta de nuevo.",
      );
    }
    console.error("Error al crear animal:", error);
    throw mapearErrorPrisma(error, MAPA_ERRORES_CREAR, {
      status: 500,
      mensaje: "No se pudo registrar el animal.",
    });
  }
}

export async function actualizarAnimal(
  id: string,
  data: AnimalParcial,
  rescate: RescateInput | null | undefined,
  actualizadoPor: string,
) {
  const existente = await prisma.animal.findUnique({
    where: { id_animal: id },
    select: { id_animal: true, id_rescate: true },
  });
  if (!existente) {
    throw new ErrorServicio(404, "Animal no encontrado.");
  }

  if (data.id_especie !== undefined) {
    const especie = await prisma.especie.findUnique({
      where: { id_especie: data.id_especie },
      select: { id_especie: true },
    });
    if (!especie) {
      throw new ErrorServicio(409, "La especie seleccionada no existe.");
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      if (rescate === null) {
        data.id_rescate = null;
        if (existente.id_rescate) {
          const otros = await tx.animal.count({
            where: {
              id_rescate: existente.id_rescate,
              id_animal: { not: id },
            },
          });
          const bitacoras = await tx.bitacoraRescate.count({
            where: { id_rescate: existente.id_rescate },
          });
          if (otros === 0 && bitacoras === 0) {
            await tx.rescate.delete({
              where: { id_rescate: existente.id_rescate },
            });
          }
        }
      } else if (rescate) {
        const fecha = rescate.fecha_rescate;
        const fechaIso = fecha.includes("T") ? fecha : `${fecha}T00:00:00.000Z`;
        const datosRescate = {
          fecha_rescate: new Date(fechaIso),
          ubicacion_hallazgo: rescate.ubicacion_hallazgo,
          nombre_rescatista: rescate.nombre_rescatista,
          contacto_rescatista: rescate.contacto_rescatista,
          condicion_inicial: rescate.condicion_inicial,
          fotos_ingreso: rescate.fotos_ingreso ?? [],
        };
        if (existente.id_rescate) {
          await tx.rescate.update({
            where: { id_rescate: existente.id_rescate },
            data: datosRescate,
          });
        } else {
          const creado = await tx.rescate.create({
            data: { ...datosRescate, creado_por: actualizadoPor },
          });
          data.id_rescate = creado.id_rescate;
        }
      }

      return tx.animal.update({
        where: { id_animal: id },
        data: data as Prisma.AnimalUncheckedUpdateInput,
        include: incluirRelaciones,
      });
    });
  } catch (error) {
    console.error("Error al actualizar animal:", error);
    throw mapearErrorPrisma(error, MAPA_ERRORES_ACTUALIZAR, {
      status: 500,
      mensaje: "No se pudo actualizar el animal.",
    });
  }
}

export async function eliminarAnimal(id: string) {
  const existente = await prisma.animal.findUnique({
    where: { id_animal: id },
    select: { id_animal: true, id_rescate: true },
  });
  if (!existente) {
    throw new ErrorServicio(404, "Animal no encontrado.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.animal.delete({ where: { id_animal: id } });

      if (existente.id_rescate) {
        const otros = await tx.animal.count({
          where: {
            id_rescate: existente.id_rescate,
            id_animal: { not: id },
          },
        });
        const bitacoras = await tx.bitacoraRescate.count({
          where: { id_rescate: existente.id_rescate },
        });
        if (otros === 0 && bitacoras === 0) {
          await tx.rescate.delete({
            where: { id_rescate: existente.id_rescate },
          });
        }
      }
    });
  } catch (error) {
    console.error("Error al eliminar animal:", error);
    throw mapearErrorPrisma(error, MAPA_ERRORES_ELIMINAR, {
      status: 500,
      mensaje: "No se pudo eliminar el animal.",
    });
  }
}
