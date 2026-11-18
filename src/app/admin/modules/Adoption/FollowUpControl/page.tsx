"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { Toast, type ToastTipo } from "@/src/components/ui/Toast";
import { fechaCorta } from "@/src/services/solicitudes/solicitud-format";
import {
  eliminarSeguimiento,
  obtenerSeguimientos,
} from "@/src/services/adoptions/adoption-client";
import type { SeguimientoConRelaciones } from "@/src/types/adopcion";
import {
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  User,
  PawPrint,
  Filter,
  X,
  ExternalLink,
  CalendarDays,
} from "lucide-react";

type FiltroEstado = "todos" | "pendientes" | "realizados";

export default function SeguimientoPostAdopcionPage() {
  const { palette } = useTheme();

  const [seguimientos, setSeguimientos] = useState<
    SeguimientoConRelaciones[]
  >([]);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<SeguimientoConRelaciones | null>(null);
  const [toast, setToast] = useState<{
    tipo: ToastTipo;
    mensaje: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [seguimientoSeleccionado, setSeguimientoSeleccionado] =
    useState<SeguimientoConRelaciones | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
  const [filtroMes, setFiltroMes] = useState("todos");

  const itemsPerPage = 10;

  const cargarSeguimientos = async () => {
    try {
      const data = await obtenerSeguimientos();
      setSeguimientos(data);
    } catch (err) {
      setToast({
        tipo: "error",
        mensaje:
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los seguimientos.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerSeguimientos()
      .then((data) => {
        if (cancelado) return;
        setSeguimientos(data);
      })
      .catch((err) => {
        if (!cancelado) {
          setToast({
            tipo: "error",
            mensaje:
              err instanceof Error
                ? err.message
                : "No se pudieron cargar los seguimientos.",
          });
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const mesesDisponibles = useMemo(
    () =>
      Array.from(new Set(seguimientos.map((s) => s.num_mes))).sort(
        (a, b) => a - b,
      ),
    [seguimientos],
  );

  const filtrosActivos = useMemo(() => {
    let n = 0;
    if (filtroEstado !== "todos") n++;
    if (filtroMes !== "todos") n++;
    return n;
  }, [filtroEstado, filtroMes]);

  const limpiarFiltros = () => {
    setFiltroEstado("todos");
    setFiltroMes("todos");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return seguimientos.filter((item) => {
      const term = searchTerm.toLowerCase();
      const adoptante = item.adopcion.solicitud.solicitante;
      const animal = item.adopcion.solicitud.animal;
      const coincideTexto =
        !term ||
        `${adoptante.nombre} ${adoptante.apellido}`
          .toLowerCase()
          .includes(term) ||
        adoptante.documento_identidad.toLowerCase().includes(term) ||
        animal.nombre.toLowerCase().includes(term) ||
        animal.codigo_identificador.toLowerCase().includes(term) ||
        (item.estado_evaluacion ?? "").toLowerCase().includes(term) ||
        (item.observaciones ?? "").toLowerCase().includes(term) ||
        item.id_seguimiento.toLowerCase().includes(term);

      const realizado = item.fecha_realizada !== null;
      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "realizados" && realizado) ||
        (filtroEstado === "pendientes" && !realizado);

      const coincideMes =
        filtroMes === "todos" || String(item.num_mes) === filtroMes;

      return coincideTexto && coincideEstado && coincideMes;
    });
  }, [seguimientos, searchTerm, filtroEstado, filtroMes]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleVerDetalle = (seguimiento: SeguimientoConRelaciones) => {
    setSeguimientoSeleccionado(seguimiento);
    setModalOpen(true);
  };

  const handleEliminar = (seguimiento: SeguimientoConRelaciones) => {
    setConfirmacion(seguimiento);
  };

  const confirmarEliminacion = async () => {
    if (!confirmacion) return;

    const adoptante = `${confirmacion.adopcion.solicitud.solicitante.nombre} ${confirmacion.adopcion.solicitud.solicitante.apellido}`;
    setEliminandoId(confirmacion.id_seguimiento);
    try {
      await eliminarSeguimiento(confirmacion.id_seguimiento);
      setConfirmacion(null);
      setToast({
        tipo: "success",
        mensaje: `El seguimiento del mes ${confirmacion.num_mes} de "${adoptante}" se eliminó correctamente.`,
      });
      await cargarSeguimientos();
    } catch (err) {
      setToast({
        tipo: "error",
        mensaje:
          err instanceof Error
            ? err.message
            : "No se pudo eliminar el seguimiento.",
      });
    } finally {
      setEliminandoId(null);
    }
  };

  const exportarCSV = () => {
    const filas = [
      [
        "ID Seguimiento",
        "Adoptante",
        "Documento",
        "Animal",
        "Mes",
        "Fecha Programada",
        "Fecha Realizada",
        "Estado Evaluación",
        "Realizado Por",
      ],
      ...filteredData.map((s) => [
        s.id_seguimiento,
        `${s.adopcion.solicitud.solicitante.nombre} ${s.adopcion.solicitud.solicitante.apellido}`,
        s.adopcion.solicitud.solicitante.documento_identidad,
        `${s.adopcion.solicitud.animal.nombre} (${s.adopcion.solicitud.animal.codigo_identificador})`,
        String(s.num_mes),
        fechaCorta(s.fecha_programada),
        fechaCorta(s.fecha_realizada),
        s.estado_evaluacion ?? "Sin evaluación",
        s.realizado_por ? "Sí" : "No",
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seguimientos_post_adopcion.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFicha = (s: SeguimientoConRelaciones) => {
    const adoptante = s.adopcion.solicitud.solicitante;
    const animal = s.adopcion.solicitud.animal;
    const lineas = [
      "FICHA DE SEGUIMIENTO POST ADOPCIÓN - AnimalSmile",
      "".padEnd(48, "="),
      `ID Seguimiento: ${s.id_seguimiento}`,
      `ID Adopción: ${s.id_adopcion}`,
      `Mes: ${s.num_mes}`,
      `Fecha programada: ${fechaCorta(s.fecha_programada)}`,
      `Fecha realizada: ${fechaCorta(s.fecha_realizada)}`,
      `Estado de evaluación: ${s.estado_evaluacion ?? "Sin evaluación"}`,
      `Realizado por: ${s.realizado_por ?? "No registrado"}`,
      "",
      "-- Adoptante --",
      `Nombre completo: ${adoptante.nombre} ${adoptante.apellido}`,
      `Documento de identidad: ${adoptante.documento_identidad}`,
      `Correo: ${adoptante.email}`,
      `Teléfono: ${adoptante.telefono}`,
      "",
      "-- Animal --",
      `Nombre: ${animal.nombre}`,
      `Código identificador: ${animal.codigo_identificador}`,
      "",
      "-- Evaluación --",
      `Observaciones: ${s.observaciones ?? "Sin observaciones registradas."}`,
      `Evidencias: ${s.evidencias_fotos?.join(", ") ?? "Sin evidencias adjuntas."}`,
    ];

    const blob = new Blob([lineas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seguimiento_${s.id_seguimiento}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="anim-fade-in h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="anim-fade-up delay-1 h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Seguimiento{" "}
              <span style={{ color: palette.primary }}>Post Adopción</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredData.length} de {seguimientos.length} seguimientos
              {filtrosActivos > 0 && (
                <span
                  style={{ color: palette.primary }}
                  className="font-semibold"
                >
                  {" "}
                  · {filtrosActivos} filtro{filtrosActivos > 1 ? "s" : ""} activo
                  {filtrosActivos > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={<Download size={15} />}
              onClick={exportarCSV}
            >
              Exportar
            </Button>
            <Link href="/admin/modules/Adoption/FollowUpControl/Form">
              <Button icon={<Plus size={16} />}>Nuevo Seguimiento</Button>
            </Link>
          </div>
        </div>

        <div className="anim-fade-up delay-2 my-4 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por adoptante, documento, animal o evaluación..."
          />
        </div>

        <div className="anim-fade-up delay-3 mb-3 shrink-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Filter size={12} />
              Filtros avanzados
              {filtrosActivos > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black text-white"
                  style={{ backgroundColor: palette.primary }}
                >
                  {filtrosActivos}
                </span>
              )}
            </span>

            {filtrosActivos > 0 && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="anim-press inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition"
                title="Limpiar filtros"
              >
                <X size={12} />
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Estado del seguimiento
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value as FiltroEstado);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Todos</option>
                <option value="pendientes">Pendientes</option>
                <option value="realizados">Realizados</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Mes de seguimiento
              </label>
              <select
                value={filtroMes}
                onChange={(e) => {
                  setFiltroMes(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Todos los meses</option>
                {mesesDisponibles.map((mes) => (
                  <option key={mes} value={String(mes)}>
                    Mes {mes}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="anim-fade-up delay-4 flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {cargando ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-xs font-medium">
                  Cargando seguimientos...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  <tr>
                    <th className="px-4 py-3">Adoptante</th>
                    <th className="px-4 py-3">Animal</th>
                    <th className="px-4 py-3">Seguimiento</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Registro</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item: SeguimientoConRelaciones) => {
                    const realizado = item.fecha_realizada !== null;
                    return (
                      <tr
                        key={item.id_seguimiento}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-2.5 flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-500 shrink-0"
                            title="Adoptante"
                          >
                            <User size={15} />
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {
                                item.adopcion.solicitud.solicitante.nombre
                              }{" "}
                              {
                                item.adopcion.solicitud.solicitante.apellido
                              }
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Doc:{" "}
                              {
                                item.adopcion.solicitud.solicitante
                                  .documento_identidad
                              }
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-400 shrink-0">
                              <PawPrint size={12} />
                            </span>
                            <div>
                              <span className="font-bold text-slate-800 block">
                                {item.adopcion.solicitud.animal.nombre}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {
                                  item.adopcion.solicitud.animal
                                    .codigo_identificador
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <CalendarDays size={13} className="text-slate-400" />
                            Mes {item.num_mes}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Programado: {fechaCorta(item.fecha_programada)}
                          </div>
                        </td>

                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              realizado
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                : "bg-amber-50 text-amber-600 border-amber-200"
                            }`}
                          >
                            {realizado ? "Realizado" : "Pendiente"}
                          </span>
                          {item.estado_evaluacion && (
                            <div className="text-[10px] text-slate-500 mt-1">
                              {item.estado_evaluacion}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="font-medium text-slate-600">
                            {fechaCorta(item.fecha_realizada)}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {item.realizado_por ? "Con registro" : "Sin registro"}
                          </div>
                        </td>

                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleVerDetalle(item)}
                              className="anim-press p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  palette.primary;
                                e.currentTarget.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color = "#64748b";
                              }}
                              title="Ver detalle"
                            >
                              <Eye size={15} />
                            </button>

                            <Link
                              href={`/admin/modules/Adoption/FollowUpControl/Form?id=${item.id_seguimiento}`}
                              className="anim-press p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  palette.secondary;
                                e.currentTarget.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color = "#64748b";
                              }}
                              title="Editar seguimiento"
                            >
                              <Edit size={15} />
                            </Link>

                            <button
                              onClick={() => descargarFicha(item)}
                              className="anim-press p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  palette.dark;
                                e.currentTarget.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color = "#64748b";
                              }}
                              title="Descargar Ficha"
                            >
                              <Download size={15} />
                            </button>

                            <button
                              onClick={() => handleEliminar(item)}
                              disabled={
                                eliminandoId === item.id_seguimiento
                              }
                              className="anim-press p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Eliminar registro"
                            >
                              {eliminandoId === item.id_seguimiento ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!cargando && paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-slate-400 font-medium"
                      >
                        {filtrosActivos > 0 || searchTerm
                          ? "No se encontraron seguimientos con los filtros aplicados."
                          : "No se encontraron registros de seguimientos."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="anim-fade-up delay-5 pt-4 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>
            mostrando {filteredData.length > 0 ? startIndex + 1 : 0}-
            {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
            {filteredData.length} registros
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="anim-press p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-bold text-slate-700">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="anim-press p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="xl"
        title={
          <span className="flex items-center gap-2">
            <FileText size={18} style={{ color: palette.primary }} />
            Expediente de Seguimiento
          </span>
        }
      >
        {seguimientoSeleccionado && (
          <div className="space-y-5 text-xs text-slate-600 w-full">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="w-14 h-14 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-400 shrink-0">
                <User size={24} />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-slate-800 truncate">
                  {
                    seguimientoSeleccionado.adopcion.solicitud.solicitante
                      .nombre
                  }{" "}
                  {
                    seguimientoSeleccionado.adopcion.solicitud.solicitante
                      .apellido
                  }
                </h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">
                  Documento:{" "}
                  {
                    seguimientoSeleccionado.adopcion.solicitud.solicitante
                      .documento_identidad
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Mes evaluado
                </span>
                <p className="font-semibold text-slate-800">
                  Mes {seguimientoSeleccionado.num_mes}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Fecha programada
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(seguimientoSeleccionado.fecha_programada)}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Fecha realizada
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(seguimientoSeleccionado.fecha_realizada)}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Estado de evaluación
                </span>
                <p className="font-semibold text-slate-800">
                  {seguimientoSeleccionado.estado_evaluacion ?? "Sin evaluación"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Registrado por
                </span>
                <p className="font-semibold text-slate-800">
                  {seguimientoSeleccionado.realizado_por ?? "No registrado"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Fecha de adopción
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(seguimientoSeleccionado.adopcion.fecha_adopcion)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-400 shrink-0">
                  <PawPrint size={18} />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Animal adoptado
                  </span>
                  <p className="text-slate-800 font-bold text-sm">
                    {seguimientoSeleccionado.adopcion.solicitud.animal.nombre}
                    <span className="font-mono text-xs font-normal text-slate-500 ml-2">
                      (
                      {
                        seguimientoSeleccionado.adopcion.solicitud.animal
                          .codigo_identificador
                      }
                      )
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {seguimientoSeleccionado.observaciones && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Observaciones
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {seguimientoSeleccionado.observaciones}
                </p>
              </div>
            )}

            {seguimientoSeleccionado.evidencias_fotos &&
              seguimientoSeleccionado.evidencias_fotos.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 border-b border-slate-200 pb-2">
                    Evidencias fotográficas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {seguimientoSeleccionado.evidencias_fotos.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold hover:underline"
                        style={{ color: palette.primary }}
                      >
                        <ExternalLink size={14} />
                        Ver evidencia
                      </a>
                    ))}
                  </div>
                </div>
              )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="anim-press px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-sm transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: palette.primary }}
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmacion !== null}
        title="Eliminar seguimiento"
        description={
          confirmacion
            ? `¿Estás seguro de eliminar el seguimiento del mes ${confirmacion.num_mes} de "${confirmacion.adopcion.solicitud.solicitante.nombre} ${confirmacion.adopcion.solicitud.solicitante.apellido}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar seguimiento"
        loading={eliminandoId === confirmacion?.id_seguimiento}
        onConfirm={confirmarEliminacion}
        onCancel={() => setConfirmacion(null)}
      />

      <Toast
        open={toast !== null}
        message={toast?.mensaje ?? ""}
        type={toast?.tipo ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
