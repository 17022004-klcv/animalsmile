"use client";

import React, { useState } from "react";
import {
  PawPrint,
  Heart,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Database,
  Truck,
  Activity,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
  const [tabPanel1, setTabPanel1] = useState<"estado" | "salud">("estado");
  const [tabPanel2, setTabPanel2] = useState<
    "solicitudes" | "traslados" | "seguimientos"
  >("solicitudes");
  const [tabPanel3, setTabPanel3] = useState<
    "donaciones" | "personal" | "seguridad"
  >("donaciones");

  const [filtroPeriodo, setFiltroPeriodo] = useState("este_mes");
  const [filtroEspecie, setFiltroEspecie] = useState("todas");

  return (
    <div className="h-[calc(100vh-5rem)] w-full flex flex-col justify-between gap-3 overflow-hidden bg-slate-50 text-slate-800 select-none">
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR DE FILTROS Y CONTROLES GLOBALES                         */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Filter size={14} style={{ color: "#727EFF" }} />
            <span>Filtros:</span>
          </div>

          <select
            value={filtroPeriodo}
            onChange={(e) => setFiltroPeriodo(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none hover:border-[#ED019F] transition"
          >
            <option value="hoy">Hoy</option>
            <option value="esta_semana">Esta Semana</option>
            <option value="este_mes">Este Mes</option>
            <option value="anio">Año Actual</option>
          </select>

          <select
            value={filtroEspecie}
            onChange={(e) => setFiltroEspecie(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none hover:border-[#ED019F] transition"
          >
            <option value="todas">Todas las Especies</option>
            <option value="perros">Perros</option>
            <option value="gatos">Gatos</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-400">
            Base de datos:{" "}
            <strong className="text-emerald-600 font-semibold">
              Conectada (Prisma)
            </strong>
          </span>
          <button
            onClick={() => window.location.reload()}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition"
            title="Actualizar datos"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILA DE TARJETAS KPI (RESUMEN RÁPIDO)                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Capacidad Refugio
            </p>
            <h3 className="text-xl font-black text-slate-800 mt-0.5">
              42{" "}
              <span className="text-xs font-normal text-slate-400">
                / 50 esp.
              </span>
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
              <TrendingUp size={12} /> 84% Ocupación actual
            </span>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: "#727EFF" }}
          >
            <PawPrint size={20} />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Rescates (Mes)
            </p>
            <h3 className="text-xl font-black text-slate-800 mt-0.5">
              12{" "}
              <span className="text-xs font-normal text-slate-400">
                ingresos
              </span>
            </h3>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold mt-1"
              style={{ color: "#ED019F" }}
            >
              <ArrowUpRight size={12} /> +15% vs mes ant.
            </span>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{
              background: "linear-gradient(135deg, #ED019F 0%, #FA5780 100%)",
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
              8{" "}
              <span className="text-xs font-normal text-amber-600 font-semibold">
                pendientes
              </span>
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-1">
              <Clock size={12} /> 3 en entrevista domiciliaria
            </span>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: "#FA5780" }}
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
              $3,450{" "}
              <span className="text-xs font-normal text-slate-400">/ $5k</span>
            </h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: "69%" }}
              />
            </div>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: "#7CA6C2" }}
          >
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TRES COLUMNAS PRINCIPALES                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 min-h-0">
        {/* PANEL 1 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <PawPrint size={15} style={{ color: "#727EFF" }} />
                <span>Rescates & Estado Animal</span>
              </h4>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                <button
                  onClick={() => setTabPanel1("estado")}
                  className={`px-2.5 py-1 rounded-md transition ${tabPanel1 === "estado" ? "bg-[#727EFF] text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Estatus
                </button>
                <button
                  onClick={() => setTabPanel1("salud")}
                  className={`px-2.5 py-1 rounded-md transition ${tabPanel1 === "salud" ? "bg-[#727EFF] text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
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
                      18 animales
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      En Cuarentena
                    </span>
                    <span className="font-bold text-amber-600">
                      12 animales
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      En Tratamiento Médico
                    </span>
                    <span
                      className="font-bold text-pink-600"
                      style={{ color: "#FA5780" }}
                    >
                      8 animales
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      Trasladados a Santuarios
                    </span>
                    <span className="font-bold" style={{ color: "#7CA6C2" }}>
                      4 animales
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
                      78% total
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      Consultas Veterinarias (Mes)
                    </span>
                    <span className="font-bold text-slate-700">
                      34 revisiones
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      Próximas Citas Quirúrgicas
                    </span>
                    <span className="font-bold text-amber-600">
                      5 programadas
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
            <span>Último rescate: Hoy, 09:30 AM</span>
            <span className="text-[#ED019F] font-bold cursor-pointer hover:underline">
              Ver expedientes →
            </span>
          </div>
        </div>

        {/* PANEL 2 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Heart size={15} style={{ color: "#FA5780" }} />
                <span>Adopciones & Movilidad</span>
              </h4>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                <button
                  onClick={() => setTabPanel2("solicitudes")}
                  className={`px-2 py-1 rounded-md transition ${tabPanel2 === "solicitudes" ? "bg-[#FA5780] text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Solicitudes
                </button>
                <button
                  onClick={() => setTabPanel2("traslados")}
                  className={`px-2 py-1 rounded-md transition ${tabPanel2 === "traslados" ? "bg-[#FA5780] text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Traslados
                </button>
              </div>
            </div>

            <div className="py-3 space-y-2">
              {tabPanel2 === "solicitudes" ? (
                <>
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">Karla Carranza</p>
                      <p className="text-[10px] text-slate-400">
                        Solicitó a: Max (ID: #A-092)
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      En Evaluación
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">
                        Alejandro Pérez
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Solicitó a: Luna (ID: #A-044)
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Entrevista
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">
                        Santuario San Salvador
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Traslado de 2 felinos silvestres
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Truck size={12} className="inline mr-1" /> En Ruta
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800">
                        Clínica Vet Central
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Traslado de emergencia canina
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      Completado
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
            <span>Seguimientos activos: 14</span>
            <span className="text-[#ED019F] font-bold cursor-pointer hover:underline">
              Ver solicitudes →
            </span>
          </div>
        </div>

        {/* PANEL 3 */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Database size={15} style={{ color: "#7CA6C2" }} />
                <span>Donaciones & Sistema</span>
              </h4>
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px]">
                <button
                  onClick={() => setTabPanel3("donaciones")}
                  className={`px-2.5 py-1 rounded-md transition ${tabPanel3 === "donaciones" ? "bg-[#7CA6C2] text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Insumos
                </button>
                <button
                  onClick={() => setTabPanel3("seguridad")}
                  className={`px-2.5 py-1 rounded-md transition ${tabPanel3 === "seguridad" ? "bg-[#7CA6C2] text-white font-bold shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
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
                      250 kg ingresados
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      Medicamentos y Vacunas
                    </span>
                    <span className="font-bold text-blue-600">45 unidades</span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      Higiene y Limpieza
                    </span>
                    <span className="font-bold text-amber-600">
                      18 paquetes
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      Último Backup Automático
                    </span>
                    <span className="font-bold text-emerald-600">
                      Completado (Hace 2h)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      Intentos de Login Fallidos
                    </span>
                    <span className="font-bold text-emerald-600">
                      0 incidencias
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-600 font-medium">
                      Personal Activo Hoy
                    </span>
                    <span className="font-bold text-slate-800">
                      6 usuarios en turno
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400">
            <span>Estado: Sistema Operativo</span>
            <span className="text-[#ED019F] font-bold cursor-pointer hover:underline">
              Ver auditoría →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
