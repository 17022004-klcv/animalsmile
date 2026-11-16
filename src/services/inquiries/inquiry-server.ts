import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type { TipoConsulta } from "@/src/generated/prisma/enums";
import type {
  AlcanceVacuna,
  AnimalPlanResumen,
  EstadoVacuna,
  ItemPlanVacunas,
  PlanVacunas,
  ResumenPlanVacunas,
} from "@/src/types/inquiry";
import type {
  ConsultaConRelaciones,
  DetalleAnimalConsultas,
} from "@/src/services/inquiries/inquiry-validation";

const MAPA_ERRORES_CREAR: Record<string, { status: number; mensaje: string }> = {
  P2002: { status: 409, mensaje: "Ya existe un registro con esos datos." },
  P2003: {
    status: 409,
    mensaje: "Referencia inválida (vacuna, medicamento o enfermedad).",
  },
  P2000: { status: 400, mensaje: "Uno de los campos es demasiado largo." },
  ANIMAL_NO_EXISTE: { status: 404, mensaje: "Animal no encontrado." },
  CONSULTA_NO_EXISTE: { status: 404, mensaje: "Consulta no encontrada." },
};

const MAPA_ERRORES_ELIMINAR: Record<string, { status: number; mensaje: string }> = {
  P2025: { status: 404, mensaje: "Consulta no encontrada." },
  P2003: {
    status: 409,
    mensaje: "No se puede eliminar: la consulta tiene registros asociados.",
  },
};

const INCLUIR_CONSULTA = {
  enfermedad: {
    select: {
      id_enfermedad: true,
      nombre: true,
      es_contagiosa: true,
      requiere_aislamiento: true,
    },
  },
  vacunas: {
    include: {
      vacuna: {
        select: {
          id_vacuna: true,
          nombre: true,
          descripcion: true,
          dosis_recomendada: true,
          intervalo_dias: true,
          edad_minima_meses: true,
        },
      },
    },
  },
  medicamentos: {
    include: {
      medicamento: {
        select: {
          id_medicamento: true,
          nombre: true,
          descripcion: true,
          vias: true,
        },
      },
    },
  },
  veterinario: { select: { id_usuario: true, nombre: true, apellido: true } },
} as const;

type VacunaCatalogo = {
  id_vacuna: number;
  nombre: string;
  descripcion: string | null;
  dosis_recomendada: string | null;
  edad_minima_meses: number | null;
  intervalo_dias: number | null;
  id_especie: number | null;
  id_taxonomia: number | null;
};

type AplicacionVacuna = {
  id_vacuna: number;
  fecha_aplicacion: Date | null;
  proxima_dosis: Date | null;
};

const MS_POR_DIA = 86_400_000;

export function alcanceVacuna(vacuna: VacunaCatalogo): AlcanceVacuna {
  if (vacuna.id_especie !== null) return "Especie";
  if (vacuna.id_taxonomia !== null) return "Taxonomia";
  return "General";
}

/**
 * Calcula el plan de vacunas de un animal: qué vacunas le corresponden según
 * su especie/taxonomía y en qué estado se encuentra cada una.
 */
export function calcularPlanVacunas(parametros: {
  idEspecie: number;
  idTaxonomia: number;
  edadMeses: number | null;
  catalogo: VacunaCatalogo[];
  aplicaciones: AplicacionVacuna[];
}): { items: ItemPlanVacunas[]; resumen: ResumenPlanVacunas } {
  const finDeHoy = new Date();
  finDeHoy.setHours(23, 59, 59, 999);

  const ultimas = new Map<number, AplicacionVacuna>();
  for (const aplicacion of parametros.aplicaciones) {
    const previa = ultimas.get(aplicacion.id_vacuna);
    if (!previa) {
      ultimas.set(aplicacion.id_vacuna, aplicacion);
      continue;
    }
    const fechaPrevia = previa.fecha_aplicacion?.getTime() ?? 0;
    const fechaActual = aplicacion.fecha_aplicacion?.getTime() ?? 0;
    if (fechaActual >= fechaPrevia) {
      ultimas.set(aplicacion.id_vacuna, aplicacion);
    }
  }

  const items: ItemPlanVacunas[] = [];

  for (const vacuna of parametros.catalogo) {
    const aplica =
      (vacuna.id_especie === null && vacuna.id_taxonomia === null) ||
      vacuna.id_especie === parametros.idEspecie ||
      vacuna.id_taxonomia === parametros.idTaxonomia;
    if (!aplica) continue;

    const ultima = ultimas.get(vacuna.id_vacuna);
    const ultimaFecha = ultima?.fecha_aplicacion ?? null;

    let estado: EstadoVacuna;
    if (ultimaFecha) {
      const requiereRefuerzo = ultima?.proxima_dosis
        ? ultima.proxima_dosis.getTime() <= finDeHoy.getTime()
        : Boolean(
            vacuna.intervalo_dias !== null &&
              ultimaFecha.getTime() + vacuna.intervalo_dias * MS_POR_DIA <=
                finDeHoy.getTime(),
          );
      estado = requiereRefuerzo ? "Vencida" : "Al_Dia";
    } else if (
      vacuna.edad_minima_meses !== null &&
      parametros.edadMeses !== null &&
      parametros.edadMeses < vacuna.edad_minima_meses
    ) {
      estado = "No_Corresponde";
    } else {
      estado = "Pendiente";
    }

    const proximaDosis = ultimaFecha
      ? (ultima?.proxima_dosis ??
        (vacuna.intervalo_dias !== null
          ? new Date(ultimaFecha.getTime() + vacuna.intervalo_dias * MS_POR_DIA)
          : null))
      : null;

    items.push({
      id_vacuna: vacuna.id_vacuna,
      nombre: vacuna.nombre,
      descripcion: vacuna.descripcion,
      dosis_recomendada: vacuna.dosis_recomendada,
      edad_minima_meses: vacuna.edad_minima_meses,
      intervalo_dias: vacuna.intervalo_dias,
      alcance: alcanceVacuna(vacuna),
      ultima_aplicacion: ultimaFecha ? ultimaFecha.toISOString() : null,
      proxima_dosis: proximaDosis ? proximaDosis.toISOString() : null,
      estado,
    });
  }

  items.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  const resumen: ResumenPlanVacunas = {
    total: items.length,
    aplicadas: items.filter((i) => i.ultima_aplicacion !== null).length,
    al_dia: items.filter((i) => i.estado === "Al_Dia").length,
    vencidas: items.filter((i) => i.estado === "Vencida").length,
    pendientes: items.filter((i) => i.estado === "Pendiente").length,
  };

  return { items, resumen };
}

async function obtenerCatalogoVacunas(): Promise<VacunaCatalogo[]> {
  return prisma.vacuna.findMany({
    where: { activa: true },
    select: {
      id_vacuna: true,
      nombre: true,
      descripcion: true,
      dosis_recomendada: true,
      edad_minima_meses: true,
      intervalo_dias: true,
      id_especie: true,
      id_taxonomia: true,
    },
  });
}

/** Lista los animales con su resumen de plan de vacunas y última consulta. */
export async function listarAnimalesConConsultas(): Promise<
  (AnimalPlanResumen & {
    ultima_consulta: string | null;
    total_consultas: number;
  })[]
> {
  const [animales, catalogo] = await Promise.all([
    prisma.animal.findMany({
      orderBy: { creado_en: "desc" },
      select: {
        id_animal: true,
        codigo_identificador: true,
        nombre: true,
        estado: true,
        foto_principal: true,
        edad_estimada_meses: true,
        especie: {
          select: {
            id_especie: true,
            nombre_comun: true,
            taxonomia: { select: { id_taxonomia: true, nombre_clase: true } },
          },
        },
        expediente_medico: {
          select: {
            consultas: {
              orderBy: { fecha_consulta: "desc" },
              select: {
                id_consulta: true,
                fecha_consulta: true,
                tipo_consulta: true,
                motivo: true,
                proxima_cita: true,
                vacunas: {
                  select: {
                    id_vacuna: true,
                    fecha_aplicacion: true,
                    proxima_dosis: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    obtenerCatalogoVacunas(),
  ]);

  return animales.map((animal) => {
    const consultas = animal.expediente_medico?.consultas ?? [];
    const aplicaciones = consultas.flatMap((consulta) => consulta.vacunas);
    const plan = calcularPlanVacunas({
      idEspecie: animal.especie.id_especie,
      idTaxonomia: animal.especie.taxonomia.id_taxonomia,
      edadMeses: animal.edad_estimada_meses,
      catalogo,
      aplicaciones,
    });

    return {
      id_animal: animal.id_animal,
      codigo_identificador: animal.codigo_identificador,
      nombre: animal.nombre,
      estado: animal.estado,
      foto_principal: animal.foto_principal,
      edad_estimada_meses: animal.edad_estimada_meses,
      especie: animal.especie,
      plan: plan.resumen,
      ultima_consulta: consultas[0]?.fecha_consulta?.toISOString() ?? null,
      total_consultas: consultas.length,
    };
  });
}

/** Detalle de un animal: expediente, plan de vacunas y consultas registradas. */
export async function obtenerAnimalConConsultas(
  idAnimal: string,
): Promise<DetalleAnimalConsultas> {
  const animal = await prisma.animal.findUnique({
    where: { id_animal: idAnimal },
    select: {
      id_animal: true,
      codigo_identificador: true,
      nombre: true,
      estado: true,
      foto_principal: true,
      edad_estimada_meses: true,
      raza_variedad: true,
      especie: {
        select: {
          id_especie: true,
          nombre_comun: true,
          taxonomia: { select: { id_taxonomia: true, nombre_clase: true } },
        },
      },
      expediente_medico: {
        select: {
          id_expediente: true,
          esterilizado: true,
          fecha_esterilizacion: true,
          observaciones_generales: true,
          consultas: {
            orderBy: { fecha_consulta: "desc" },
            include: INCLUIR_CONSULTA,
          },
        },
      },
    },
  });

  if (!animal) {
    throw new ErrorServicio(404, "Animal no encontrado.");
  }

  const catalogo = await obtenerCatalogoVacunas();
  const consultas = animal.expediente_medico?.consultas ?? [];
  const aplicaciones = consultas.flatMap((consulta) =>
    consulta.vacunas.map((aplicacion) => ({
      id_vacuna: aplicacion.id_vacuna,
      fecha_aplicacion: aplicacion.fecha_aplicacion,
      proxima_dosis: aplicacion.proxima_dosis,
    })),
  );

  const plan = calcularPlanVacunas({
    idEspecie: animal.especie.id_especie,
    idTaxonomia: animal.especie.taxonomia.id_taxonomia,
    edadMeses: animal.edad_estimada_meses,
    catalogo,
    aplicaciones,
  });

  const planVacunas: PlanVacunas = {
    id_animal: animal.id_animal,
    codigo_identificador: animal.codigo_identificador,
    nombre: animal.nombre,
    especie: {
      id_especie: animal.especie.id_especie,
      nombre_comun: animal.especie.nombre_comun,
    },
    taxonomia: animal.especie.taxonomia,
    edad_estimada_meses: animal.edad_estimada_meses,
    resumen: plan.resumen,
    vacunas: plan.items,
  };

  return {
    id_animal: animal.id_animal,
    codigo_identificador: animal.codigo_identificador,
    nombre: animal.nombre,
    estado: animal.estado,
    foto_principal: animal.foto_principal,
    edad_estimada_meses: animal.edad_estimada_meses,
    raza_variedad: animal.raza_variedad,
    especie: animal.especie,
    expediente: animal.expediente_medico
      ? {
          id_expediente: animal.expediente_medico.id_expediente,
          esterilizado: animal.expediente_medico.esterilizado,
          fecha_esterilizacion:
            animal.expediente_medico.fecha_esterilizacion?.toISOString() ?? null,
          observaciones_generales:
            animal.expediente_medico.observaciones_generales,
        }
      : null,
    plan: planVacunas,
    consultas: consultas.map((consulta) => ({
      ...consulta,
      fecha_consulta: consulta.fecha_consulta?.toISOString() ?? null,
      proxima_cita: consulta.proxima_cita?.toISOString() ?? null,
      creado_en: consulta.creado_en?.toISOString() ?? null,
    })) as ConsultaConRelaciones[],
  };
}

/** Plan de vacunas de un animal (usado para refrescar la vista de detalle). */
export async function obtenerPlanVacunas(idAnimal: string): Promise<PlanVacunas> {
  const detalle = await obtenerAnimalConConsultas(idAnimal);
  return detalle.plan;
}

async function datosVacunas(
  ids: number[],
): Promise<Map<number, VacunaCatalogo>> {
  if (!ids.length) return new Map();
  const vacunas = await prisma.vacuna.findMany({
    where: { id_vacuna: { in: ids } },
    select: {
      id_vacuna: true,
      nombre: true,
      descripcion: true,
      dosis_recomendada: true,
      edad_minima_meses: true,
      intervalo_dias: true,
      id_especie: true,
      id_taxonomia: true,
    },
  });
  return new Map(vacunas.map((vacuna) => [vacuna.id_vacuna, vacuna]));
}

/** Registra una consulta veterinaria en el expediente médico de un animal. */
export async function crearConsulta(
  idAnimal: string,
  input: {
    tipo_consulta: string;
    fecha_consulta: string | null;
    motivo: string;
    diagnostico: string | null;
    tratamiento: string | null;
    id_enfermedad: number | null;
    peso_kg: number | null;
    proxima_cita: string | null;
    observaciones: string | null;
    vacunas: {
      id_vacuna: number;
      lote: string | null;
      fecha_aplicacion: string | null;
      proxima_dosis: string | null;
      observaciones: string | null;
    }[];
    medicamentos: {
      id_medicamento: number;
      dosis: string | null;
      via_administracion: string | null;
      fecha_aplicacion: string | null;
      observaciones: string | null;
    }[];
  },
  usuarioId: string,
): Promise<ConsultaConRelaciones> {
  const animal = await prisma.animal.findUnique({
    where: { id_animal: idAnimal },
    select: { id_animal: true },
  });
  if (!animal) {
    throw new ErrorServicio(404, "Animal no encontrado.");
  }

  const fechaConsulta = input.fecha_consulta
    ? new Date(input.fecha_consulta)
    : new Date();
  const catalogo = await datosVacunas(input.vacunas.map((v) => v.id_vacuna));

  try {
    return await prisma.$transaction(async (tx) => {
      const expediente = await tx.expedienteMedico.upsert({
        where: { id_animal: idAnimal },
        create: { id_animal: idAnimal },
        update: {},
        select: { id_expediente: true },
      });

      const consulta = await tx.consulta.create({
        data: {
          id_expediente: expediente.id_expediente,
          id_veterinario: usuarioId,
          registrado_por: usuarioId,
          fecha_consulta: fechaConsulta,
          tipo_consulta: input.tipo_consulta as TipoConsulta,
          motivo: input.motivo,
          diagnostico: input.diagnostico,
          tratamiento: input.tratamiento,
          id_enfermedad: input.id_enfermedad,
          peso_kg: input.peso_kg,
          proxima_cita: input.proxima_cita
            ? new Date(input.proxima_cita)
            : null,
          observaciones: input.observaciones,
          vacunas: {
            create: input.vacunas.map((vacuna) => {
              const fechaAplicacion = vacuna.fecha_aplicacion
                ? new Date(vacuna.fecha_aplicacion)
                : fechaConsulta;
              const intervalo =
                catalogo.get(vacuna.id_vacuna)?.intervalo_dias ?? null;
              const proximaDosis = vacuna.proxima_dosis
                ? new Date(vacuna.proxima_dosis)
                : intervalo !== null
                  ? new Date(fechaAplicacion.getTime() + intervalo * MS_POR_DIA)
                  : null;

              return {
                id_vacuna: vacuna.id_vacuna,
                lote: vacuna.lote,
                fecha_aplicacion: fechaAplicacion,
                proxima_dosis: proximaDosis,
                observaciones: vacuna.observaciones,
              };
            }),
          },
          medicamentos: {
            create: input.medicamentos.map((medicamento) => ({
              id_medicamento: medicamento.id_medicamento,
              dosis: medicamento.dosis,
              via_administracion: medicamento.via_administracion,
              fecha_aplicacion: medicamento.fecha_aplicacion
                ? new Date(medicamento.fecha_aplicacion)
                : fechaConsulta,
              observaciones: medicamento.observaciones,
            })),
          },
        },
        include: INCLUIR_CONSULTA,
      });

      return {
        ...consulta,
        fecha_consulta: consulta.fecha_consulta?.toISOString() ?? null,
        proxima_cita: consulta.proxima_cita?.toISOString() ?? null,
        creado_en: consulta.creado_en?.toISOString() ?? null,
      } as ConsultaConRelaciones;
    });
  } catch (error) {
    console.error("Error al registrar la consulta:", error);
    throw mapearErrorPrisma(error, MAPA_ERRORES_CREAR, {
      status: 500,
      mensaje: "No se pudo registrar la consulta.",
    });
  }
}

/** Actualiza una consulta veterinaria (reemplaza vacunas y medicamentos). */
export async function actualizarConsulta(
  idConsulta: string,
  input: {
    tipo_consulta: string;
    fecha_consulta: string | null;
    motivo: string;
    diagnostico: string | null;
    tratamiento: string | null;
    id_enfermedad: number | null;
    peso_kg: number | null;
    proxima_cita: string | null;
    observaciones: string | null;
    vacunas: {
      id_vacuna: number;
      lote: string | null;
      fecha_aplicacion: string | null;
      proxima_dosis: string | null;
      observaciones: string | null;
    }[];
    medicamentos: {
      id_medicamento: number;
      dosis: string | null;
      via_administracion: string | null;
      fecha_aplicacion: string | null;
      observaciones: string | null;
    }[];
  },
): Promise<ConsultaConRelaciones> {
  const existente = await prisma.consulta.findUnique({
    where: { id_consulta: idConsulta },
    select: { id_consulta: true },
  });
  if (!existente) {
    throw new ErrorServicio(404, "Consulta no encontrada.");
  }

  const fechaConsulta = input.fecha_consulta
    ? new Date(input.fecha_consulta)
    : new Date();
  const catalogo = await datosVacunas(input.vacunas.map((v) => v.id_vacuna));

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.vacunaAplicada.deleteMany({
        where: { id_consulta: idConsulta },
      });
      await tx.medicamentoAplicado.deleteMany({
        where: { id_consulta: idConsulta },
      });

      const consulta = await tx.consulta.update({
        where: { id_consulta: idConsulta },
        data: {
          fecha_consulta: fechaConsulta,
          tipo_consulta: input.tipo_consulta as TipoConsulta,
          motivo: input.motivo,
          diagnostico: input.diagnostico,
          tratamiento: input.tratamiento,
          id_enfermedad: input.id_enfermedad,
          peso_kg: input.peso_kg,
          proxima_cita: input.proxima_cita
            ? new Date(input.proxima_cita)
            : null,
          observaciones: input.observaciones,
          vacunas: {
            create: input.vacunas.map((vacuna) => {
              const fechaAplicacion = vacuna.fecha_aplicacion
                ? new Date(vacuna.fecha_aplicacion)
                : fechaConsulta;
              const intervalo =
                catalogo.get(vacuna.id_vacuna)?.intervalo_dias ?? null;
              const proximaDosis = vacuna.proxima_dosis
                ? new Date(vacuna.proxima_dosis)
                : intervalo !== null
                  ? new Date(fechaAplicacion.getTime() + intervalo * MS_POR_DIA)
                  : null;

              return {
                id_vacuna: vacuna.id_vacuna,
                lote: vacuna.lote,
                fecha_aplicacion: fechaAplicacion,
                proxima_dosis: proximaDosis,
                observaciones: vacuna.observaciones,
              };
            }),
          },
          medicamentos: {
            create: input.medicamentos.map((medicamento) => ({
              id_medicamento: medicamento.id_medicamento,
              dosis: medicamento.dosis,
              via_administracion: medicamento.via_administracion,
              fecha_aplicacion: medicamento.fecha_aplicacion
                ? new Date(medicamento.fecha_aplicacion)
                : fechaConsulta,
              observaciones: medicamento.observaciones,
            })),
          },
        },
        include: INCLUIR_CONSULTA,
      });

      return {
        ...consulta,
        fecha_consulta: consulta.fecha_consulta?.toISOString() ?? null,
        proxima_cita: consulta.proxima_cita?.toISOString() ?? null,
        creado_en: consulta.creado_en?.toISOString() ?? null,
      } as ConsultaConRelaciones;
    });
  } catch (error) {
    console.error("Error al actualizar la consulta:", error);
    throw mapearErrorPrisma(error, MAPA_ERRORES_CREAR, {
      status: 500,
      mensaje: "No se pudo actualizar la consulta.",
    });
  }
}

/** Obtiene una consulta con todas sus relaciones. */
export async function obtenerConsulta(
  idConsulta: string,
): Promise<ConsultaConRelaciones> {
  const consulta = await prisma.consulta.findUnique({
    where: { id_consulta: idConsulta },
    include: INCLUIR_CONSULTA,
  });

  if (!consulta) {
    throw new ErrorServicio(404, "Consulta no encontrada.");
  }

  return {
    ...consulta,
    fecha_consulta: consulta.fecha_consulta?.toISOString() ?? null,
    proxima_cita: consulta.proxima_cita?.toISOString() ?? null,
    creado_en: consulta.creado_en?.toISOString() ?? null,
  } as ConsultaConRelaciones;
}

/** Elimina una consulta (y sus vacunas/medicamentos aplicados). */
export async function eliminarConsulta(idConsulta: string): Promise<void> {
  try {
    await prisma.consulta.delete({ where: { id_consulta: idConsulta } });
  } catch (error) {
    console.error("Error al eliminar la consulta:", error);
    throw mapearErrorPrisma(error, MAPA_ERRORES_ELIMINAR, {
      status: 500,
      mensaje: "No se pudo eliminar la consulta.",
    });
  }
}

// =============================================================================
// CATÁLOGOS
// =============================================================================

export type TipoCatalogo = "vacuna" | "medicamento" | "enfermedad";

/** Devuelve los tres catálogos médicos con sus relaciones. */
export async function obtenerCatalogos() {
  const [vacunas, medicamentos, enfermedades] = await Promise.all([
    prisma.vacuna.findMany({
      orderBy: { nombre: "asc" },
      include: {
        especie: { select: { id_especie: true, nombre_comun: true } },
        taxonomia: { select: { id_taxonomia: true, nombre_clase: true } },
      },
    }),
    prisma.medicamento.findMany({ orderBy: { nombre: "asc" } }),
    prisma.enfermedad.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return {
    vacunas: vacunas.map((vacuna) => ({
      ...vacuna,
      alcance: alcanceVacuna(vacuna),
    })),
    medicamentos,
    enfermedades,
  };
}

/** Crea un elemento en uno de los catálogos médicos. */
export async function crearCatalogo(
  tipo: TipoCatalogo,
  datos: Record<string, unknown>,
): Promise<unknown> {
  try {
    if (tipo === "vacuna") {
      return await prisma.vacuna.create({
        data: {
          nombre: String(datos.nombre),
          descripcion: (datos.descripcion as string | null) ?? null,
          id_especie: (datos.id_especie as number | null) ?? null,
          id_taxonomia: (datos.id_taxonomia as number | null) ?? null,
          edad_minima_meses: (datos.edad_minima_meses as number | null) ?? null,
          intervalo_dias: (datos.intervalo_dias as number | null) ?? null,
          dosis_recomendada: (datos.dosis_recomendada as string | null) ?? null,
          activa: true,
        },
        include: {
          especie: { select: { id_especie: true, nombre_comun: true } },
          taxonomia: { select: { id_taxonomia: true, nombre_clase: true } },
        },
      });
    }

    if (tipo === "medicamento") {
      return await prisma.medicamento.create({
        data: {
          nombre: String(datos.nombre),
          descripcion: (datos.descripcion as string | null) ?? null,
          vias: (datos.vias as string | null) ?? null,
          activo: true,
        },
      });
    }

    return await prisma.enfermedad.create({
      data: {
        nombre: String(datos.nombre),
        descripcion: (datos.descripcion as string | null) ?? null,
        es_contagiosa: (datos.es_contagiosa as boolean | null) ?? false,
        requiere_aislamiento:
          (datos.requiere_aislamiento as boolean | null) ?? false,
        activa: true,
      },
    });
  } catch (error) {
    console.error("Error al crear el catálogo:", error);
    throw mapearErrorPrisma(error, MAPA_ERRORES_CREAR, {
      status: 500,
      mensaje: "No se pudo registrar el elemento del catálogo.",
    });
  }
}

/** Actualiza un elemento de uno de los catálogos médicos. */
export async function actualizarCatalogo(
  tipo: TipoCatalogo,
  id: number,
  datos: Record<string, unknown>,
): Promise<unknown> {
  try {
    if (tipo === "vacuna") {
      return await prisma.vacuna.update({
        where: { id_vacuna: id },
        data: {
          nombre: (datos.nombre as string | undefined) ?? undefined,
          descripcion:
            (datos.descripcion as string | null | undefined) ?? undefined,
          id_especie: (datos.id_especie as number | null | undefined) ?? undefined,
          id_taxonomia:
            (datos.id_taxonomia as number | null | undefined) ?? undefined,
          edad_minima_meses:
            (datos.edad_minima_meses as number | null | undefined) ?? undefined,
          intervalo_dias:
            (datos.intervalo_dias as number | null | undefined) ?? undefined,
          dosis_recomendada:
            (datos.dosis_recomendada as string | null | undefined) ?? undefined,
        },
        include: {
          especie: { select: { id_especie: true, nombre_comun: true } },
          taxonomia: { select: { id_taxonomia: true, nombre_clase: true } },
        },
      });
    }

    if (tipo === "medicamento") {
      return await prisma.medicamento.update({
        where: { id_medicamento: id },
        data: {
          nombre: (datos.nombre as string | undefined) ?? undefined,
          descripcion:
            (datos.descripcion as string | null | undefined) ?? undefined,
          vias: (datos.vias as string | null | undefined) ?? undefined,
        },
      });
    }

    return await prisma.enfermedad.update({
      where: { id_enfermedad: id },
      data: {
        nombre: (datos.nombre as string | undefined) ?? undefined,
        descripcion:
          (datos.descripcion as string | null | undefined) ?? undefined,
        es_contagiosa:
          (datos.es_contagiosa as boolean | null | undefined) ?? undefined,
        requiere_aislamiento:
          (datos.requiere_aislamiento as boolean | null | undefined) ?? undefined,
      },
    });
  } catch (error) {
    console.error("Error al actualizar el catálogo:", error);
    throw mapearErrorPrisma(error, MAPA_ERRORES_CREAR, {
      status: 500,
      mensaje: "No se pudo actualizar el elemento del catálogo.",
    });
  }
}

/** Elimina (desactiva) un elemento de uno de los catálogos médicos. */
export async function eliminarCatalogo(
  tipo: TipoCatalogo,
  id: number,
): Promise<void> {
  try {
    if (tipo === "vacuna") {
      await prisma.vacuna.update({
        where: { id_vacuna: id },
        data: { activa: false },
      });
      return;
    }
    if (tipo === "medicamento") {
      await prisma.medicamento.update({
        where: { id_medicamento: id },
        data: { activo: false },
      });
      return;
    }
    await prisma.enfermedad.update({
      where: { id_enfermedad: id },
      data: { activa: false },
    });
  } catch (error) {
    console.error("Error al eliminar el catálogo:", error);
    throw mapearErrorPrisma(error, MAPA_ERRORES_ELIMINAR, {
      status: 500,
      mensaje: "No se pudo eliminar el elemento del catálogo.",
    });
  }
}
