import { prisma } from "@/src/lib/prisma";
import type { Prisma } from "@/src/generated/prisma/client";
import type {
  EspecieDashboard,
  EstadisticasDashboard,
  FiltroDashboard,
  PeriodoDashboard,
  ResumenInsumos,
  SolicitudResumen,
  TrasladoResumen,
} from "@/src/types/dashboard";

const PERIODOS: readonly PeriodoDashboard[] = [
  "hoy",
  "esta_semana",
  "este_mes",
  "anio",
];

const ESPECIES: readonly EspecieDashboard[] = ["todas", "perros", "gatos"];

const ESTADOS_PRESENTES = [
  "En_Cuarentena",
  "Disponible_Adopcion",
  "En_Tratamiento",
] as const;

const ESTADOS_PENDIENTES = [
  "Pendiente",
  "En_Evaluacion",
  "Entrevista_Domiciliaria",
] as const;

const TIPOS_INSUMO = [
  "Alimentos",
  "Medicamentos",
  "Higiene_Limpieza",
] as const;

const CAPACIDAD_POR_DEFECTO = 50;
const META_RECAUDACION_POR_DEFECTO = 5000;

function parseFiltroDashboard(url: string): FiltroDashboard {
  const params = new URL(url).searchParams;
  const periodo = params.get("periodo");
  const especie = params.get("especie");

  return {
    periodo:
      periodo && (PERIODOS as readonly string[]).includes(periodo)
        ? (periodo as PeriodoDashboard)
        : "este_mes",
    especie:
      especie && (ESPECIES as readonly string[]).includes(especie)
        ? (especie as EspecieDashboard)
        : "todas",
  };
}

function rangoPeriodo(periodo: PeriodoDashboard): { desde: Date; hasta: Date } {
  const hasta = new Date();
  const desde = new Date(hasta);

  switch (periodo) {
    case "hoy":
      desde.setHours(0, 0, 0, 0);
      break;
    case "esta_semana": {
      desde.setHours(0, 0, 0, 0);
      const dia = (desde.getDay() + 6) % 7;
      desde.setDate(desde.getDate() - dia);
      break;
    }
    case "este_mes":
      desde.setDate(1);
      desde.setHours(0, 0, 0, 0);
      break;
    case "anio":
      desde.setMonth(0, 1);
      desde.setHours(0, 0, 0, 0);
      break;
  }

  return { desde, hasta };
}

function rangoAnterior(rango: { desde: Date; hasta: Date }) {
  const duracion = rango.hasta.getTime() - rango.desde.getTime();
  return {
    desde: new Date(rango.desde.getTime() - duracion),
    hasta: new Date(rango.desde),
  };
}

function filtroEspecie(especie: EspecieDashboard): Prisma.EspecieWhereInput | undefined {
  if (especie === "todas") return undefined;
  const terminos =
    especie === "perros" ? ["perr", "canin"] : ["gat", "felin"];
  return {
    OR: terminos.map((termino) => ({
      nombre_comun: { contains: termino, mode: "insensitive" as const },
    })),
  };
}

async function configNumerica(clave: string, porDefecto: number): Promise<number> {
  const fila = await prisma.configuracionSistema.findUnique({
    where: { clave },
    select: { valor: true },
  });
  const numero = fila ? Number(fila.valor) : NaN;
  return Number.isFinite(numero) && numero > 0 ? numero : porDefecto;
}

function etiquetaTraslado(traslado: {
  estado_salida: string | null;
  estado_llegada: string | null;
}): string {
  if (traslado.estado_llegada) return "Completado";
  if (traslado.estado_salida) return "En Ruta";
  return "Programado";
}

export async function obtenerEstadisticasDashboard(
  filtro: FiltroDashboard,
): Promise<EstadisticasDashboard> {
  const rango = rangoPeriodo(filtro.periodo);
  const anterior = rangoAnterior(rango);
  const especie = filtroEspecie(filtro.especie);

  const whereAnimal: Prisma.AnimalWhereInput = especie
    ? { especie: { is: especie } }
    : {};
  const whereRescateEspecie: Prisma.RescateWhereInput = especie
    ? { animales: { some: { especie: { is: especie } } } }
    : {};
  const whereExpedienteEspecie: Prisma.ExpedienteMedicoWhereInput = especie
    ? { animal: { is: { especie: { is: especie } } } }
    : {};
  const whereConsultaEspecie: Prisma.ConsultaWhereInput = especie
    ? {
        expediente: {
          is: { animal: { is: { especie: { is: especie } } } },
        },
      }
    : {};
  const whereSolicitudEspecie: Prisma.SolicitudAdopcionWhereInput = especie
    ? { animal: { is: { especie: { is: especie } } } }
    : {};

  const rangoFecha = { gte: rango.desde, lte: rango.hasta };
  const rangoFechaAnterior = { gte: anterior.desde, lte: anterior.hasta };

  const [
    ocupados,
    capacidad,
    rescatesPeriodo,
    rescatesAnterior,
    solicitudesPendientes,
    solicitudesEntrevista,
    recaudacion,
    metaRecaudacion,
    porEstado,
    ultimoRescate,
    expedientesTotal,
    expedientesEsterilizados,
    consultasPeriodo,
    proximasCirugias,
    solicitudesRecientes,
    trasladosRecientes,
    seguimientosActivos,
    insumosAgrupados,
    ultimoBackup,
    loginsFallidos,
    personalActivo,
  ] = await Promise.all([
    prisma.animal.count({
      where: { ...whereAnimal, estado: { in: [...ESTADOS_PRESENTES] } },
    }),
    configNumerica("dashboard_capacidad_refugio", CAPACIDAD_POR_DEFECTO),
    prisma.rescate.count({
      where: { ...whereRescateEspecie, fecha_rescate: rangoFecha },
    }),
    prisma.rescate.count({
      where: { ...whereRescateEspecie, fecha_rescate: rangoFechaAnterior },
    }),
    prisma.solicitudAdopcion.count({
      where: { ...whereSolicitudEspecie, estado: { in: [...ESTADOS_PENDIENTES] } },
    }),
    prisma.solicitudAdopcion.count({
      where: {
        ...whereSolicitudEspecie,
        estado: "Entrevista_Domiciliaria",
      },
    }),
    prisma.donacion.aggregate({
      _sum: { monto: true },
      where: { tipo: "Financiera", fecha_donacion: rangoFecha },
    }),
    configNumerica(
      "dashboard_meta_recaudacion",
      META_RECAUDACION_POR_DEFECTO,
    ),
    prisma.animal.groupBy({
      by: ["estado"],
      _count: true,
      where: whereAnimal,
    }),
    prisma.rescate.findFirst({
      orderBy: { fecha_rescate: "desc" },
      where: whereRescateEspecie,
      select: { fecha_rescate: true },
    }),
    prisma.expedienteMedico.count({ where: whereExpedienteEspecie }),
    prisma.expedienteMedico.count({
      where: { ...whereExpedienteEspecie, esterilizado: true },
    }),
    prisma.consulta.count({
      where: { ...whereConsultaEspecie, fecha_consulta: rangoFecha },
    }),
    prisma.consulta.count({
      where: { tipo_consulta: "Cirugia", proxima_cita: { gte: new Date() } },
    }),
    prisma.solicitudAdopcion.findMany({
      orderBy: { fecha_solicitud: "desc" },
      take: 4,
      include: {
        solicitante: { select: { nombre: true, apellido: true } },
        animal: { select: { nombre: true, codigo_identificador: true } },
      },
    }),
    prisma.traslado.findMany({
      orderBy: { fecha_traslado: "desc" },
      take: 3,
      include: {
        santuario: { select: { nombre: true } },
        animal: { select: { nombre: true } },
      },
    }),
    prisma.seguimientoPostAdopcion.count({
      where: { fecha_realizada: null },
    }),
    prisma.donacion.groupBy({
      by: ["tipo"],
      _sum: { cantidad: true },
      where: {
        tipo: { in: [...TIPOS_INSUMO] },
        fecha_donacion: rangoFecha,
      },
    }),
    prisma.backup.findFirst({
      orderBy: { fecha_inicio: "desc" },
      select: { estado: true, fecha_inicio: true, fecha_fin: true },
    }),
    prisma.bitacoraAcceso.count({
      where: { tipo_evento: "Login_Fallido", fecha_evento: rangoFecha },
    }),
    prisma.usuario.count({ where: { activo: true } }),
  ]);

  const conteoEstados: Record<string, number> = {};
  for (const fila of porEstado) {
    conteoEstados[fila.estado] = fila._count;
  }

  const solicitudes: SolicitudResumen[] = solicitudesRecientes.map((s) => ({
    id: s.id_solicitud,
    solicitante: `${s.solicitante.nombre} ${s.solicitante.apellido}`.trim(),
    animal: s.animal.nombre,
    codigo: s.animal.codigo_identificador,
    estado: s.estado,
  }));

  const traslados: TrasladoResumen[] = trasladosRecientes.map((t) => ({
    id: t.id_traslado,
    santuario: t.santuario.nombre,
    animal: t.animal.nombre,
    detalle: t.motivo,
    estado: etiquetaTraslado(t),
  }));

  const insumos: ResumenInsumos = {
    alimentos: 0,
    medicamentos: 0,
    higiene: 0,
  };
  for (const fila of insumosAgrupados) {
    const total = fila._sum.cantidad ? Number(fila._sum.cantidad) : 0;
    if (fila.tipo === "Alimentos") insumos.alimentos = total;
    else if (fila.tipo === "Medicamentos") insumos.medicamentos = total;
    else if (fila.tipo === "Higiene_Limpieza") insumos.higiene = total;
  }

  const totalRecaudado = Number(recaudacion._sum.monto ?? 0);
  const variacionRescates =
    rescatesAnterior > 0
      ? Math.round(((rescatesPeriodo - rescatesAnterior) / rescatesAnterior) * 100)
      : rescatesPeriodo > 0
        ? 100
        : 0;

  return {
    generadoEn: new Date().toISOString(),
    filtro,
    kpis: {
      capacidad: {
        ocupados,
        total: capacidad,
        porcentaje: capacidad > 0 ? Math.round((ocupados / capacidad) * 100) : 0,
      },
      rescates: { total: rescatesPeriodo, variacionPct: variacionRescates },
      solicitudes: {
        pendientes: solicitudesPendientes,
        enEntrevista: solicitudesEntrevista,
      },
      recaudacion: {
        total: totalRecaudado,
        meta: metaRecaudacion,
        porcentaje:
          metaRecaudacion > 0
            ? Math.round((totalRecaudado / metaRecaudacion) * 100)
            : 0,
      },
    },
    estadoAnimal: {
      disponible: conteoEstados["Disponible_Adopcion"] ?? 0,
      cuarentena: conteoEstados["En_Cuarentena"] ?? 0,
      tratamiento: conteoEstados["En_Tratamiento"] ?? 0,
      trasladado: conteoEstados["Trasladado"] ?? 0,
      ultimoRescate: ultimoRescate?.fecha_rescate
        ? ultimoRescate.fecha_rescate.toISOString()
        : null,
    },
    salud: {
      esterilizadosPct:
        expedientesTotal > 0
          ? Math.round((expedientesEsterilizados / expedientesTotal) * 100)
          : 0,
      consultas: consultasPeriodo,
      proximasCirugias,
    },
    solicitudes,
    traslados,
    seguimientosActivos,
    insumos,
    seguridad: {
      ultimoBackup: ultimoBackup
        ? {
            estado: ultimoBackup.estado,
            fecha:
              (ultimoBackup.fecha_fin ?? ultimoBackup.fecha_inicio)?.toISOString() ??
              null,
          }
        : null,
      loginsFallidos,
      personalActivo,
    },
  };
}

export { parseFiltroDashboard };
