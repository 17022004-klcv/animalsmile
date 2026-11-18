"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { obtenerEstadisticasDashboard } from "@/src/services/dashboard/dashboard-client";
import type {
  EspecieDashboard,
  EstadisticasDashboard,
  PeriodoDashboard,
} from "@/src/types/dashboard";
import {
  PawPrint,
  Heart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  Database,
  Truck,
  Activity,
  Filter,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

const formatoMoneda = new Intl.NumberFormat("es-SV", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatoNumero = new Intl.NumberFormat("es-SV");

const ESTADO_SOLICITUD_UI: Record<
  string,
  { label: string; className: string }
> = {
  Pendiente: {
    label: "Pendiente",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  En_Evaluacion: {
    label: "En Evaluación",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Entrevista_Domiciliaria: {
    label: "Entrevista",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Aprobada: {
    label: "Aprobada",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Rechazada: {
    label: "Rechazada",
    className: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

function tiempoRelativo(iso: string | null): string {
  if (!iso) return "Sin registros";
  const diferencia = Date.now() - new Date(iso).getTime();
  const minutos = Math.floor(diferencia / 60000);
  if (minutos < 1) return "Hace instantes";
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `Hace ${horas}h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} día${dias === 1 ? "" : "s"}`;
}

function formatearFecha(iso: string | null): string {
  if (!iso) return "Sin rescates registrados";
  const fecha = new Date(iso);
  const hoy = new Date();
  const hora = fecha.toLocaleTimeString("es-SV", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (fecha.toDateString() === hoy.toDateString()) return `Hoy, ${hora}`;
  return fecha.toLocaleDateString("es-SV", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminDashboard() {
  const { palette } = useTheme();

  const [tabPanel1, setTabPanel1] = useState<"estado" | "salud">("estado");
  const [tabPanel2, setTabPanel2] = useState<"solicitudes" | "traslados">(
    "solicitudes",
  );
  const [tabPanel3, setTabPanel3] = useState<"donaciones" | "seguridad">(
    "donaciones",
  );

  const [filtroPeriodo, setFiltroPeriodo] = useState<PeriodoDashboard>("este_mes");
  const [filtroEspecie, setFiltroEspecie] = useState<EspecieDashboard>("todas");

  const [datos, setDatos] = useState<EstadisticasDashboard | null>(null);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setRefrescando(true);
    try {
      const data = await obtenerEstadisticasDashboard({
        periodo: filtroPeriodo,
        especie: filtroEspecie,
      });
      setDatos(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las estadísticas.",
      );
    } finally {
      setRefrescando(false);
    }
  }, [filtroPeriodo, filtroEspecie]);

  useEffect(() => {
    let cancelado = false;
    obtenerEstadisticasDashboard({
      periodo: filtroPeriodo,
      especie: filtroEspecie,
    })
      .then((data) => {
        if (cancelado) return;
        setDatos(data);
        setError(null);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las estadísticas.",
        );
      });
    return () => {
      cancelado = true;
    };
  }, [filtroPeriodo, filtroEspecie]);

  const cargando =
    !datos ||
    datos.filtro.periodo !== filtroPeriodo ||
    datos.filtro.especie !== filtroEspecie;

  const kpis = datos?.kpis;
  const capacidad = kpis?.capacidad;
  const rescates = kpis?.rescates;
  const solicitudesKpi = kpis?.solicitudes;
  const recaudacion = kpis?.recaudacion;
  const variacion = rescates?.variacionPct ?? 0;
  const variacionPositiva = variacion >= 0;

  return (
    <div className="h-[calc(100vh-5rem)] w-full flex flex-col justify-between gap-3 overflow-hidden bg-slate-50 text-slate-800 select-none">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DE FILTROS Y CONTROLES GLOBALES                         */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Filter size={14} style={{ color: palette.secondary }} />
            <span>Filtros:</span>
          </div>

          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value as PeriodoDashboard)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none hover:border-[var(--color-primary)] transition"
          >
            <option value="hoy">Hoy</option>
            <option value="esta_semana">Esta Semana</option>
            <option value="este_mes">Este Mes</option>
            <option value="anio">Año Actual</option>
          </select>

          <select
            value={filtroEspecie}
            onChange={(e) => setFiltroEspecie(e.target.value as EspecieDashboard)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none hover:border-[var(--color-primary)] transition"
          >
            <option value="todas">Todas las Especies</option>
            <option value="perros">Perros</option>
            <option value="gatos">Gatos</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Base de datos:{" "}
            {error ? (
              <strong className="text-rose-600 font-semibold">
                Error de conexión
              </strong>
            ) : (
              <strong className="text-emerald-600 font-semibold">
                Conectada (Prisma)
              </strong>
            )}
          </span>
          <button
            onClick={cargar}
            disabled={refrescando}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw
              size={14}
              className={refrescando || cargando ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 shrink-0">
          <AlertTriangle size={15} />
          <span>{error}</span>
        </div>
      )}

      {!datos && !error ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={28} className="animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* ======================================================================= */}
          {/* 2. FILA DE TARJETAS KPI (RESUMEN RÁPIDO)                               */}
          {/* ======================================================================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
            {/* KPI 1 */}
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Capacidad Refugio
                </p>
                <h3 className="text-xl font-black text-slate-800 mt-0.5">
                  {formatoNumero.format(capacidad?.ocupados ?? 0)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    / {formatoNumero.format(capacidad?.total ?? 0)} esp.
                  </span>
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
                  <TrendingUp size={12} /> {capacidad?.porcentaje ?? 0}% Ocupación
                  actual
                </span>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: palette.secondary }}
              >
                <PawPrint size={20} />
              </div>
            </div>

            {/* KPI 2 */}
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Rescates
                </p>
                <h3 className="text-xl font-black text-slate-800 mt-0.5">
                  {formatoNumero.format(rescates?.total ?? 0)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    ingresos
                  </span>
                </h3>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 ${
                    variacionPositiva ? "" : "text-rose-600"
                  }`}
                  style={variacionPositiva ? { color: palette.primary } : undefined}
                >
                  {variacionPositiva ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}{" "}
                  {variacionPositiva ? "+" : ""}
                  {variacion}% vs periodo ant.
                </span>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${palette.primary} 0%, ${palette.accent} 100%)`,
                }}
              >
                <Activity size={20} />
              </div>
            </div>

            {/* KPI 3 */}
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Solicitudes Adopción
                </p>
                <h3 className="text-xl font-black text-slate-800 mt-0.5">
                  {formatoNumero.format(solicitudesKpi?.pendientes ?? 0)}{" "}
                  <span className="text-xs font-normal text-amber-600 font-semibold">
                    pendientes
                  </span>
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-1">
                  <Clock size={12} /> {solicitudesKpi?.enEntrevista ?? 0} en
                  entrevista domiciliaria
                </span>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: palette.accent }}
              >
                <Heart size={20} />
              </div>
            </div>

            {/* KPI 4 */}
            <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Recaudación (USD)
                </p>
                <h3 className="text-xl font-black text-slate-800 mt-0.5">
                  {formatoMoneda.format(recaudacion?.total ?? 0)}{" "}
                  <span className="text-xs font-normal text-slate-400">
                    / {formatoMoneda.format(recaudacion?.meta ?? 0)}
                  </span>
                </h3>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(recaudacion?.porcentaje ?? 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: palette.muted }}
              >
                <DollarSign size={20} />
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* 3. TRES COLUMNAS PRINCIPALES                                           */}
          {/* ======================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
            {/* PANEL 1 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <PawPrint size={15} style={{ color: palette.secondary }} />
                    <span>Rescates & Estado Animal</span>
                  </h4>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                    <button
                      onClick={() => setTabPanel1("estado")}
                      className={`px-2.5 py-1 rounded-md transition ${tabPanel1 === "estado" ? "text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      style={
                        tabPanel1 === "estado"
                          ? { backgroundColor: palette.secondary }
                          : undefined
                      }
                    >
                      Estatus
                    </button>
                    <button
                      onClick={() => setTabPanel1("salud")}
                      className={`px-2.5 py-1 rounded-md transition ${tabPanel1 === "salud" ? "text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      style={
                        tabPanel1 === "salud"
                          ? { backgroundColor: palette.secondary }
                          : undefined
                      }
                    >
                      Salud
                    </button>
                  </div>
                </div>

                <div className="py-3 space-y-2">
                  {tabPanel1 === "estado" ? (
                    <>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Disponible para Adopción
                        </span>
                        <span className="font-bold text-emerald-600">
                          {datos?.estadoAnimal.disponible ?? 0} animales
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          En Cuarentena
                        </span>
                        <span className="font-bold text-amber-600">
                          {datos?.estadoAnimal.cuarentena ?? 0} animales
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          En Tratamiento Médico
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: palette.accent }}
                        >
                          {datos?.estadoAnimal.tratamiento ?? 0} animales
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Trasladados a Santuarios
                        </span>
                        <span
                          className="font-bold"
                          style={{ color: palette.muted }}
                        >
                          {datos?.estadoAnimal.trasladado ?? 0} animales
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Esterilizados (Expediente Médico)
                        </span>
                        <span className="font-bold text-emerald-600">
                          {datos?.salud.esterilizadosPct ?? 0}% total
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Consultas Veterinarias
                        </span>
                        <span className="font-bold text-slate-700">
                          {datos?.salud.consultas ?? 0} revisiones
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Próximas Citas Quirúrgicas
                        </span>
                        <span className="font-bold text-amber-600">
                          {datos?.salud.proximasCirugias ?? 0} programadas
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                <span>
                  Último rescate:{" "}
                  {formatearFecha(datos?.estadoAnimal.ultimoRescate ?? null)}
                </span>
                <Link
                  href="/admin/modules/Animals/Records"
                  className="font-bold hover:underline"
                  style={{ color: palette.primary }}
                >
                  Ver expedientes →
                </Link>
              </div>
            </div>

            {/* PANEL 2 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Heart size={15} style={{ color: palette.accent }} />
                    <span>Adopciones & Movilidad</span>
                  </h4>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                    <button
                      onClick={() => setTabPanel2("solicitudes")}
                      className={`px-2 py-1 rounded-md transition ${tabPanel2 === "solicitudes" ? "text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      style={
                        tabPanel2 === "solicitudes"
                          ? { backgroundColor: palette.accent }
                          : undefined
                      }
                    >
                      Solicitudes
                    </button>
                    <button
                      onClick={() => setTabPanel2("traslados")}
                      className={`px-2 py-1 rounded-md transition ${tabPanel2 === "traslados" ? "text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      style={
                        tabPanel2 === "traslados"
                          ? { backgroundColor: palette.accent }
                          : undefined
                      }
                    >
                      Traslados
                    </button>
                  </div>
                </div>

                <div className="py-3 space-y-2">
                  {tabPanel2 === "solicitudes" ? (
                    datos && datos.solicitudes.length > 0 ? (
                      datos.solicitudes.map((s) => {
                        const ui =
                          ESTADO_SOLICITUD_UI[s.estado] ??
                          ESTADO_SOLICITUD_UI.Pendiente;
                        return (
                          <div
                            key={s.id}
                            className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-slate-800 truncate">
                                {s.solicitante}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                Solicitó a: {s.animal} (ID: {s.codigo})
                              </p>
                            </div>
                            <span
                              className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${ui.className}`}
                            >
                              {ui.label}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">
                        Sin solicitudes registradas.
                      </p>
                    )
                  ) : datos && datos.traslados.length > 0 ? (
                    datos.traslados.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-800 truncate">
                            {t.santuario}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {t.detalle}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border ${
                            t.estado === "Completado"
                              ? "bg-slate-100 text-slate-600 border-slate-200"
                              : t.estado === "En Ruta"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {t.estado === "En Ruta" && (
                            <Truck size={12} className="inline mr-1" />
                          )}
                          {t.estado}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6">
                      Sin traslados registrados.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                <span>
                  Seguimientos activos: {datos?.seguimientosActivos ?? 0}
                </span>
                <Link
                  href="/admin/modules/Adoption/Applications"
                  className="font-bold hover:underline"
                  style={{ color: palette.primary }}
                >
                  Ver solicitudes →
                </Link>
              </div>
            </div>

            {/* PANEL 3 */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Database size={15} style={{ color: palette.muted }} />
                    <span>Donaciones & Sistema</span>
                  </h4>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                    <button
                      onClick={() => setTabPanel3("donaciones")}
                      className={`px-2.5 py-1 rounded-md transition ${tabPanel3 === "donaciones" ? "text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      style={
                        tabPanel3 === "donaciones"
                          ? { backgroundColor: palette.muted }
                          : undefined
                      }
                    >
                      Insumos
                    </button>
                    <button
                      onClick={() => setTabPanel3("seguridad")}
                      className={`px-2.5 py-1 rounded-md transition ${tabPanel3 === "seguridad" ? "text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                      style={
                        tabPanel3 === "seguridad"
                          ? { backgroundColor: palette.muted }
                          : undefined
                      }
                    >
                      Seguridad
                    </button>
                  </div>
                </div>

                <div className="py-3 space-y-2">
                  {tabPanel3 === "donaciones" ? (
                    <>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Alimentos (Kilos)
                        </span>
                        <span className="font-bold text-emerald-600">
                          {formatoNumero.format(datos?.insumos.alimentos ?? 0)} kg
                          ingresados
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Medicamentos y Vacunas
                        </span>
                        <span className="font-bold text-blue-600">
                          {formatoNumero.format(datos?.insumos.medicamentos ?? 0)}{" "}
                          unidades
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Higiene y Limpieza
                        </span>
                        <span className="font-bold text-amber-600">
                          {formatoNumero.format(datos?.insumos.higiene ?? 0)}{" "}
                          paquetes
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Último Backup
                        </span>
                        <span
                          className={`font-bold ${
                            datos?.seguridad.ultimoBackup?.estado === "Fallido"
                              ? "text-rose-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {datos?.seguridad.ultimoBackup
                            ? `${datos.seguridad.ultimoBackup.estado.replace(/_/g, " ")} (${tiempoRelativo(datos.seguridad.ultimoBackup.fecha)})`
                            : "Sin registros"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Intentos de Login Fallidos
                        </span>
                        <span
                          className={`font-bold ${
                            (datos?.seguridad.loginsFallidos ?? 0) > 0
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {datos?.seguridad.loginsFallidos ?? 0} incidencias
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                        <span className="text-slate-600 font-medium">
                          Personal Activo
                        </span>
                        <span className="font-bold text-slate-800">
                          {datos?.seguridad.personalActivo ?? 0} usuarios
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={13} className="text-emerald-500" />
                  Estado: Sistema Operativo
                </span>
                <Link
                  href="/admin/modules/Security/SystemAccess"
                  className="font-bold hover:underline"
                  style={{ color: palette.primary }}
                >
                  Ver auditoría →
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
