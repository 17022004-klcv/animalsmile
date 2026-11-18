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
  formatearEstadoSolicitud,
  fechaCorta,
} from "@/src/services/solicitudes/solicitud-format";
import {
  obtenerSolicitudes,
  eliminarSolicitud,
} from "@/src/services/solicitudes/solicitud-client";
import { ESTADOS_SOLICITUD } from "@/src/types/solicitud";
import type { SolicitudConRelaciones } from "@/src/types/solicitud";
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
  AlertTriangle,
  User,
  PawPrint,
  Filter,
  X,
} from "lucide-react";

export default function SolicitudesAdopcionPage() {
  const { palette } = useTheme();

  const [solicitudes, setSolicitudes] = useState<SolicitudConRelaciones[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] =
    useState<SolicitudConRelaciones | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: ToastTipo;
  }>({ open: false, message: "", type: "success" });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<SolicitudConRelaciones | null>(null);

  // --- Filtros avanzados (siempre visibles) ---
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroMascotas, setFiltroMascotas] = useState<"todos" | "con" | "sin">(
    "todos",
  );
  const [filtroNotas, setFiltroNotas] = useState<"todos" | "con" | "sin">(
    "todos",
  );

  const itemsPerPage = 10;

  const cargarSolicitudes = async () => {
    try {
      const data = await obtenerSolicitudes();
      setSolicitudes(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las solicitudes de adopción.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerSolicitudes()
      .then((data) => {
        if (cancelado) return;
        setSolicitudes(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las solicitudes de adopción.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Cantidad de filtros activos (para el badge)
  const filtrosActivos = useMemo(() => {
    let n = 0;
    if (filtroEstado) n++;
    if (filtroMascotas !== "todos") n++;
    if (filtroNotas !== "todos") n++;
    return n;
  }, [filtroEstado, filtroMascotas, filtroNotas]);

  const limpiarFiltros = () => {
    setFiltroEstado("");
    setFiltroMascotas("todos");
    setFiltroNotas("todos");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return solicitudes.filter((item) => {
      const term = searchTerm.toLowerCase();
      const coincideTexto =
        !term ||
        item.solicitante.nombre.toLowerCase().includes(term) ||
        item.solicitante.apellido.toLowerCase().includes(term) ||
        item.solicitante.documento_identidad.toLowerCase().includes(term) ||
        item.animal.nombre.toLowerCase().includes(term) ||
        item.animal.codigo_identificador.toLowerCase().includes(term);

      const coincideEstado = !filtroEstado || item.estado === filtroEstado;

      const coincideMascotas =
        filtroMascotas === "todos" ||
        (filtroMascotas === "con" && item.solicitante.tiene_mascotas) ||
        (filtroMascotas === "sin" && !item.solicitante.tiene_mascotas);

      const tieneNotas = !!item.notas_evaluacion?.trim();
      const coincideNotas =
        filtroNotas === "todos" ||
        (filtroNotas === "con" && tieneNotas) ||
        (filtroNotas === "sin" && !tieneNotas);

      return (
        coincideTexto && coincideEstado && coincideMascotas && coincideNotas
      );
    });
  }, [solicitudes, searchTerm, filtroEstado, filtroMascotas, filtroNotas]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleVerDetalle = (solicitud: SolicitudConRelaciones) => {
    setSolicitudSeleccionada(solicitud);
    setModalOpen(true);
  };

  const handleEliminar = async () => {
    if (!confirmarEliminar) return;
    const solicitud = confirmarEliminar;

    setEliminandoId(solicitud.id_solicitud);
    setError(null);
    try {
      await eliminarSolicitud(solicitud.id_solicitud);
      await cargarSolicitudes();
      setToast({
        open: true,
        message: "Solicitud de adopción eliminada correctamente.",
        type: "success",
      });
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la solicitud.";
      setError(mensaje);
      setToast({ open: true, message: mensaje, type: "error" });
    } finally {
      setEliminandoId(null);
      setConfirmarEliminar(null);
    }
  };

  const exportarCSV = () => {
    const filas = [
      [
        "ID Solicitud",
        "Solicitante",
        "Documento",
        "Correo",
        "Teléfono",
        "Animal (Código)",
        "Estado",
        "Fecha Solicitud",
      ],
      ...filteredData.map((s) => [
        s.id_solicitud,
        `${s.solicitante.nombre} ${s.solicitante.apellido}`,
        s.solicitante.documento_identidad,
        s.solicitante.email,
        s.solicitante.telefono,
        `${s.animal.nombre} (${s.animal.codigo_identificador})`,
        formatearEstadoSolicitud(s.estado),
        fechaCorta(s.fecha_solicitud),
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "solicitudes_adopcion.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFicha = (solicitud: SolicitudConRelaciones) => {
    const lineas = [
      "FICHA DE SOLICITUD DE ADOPCIÓN - AnimalSmile",
      "".padEnd(40, "="),
      `ID Solicitud: ${solicitud.id_solicitud}`,
      `Estado: ${formatearEstadoSolicitud(solicitud.estado)}`,
      `Fecha de solicitud: ${fechaCorta(solicitud.fecha_solicitud)}`,
      "",
      "-- Datos del Solicitante --",
      `Nombre completo: ${solicitud.solicitante.nombre} ${solicitud.solicitante.apellido}`,
      `Documento de identidad: ${solicitud.solicitante.documento_identidad}`,
      `Correo: ${solicitud.solicitante.email}`,
      `Teléfono: ${solicitud.solicitante.telefono}`,
      `Dirección: ${solicitud.solicitante.direccion}`,
      `Tipo de vivienda: ${solicitud.solicitante.tipo_vivienda ?? "—"}`,
      `Tiene mascotas: ${solicitud.solicitante.tiene_mascotas ? "Sí" : "No"}`,
      "",
      "-- Datos del Animal --",
      `Nombre: ${solicitud.animal.nombre}`,
      `Código identificador: ${solicitud.animal.codigo_identificador}`,
      "",
      "-- Evaluación --",
      `Notas de evaluación: ${solicitud.notas_evaluacion ?? "Sin notas registradas."}`,
      `Evaluador ID: ${solicitud.evaluador_id ?? "No asignado"}`,
    ];

    const blob = new Blob([lineas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha_solicitud_${solicitud.id_solicitud}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="anim-fade-in h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      {/* Marco Principal */}
      <div className="anim-fade-up delay-1 h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Solicitudes de{" "}
              <span style={{ color: palette.primary }}>Adopción</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredData.length} de {solicitudes.length} solicitudes
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
            <Link href="/admin/modules/Adoption/Applications/Form">
              <Button icon={<Plus size={16} />}>Nueva Solicitud</Button>
            </Link>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="anim-fade-up delay-2 my-4 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por solicitante, documento, animal o código..."
          />
        </div>

        {/* Panel de filtros avanzados (siempre visible) */}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Estado */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Estado
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="">Todos los estados</option>
                {ESTADOS_SOLICITUD.map((valor) => (
                  <option key={valor} value={valor}>
                    {formatearEstadoSolicitud(valor)}
                  </option>
                ))}
              </select>
            </div>

            {/* Mascotas del solicitante */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Mascotas del Solicitante
              </label>
              <select
                value={filtroMascotas}
                onChange={(e) => {
                  setFiltroMascotas(e.target.value as "todos" | "con" | "sin");
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Todos</option>
                <option value="con">Con mascotas</option>
                <option value="sin">Sin mascotas</option>
              </select>
            </div>

            {/* Notas de evaluación */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Notas de Evaluación
              </label>
              <select
                value={filtroNotas}
                onChange={(e) => {
                  setFiltroNotas(e.target.value as "todos" | "con" | "sin");
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Todas</option>
                <option value="con">Con notas registradas</option>
                <option value="sin">Sin notas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Tabla con scroll interno */}
        <div className="anim-fade-up delay-4 flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {cargando ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-xs font-medium">
                  Cargando solicitudes de adopción...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  <tr>
                    <th className="px-4 py-3">Solicitante</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Animal Solicitado</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item: SolicitudConRelaciones) => (
                    <tr
                      key={item.id_solicitud}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Solicitante */}
                      <td className="px-4 py-2.5 flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-500 shrink-0"
                          title="Solicitante"
                        >
                          <User size={15} />
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 block">
                            {item.solicitante.nombre}{" "}
                            {item.solicitante.apellido}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Doc: {item.solicitante.documento_identidad}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        <div>{item.solicitante.email}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.solicitante.telefono}
                        </div>
                      </td>

                      {/* Animal */}
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-400 shrink-0">
                            <PawPrint size={12} />
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 block">
                              {item.animal.nombre}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.animal.codigo_identificador}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        {fechaCorta(item.fecha_solicitud)}
                      </td>

                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.estado === "Aprobada"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : item.estado === "Pendiente"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : item.estado === "En_Evaluacion" ||
                                    item.estado === "Entrevista_Domiciliaria"
                                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                                  : "bg-red-50 text-red-600 border border-red-200"
                          }`}
                        >
                          {formatearEstadoSolicitud(item.estado)}
                        </span>
                      </td>

                      {/* Botones de Acción */}
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* NUEVO BOTÓN: Generar Contrato (Solo si está Aprobada) */}
                          {item.estado === "Aprobada" && (
                            <Link
                              href={`/admin/modules/Adoption/Contracts/Form?id_solicitud=${item.id_solicitud}`}
                              className="anim-press p-1.5 rounded-lg text-emerald-600 hover:text-white transition shadow-2xs bg-emerald-50 border border-emerald-200"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#059669"; // emerald-600
                                e.currentTarget.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#ecfdf5"; // emerald-50
                                e.currentTarget.style.color = "#059669";
                              }}
                              title="Generar Contrato de Adopción"
                            >
                              <FileText size={15} />
                            </Link>
                          )}

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
                            title="Previsualizar solicitud"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Adoption/Applications/Form?id=${item.id_solicitud}`}
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
                            onClick={() => setConfirmarEliminar(item)}
                            disabled={eliminandoId === item.id_solicitud}
                            className="anim-press p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Eliminar registro"
                          >
                            {eliminandoId === item.id_solicitud ? (
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
                          ? "No se encontraron solicitudes con los filtros aplicados."
                          : "No se encontraron registros de solicitudes."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Paginación */}
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

      {/* Modal de Previsualización */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="xl"
        title={
          <span className="flex items-center gap-2">
            <FileText size={18} style={{ color: palette.primary }} />
            Expediente de Solicitud de Adopción
          </span>
        }
      >
        {solicitudSeleccionada && (
          <div className="space-y-5 text-xs text-slate-600 w-full">
            {/* Header Solicitante (Ancho completo) */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="w-14 h-14 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-400 shrink-0">
                <User size={24} />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-slate-800 truncate">
                  {solicitudSeleccionada.solicitante.nombre}{" "}
                  {solicitudSeleccionada.solicitante.apellido}
                </h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">
                  Documento:{" "}
                  {solicitudSeleccionada.solicitante.documento_identidad}
                </p>
              </div>
            </div>

            {/* Grid de 3 Columnas Responsive para los datos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Fila 1 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {solicitudSeleccionada.solicitante.email}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Teléfono
                </span>
                <p className="font-semibold text-slate-800">
                  {solicitudSeleccionada.solicitante.telefono}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tipo de Vivienda
                </span>
                <p className="font-semibold text-slate-800">
                  {solicitudSeleccionada.solicitante.tipo_vivienda ?? "—"}
                </p>
              </div>

              {/* Fila 2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tiene Mascotas
                </span>
                <p className="font-semibold text-slate-800">
                  {solicitudSeleccionada.solicitante.tiene_mascotas
                    ? "Sí"
                    : "No"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Estado de la Solicitud
                </span>
                <p className="font-semibold text-slate-800">
                  {formatearEstadoSolicitud(solicitudSeleccionada.estado)}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Fecha de Solicitud
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(solicitudSeleccionada.fecha_solicitud)}
                </p>
              </div>
            </div>

            {/* Animal Solicitado (Ancho completo, horizontal) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-400 shrink-0">
                  <PawPrint size={18} />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Animal Solicitado
                  </span>
                  <p className="text-slate-800 font-bold text-sm">
                    {solicitudSeleccionada.animal.nombre}
                    <span className="font-mono text-xs font-normal text-slate-500 ml-2">
                      ({solicitudSeleccionada.animal.codigo_identificador})
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Notas de Evaluación Reestructuradas (Ancho completo) */}
            {solicitudSeleccionada.notas_evaluacion && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3 border-b border-slate-200 pb-2">
                  Detalles de Evaluación
                </span>
                <div className="space-y-2.5 text-slate-700">
                  {/* Parseo del texto separado por '|' */}
                  {solicitudSeleccionada.notas_evaluacion
                    .split("|")
                    .map((nota, index) => {
                      const textoLimpio = nota.trim();
                      if (!textoLimpio) return null;

                      const tieneDosPuntos = textoLimpio.includes(":");

                      if (tieneDosPuntos) {
                        const [clave, ...resto] = textoLimpio.split(":");
                        const valor = resto.join(":").trim();
                        return (
                          <div
                            key={index}
                            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3"
                          >
                            <span className="font-bold text-slate-800 shrink-0 sm:w-32">
                              {clave.trim()}:
                            </span>
                            <span className="text-slate-600">{valor}</span>
                          </div>
                        );
                      }

                      return (
                        <div key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                          <span className="text-slate-600 leading-relaxed">
                            {textoLimpio}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Footer del Modal */}
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
        open={confirmarEliminar !== null}
        title="Eliminar solicitud"
        description={
          confirmarEliminar
            ? `¿Estás seguro de eliminar la solicitud de "${confirmarEliminar.solicitante.nombre} ${confirmarEliminar.solicitante.apellido}" para el animal "${confirmarEliminar.animal.nombre}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        loading={
          eliminandoId !== null &&
          eliminandoId === confirmarEliminar?.id_solicitud
        }
        onConfirm={handleEliminar}
        onCancel={() => setConfirmarEliminar(null)}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
