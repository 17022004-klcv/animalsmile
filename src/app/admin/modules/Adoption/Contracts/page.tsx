"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { Toast, type ToastTipo } from "@/src/components/ui/Toast";
import {
  fechaCorta,
  formatearEstadoSolicitud,
} from "@/src/services/solicitudes/solicitud-format";
import {
  eliminarAdopcion,
  obtenerAdopciones,
} from "@/src/services/adoptions/adoption-client";
import type { AdopcionConRelaciones } from "@/src/types/adopcion";
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
} from "lucide-react";

export default function ContratosAdopcionPage() {
  const { palette } = useTheme();

  const [adopciones, setAdopciones] = useState<AdopcionConRelaciones[]>([]);
  const [cargando, setCargando] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<AdopcionConRelaciones | null>(null);
  const [toast, setToast] = useState<{
    tipo: ToastTipo;
    mensaje: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [adopcionSeleccionada, setAdopcionSeleccionada] =
    useState<AdopcionConRelaciones | null>(null);

  const [filtroContrato, setFiltroContrato] = useState<
    "todos" | "con" | "sin"
  >("todos");
  const [filtroSeguimiento, setFiltroSeguimiento] = useState<
    "todos" | "con" | "sin"
  >("todos");

  const itemsPerPage = 10;

  const cargarAdopciones = async () => {
    try {
      const data = await obtenerAdopciones();
      setAdopciones(data);
    } catch (err) {
      setToast({
        tipo: "error",
        mensaje:
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las adopciones.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerAdopciones()
      .then((data) => {
        if (cancelado) return;
        setAdopciones(data);
      })
      .catch((err) => {
        if (!cancelado) {
          setToast({
            tipo: "error",
            mensaje:
              err instanceof Error
                ? err.message
                : "No se pudieron cargar las adopciones.",
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

  const filtrosActivos = useMemo(() => {
    let n = 0;
    if (filtroContrato !== "todos") n++;
    if (filtroSeguimiento !== "todos") n++;
    return n;
  }, [filtroContrato, filtroSeguimiento]);

  const limpiarFiltros = () => {
    setFiltroContrato("todos");
    setFiltroSeguimiento("todos");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return adopciones.filter((item) => {
      const term = searchTerm.toLowerCase();
      const coincideTexto =
        !term ||
        item.solicitud.solicitante.nombre.toLowerCase().includes(term) ||
        item.solicitud.solicitante.apellido.toLowerCase().includes(term) ||
        item.solicitud.solicitante.documento_identidad
          .toLowerCase()
          .includes(term) ||
        item.solicitud.animal.nombre.toLowerCase().includes(term) ||
        item.solicitud.animal.codigo_identificador.toLowerCase().includes(term) ||
        item.id_adopcion.toLowerCase().includes(term);

      const tieneContrato = !!item.contrato_firmado_url?.trim();
      const coincideContrato =
        filtroContrato === "todos" ||
        (filtroContrato === "con" && tieneContrato) ||
        (filtroContrato === "sin" && !tieneContrato);

      const totalSeguimientos = item._count?.seguimientos_post_adopcion ?? 0;
      const coincideSeguimiento =
        filtroSeguimiento === "todos" ||
        (filtroSeguimiento === "con" && totalSeguimientos > 0) ||
        (filtroSeguimiento === "sin" && totalSeguimientos === 0);

      return coincideTexto && coincideContrato && coincideSeguimiento;
    });
  }, [adopciones, searchTerm, filtroContrato, filtroSeguimiento]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleVerDetalle = (adopcion: AdopcionConRelaciones) => {
    setAdopcionSeleccionada(adopcion);
    setModalOpen(true);
  };

  const handleEliminar = (adopcion: AdopcionConRelaciones) => {
    setConfirmacion(adopcion);
  };

  const confirmarEliminacion = async () => {
    if (!confirmacion) return;

    const nombre = `${confirmacion.solicitud.solicitante.nombre} ${confirmacion.solicitud.solicitante.apellido}`;
    setEliminandoId(confirmacion.id_adopcion);
    try {
      await eliminarAdopcion(confirmacion.id_adopcion);
      setConfirmacion(null);
      setToast({
        tipo: "success",
        mensaje: `La adopción de "${nombre}" se eliminó correctamente.`,
      });
      await cargarAdopciones();
    } catch (err) {
      setToast({
        tipo: "error",
        mensaje:
          err instanceof Error
            ? err.message
            : "No se pudo eliminar la adopción.",
      });
    } finally {
      setEliminandoId(null);
    }
  };

  const exportarCSV = () => {
    const filas = [
      [
        "ID Adopción",
        "Solicitante",
        "Documento",
        "Animal",
        "Fecha Adopción",
        "Contrato Firmado",
        "Encargado",
        "Seguimientos",
      ],
      ...filteredData.map((a) => [
        a.id_adopcion,
        `${a.solicitud.solicitante.nombre} ${a.solicitud.solicitante.apellido}`,
        a.solicitud.solicitante.documento_identidad,
        `${a.solicitud.animal.nombre} (${a.solicitud.animal.codigo_identificador})`,
        fechaCorta(a.fecha_adopcion),
        a.contrato_firmado_url ?? "Sin contrato",
        a.encargado
          ? `${a.encargado.nombre} ${a.encargado.apellido}`
          : "No asignado",
        String(a._count?.seguimientos_post_adopcion ?? 0),
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contratos_adopcion.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFicha = (adopcion: AdopcionConRelaciones) => {
    const lineas = [
      "FICHA DE CONTRATO DE ADOPCIÓN - AnimalSmile",
      "".padEnd(40, "="),
      `ID Adopción: ${adopcion.id_adopcion}`,
      `ID Solicitud: ${adopcion.id_solicitud}`,
      `Fecha de adopción: ${fechaCorta(adopcion.fecha_adopcion)}`,
      `Contrato firmado: ${adopcion.contrato_firmado_url ?? "No registrado"}`,
      `Encargado: ${adopcion.encargado ? `${adopcion.encargado.nombre} ${adopcion.encargado.apellido}` : "No asignado"}`,
      `Seguimientos: ${adopcion._count?.seguimientos_post_adopcion ?? 0}`,
      "",
      "-- Adoptante --",
      `Nombre completo: ${adopcion.solicitud.solicitante.nombre} ${adopcion.solicitud.solicitante.apellido}`,
      `Documento de identidad: ${adopcion.solicitud.solicitante.documento_identidad}`,
      `Correo: ${adopcion.solicitud.solicitante.email}`,
      `Teléfono: ${adopcion.solicitud.solicitante.telefono}`,
      `Dirección: ${adopcion.solicitud.solicitante.direccion}`,
      "",
      "-- Animal --",
      `Nombre: ${adopcion.solicitud.animal.nombre}`,
      `Código identificador: ${adopcion.solicitud.animal.codigo_identificador}`,
      "",
      "-- Solicitud --",
      `Estado: ${formatearEstadoSolicitud(adopcion.solicitud.estado)}`,
      `Fecha de solicitud: ${fechaCorta(adopcion.solicitud.fecha_solicitud)}`,
      `Notas de evaluación: ${adopcion.solicitud.notas_evaluacion ?? "Sin notas registradas."}`,
    ];

    const blob = new Blob([lineas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contrato_adopcion_${adopcion.id_adopcion}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="anim-fade-in h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="anim-fade-up delay-1 h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Contratos de{" "}
              <span style={{ color: palette.primary }}>Adopción</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredData.length} de {adopciones.length} adopciones
              {filtrosActivos > 0 && (
                <span
                  style={{ color: palette.primary }}
                  className="font-semibold"
                >
                  {" "}
                  · {filtrosActivos} filtro{filtrosActivos > 1 ? "s" : ""}{" "}
                  activo{filtrosActivos > 1 ? "s" : ""}
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
            <Link href="/admin/modules/Adoption/Contracts/Form">
              <Button icon={<Plus size={16} />}>Nuevo Contrato</Button>
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
            placeholder="Buscar por adoptante, documento, animal o código..."
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
                Contrato firmado
              </label>
              <select
                value={filtroContrato}
                onChange={(e) => {
                  setFiltroContrato(e.target.value as "todos" | "con" | "sin");
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Todos</option>
                <option value="con">Con contrato adjunto</option>
                <option value="sin">Sin contrato adjunto</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Seguimientos
              </label>
              <select
                value={filtroSeguimiento}
                onChange={(e) => {
                  setFiltroSeguimiento(
                    e.target.value as "todos" | "con" | "sin",
                  );
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Todos</option>
                <option value="con">Con seguimientos</option>
                <option value="sin">Sin seguimientos</option>
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
                  Cargando contratos de adopción...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  <tr>
                    <th className="px-4 py-3">Adoptante</th>
                    <th className="px-4 py-3">Animal</th>
                    <th className="px-4 py-3">Fecha y Contrato</th>
                    <th className="px-4 py-3">Solicitud</th>
                    <th className="px-4 py-3">Encargado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item: AdopcionConRelaciones) => (
                    <tr
                      key={item.id_adopcion}
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
                            {item.solicitud.solicitante.nombre}{" "}
                            {item.solicitud.solicitante.apellido}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Doc: {item.solicitud.solicitante.documento_identidad}
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
                              {item.solicitud.animal.nombre}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.solicitud.animal.codigo_identificador}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-600">
                          {fechaCorta(item.fecha_adopcion)}
                        </div>
                        {item.contrato_firmado_url ? (
                          <a
                            href={item.contrato_firmado_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="anim-press inline-flex items-center gap-1 text-[10px] font-bold mt-0.5 hover:underline"
                            style={{ color: palette.primary }}
                            title="Ver contrato firmado"
                          >
                            Ver contrato <ExternalLink size={10} />
                          </a>
                        ) : (
                          <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                            Sin contrato adjunto
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          {formatearEstadoSolicitud(item.solicitud.estado)}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {item._count?.seguimientos_post_adopcion ?? 0}{" "}
                          seguimiento(s)
                        </div>
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        {item.encargado
                          ? `${item.encargado.nombre} ${item.encargado.apellido}`
                          : "No asignado"}
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
                            title="Previsualizar contrato"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Adoption/Contracts/Form?id=${item.id_adopcion}`}
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
                            title="Editar registro"
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
                            disabled={eliminandoId === item.id_adopcion}
                            className="anim-press p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Eliminar registro"
                          >
                            {eliminandoId === item.id_adopcion ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!cargando && paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-slate-400 font-medium"
                      >
                        {filtrosActivos > 0 || searchTerm
                          ? "No se encontraron adopciones con los filtros aplicados."
                          : "No se encontraron registros de adopciones."}
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
            Expediente de Contrato de Adopción
          </span>
        }
      >
        {adopcionSeleccionada && (
          <div className="space-y-5 text-xs text-slate-600 w-full">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="w-14 h-14 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-400 shrink-0">
                <User size={24} />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-slate-800 truncate">
                  {adopcionSeleccionada.solicitud.solicitante.nombre}{" "}
                  {adopcionSeleccionada.solicitud.solicitante.apellido}
                </h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">
                  Documento:{" "}
                  {adopcionSeleccionada.solicitud.solicitante
                    .documento_identidad}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {adopcionSeleccionada.solicitud.solicitante.email}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Teléfono
                </span>
                <p className="font-semibold text-slate-800">
                  {adopcionSeleccionada.solicitud.solicitante.telefono}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Fecha de Adopción
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(adopcionSeleccionada.fecha_adopcion)}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Encargado
                </span>
                <p className="font-semibold text-slate-800">
                  {adopcionSeleccionada.encargado
                    ? `${adopcionSeleccionada.encargado.nombre} ${adopcionSeleccionada.encargado.apellido}`
                    : "No asignado"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Estado de la Solicitud
                </span>
                <p className="font-semibold text-slate-800">
                  {formatearEstadoSolicitud(
                    adopcionSeleccionada.solicitud.estado,
                  )}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Seguimientos Registrados
                </span>
                <p className="font-semibold text-slate-800">
                  {adopcionSeleccionada._count?.seguimientos_post_adopcion ?? 0}
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
                    Animal Adoptado
                  </span>
                  <p className="text-slate-800 font-bold text-sm">
                    {adopcionSeleccionada.solicitud.animal.nombre}
                    <span className="font-mono text-xs font-normal text-slate-500 ml-2">
                      ({adopcionSeleccionada.solicitud.animal.codigo_identificador})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 border-b border-slate-200 pb-2">
                Contrato Firmado
              </span>
              {adopcionSeleccionada.contrato_firmado_url ? (
                <a
                  href={adopcionSeleccionada.contrato_firmado_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 font-semibold hover:underline"
                  style={{ color: palette.primary }}
                >
                  <ExternalLink size={14} />
                  {adopcionSeleccionada.contrato_firmado_url}
                </a>
              ) : (
                <p className="text-slate-500">
                  No se registró un archivo de contrato firmado.
                </p>
              )}
            </div>

            {adopcionSeleccionada.solicitud.notas_evaluacion && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Notas de Evaluación
                </span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {adopcionSeleccionada.solicitud.notas_evaluacion}
                </p>
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
        title="Eliminar adopción"
        description={
          confirmacion
            ? `¿Estás seguro de eliminar la adopción de "${confirmacion.solicitud.solicitante.nombre} ${confirmacion.solicitud.solicitante.apellido}" para el animal ${confirmacion.solicitud.animal.nombre}? El animal volverá a estar disponible para adopción. Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar adopción"
        loading={eliminandoId === confirmacion?.id_adopcion}
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
