"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { Toast, type ToastTipo } from "@/src/components/ui/Toast";
import { fechaCorta } from "@/src/services/animals/animal-format";
import {
  eliminarTraslado,
  obtenerTraslados,
} from "@/src/services/sanctuaries/sanctuary-client";
import type { TrasladoConRelaciones } from "@/src/types/traslado";
import {
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Truck,
  PawPrint,
  Building2,
  Calendar,
  User,
  FileText,
  Loader2,
  AlertTriangle,
  Filter,
  X,
  MapPin,
} from "lucide-react";

export default function TrasladosPage() {
  const { palette } = useTheme();

  const [traslados, setTraslados] = useState<TrasladoConRelaciones[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<TrasladoConRelaciones | null>(null);
  const [toast, setToast] = useState<{
    tipo: ToastTipo;
    mensaje: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [trasladoSeleccionado, setTrasladoSeleccionado] =
    useState<TrasladoConRelaciones | null>(null);

  // --- Filtros avanzados ---
  const [filtroSantuario, setFiltroSantuario] = useState("");
  const [filtroEstadoLlegada, setFiltroEstadoLlegada] = useState<
    "todos" | "en_transito" | "completados"
  >("todos");

  const itemsPerPage = 8;

  const cargarTraslados = async () => {
    try {
      const data = await obtenerTraslados();
      setTraslados(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los traslados.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerTraslados()
      .then((data) => {
        if (cancelado) return;
        setTraslados(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los traslados.",
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

  // Extraer santuarios únicos que tienen traslados
  const opcionesSantuarios = useMemo(() => {
    const nombres = traslados
      .map((t) => t.santuario.nombre)
      .filter((n) => !!n && n.trim() !== "");
    return Array.from(new Set(nombres)).sort();
  }, [traslados]);

  const filtrosActivos = useMemo(() => {
    let n = 0;
    if (filtroSantuario) n++;
    if (filtroEstadoLlegada !== "todos") n++;
    return n;
  }, [filtroSantuario, filtroEstadoLlegada]);

  const limpiarFiltros = () => {
    setFiltroSantuario("");
    setFiltroEstadoLlegada("todos");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return traslados.filter((item) => {
      const texto = searchTerm.toLowerCase();
      const coincideTexto =
        !texto ||
        item.animal.nombre.toLowerCase().includes(texto) ||
        item.animal.codigo_identificador.toLowerCase().includes(texto) ||
        item.santuario.nombre.toLowerCase().includes(texto) ||
        item.motivo.toLowerCase().includes(texto) ||
        (item.responsable_transporte ?? "").toLowerCase().includes(texto);

      const coincideSantuario =
        !filtroSantuario || item.santuario.nombre === filtroSantuario;

      const tieneLlegada = !!item.estado_llegada?.trim();
      const coincideLlegada =
        filtroEstadoLlegada === "todos" ||
        (filtroEstadoLlegada === "en_transito" && !tieneLlegada) ||
        (filtroEstadoLlegada === "completados" && tieneLlegada);

      return coincideTexto && coincideSantuario && coincideLlegada;
    });
  }, [traslados, searchTerm, filtroSantuario, filtroEstadoLlegada]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleVerDetalle = (traslado: TrasladoConRelaciones) => {
    setTrasladoSeleccionado(traslado);
    setModalOpen(true);
  };

  const handleEliminar = (traslado: TrasladoConRelaciones) => {
    setConfirmacion(traslado);
  };

  const confirmarEliminacion = async () => {
    if (!confirmacion) return;

    const animal = confirmacion.animal.nombre;
    const santuario = confirmacion.santuario.nombre;
    setEliminandoId(confirmacion.id_traslado);
    setError(null);
    try {
      await eliminarTraslado(confirmacion.id_traslado);
      setConfirmacion(null);
      setToast({
        tipo: "success",
        mensaje: `El traslado de "${animal}" hacia "${santuario}" se eliminó correctamente.`,
      });
      await cargarTraslados();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo eliminar el traslado.";
      setError(mensaje);
      setToast({
        tipo: "error",
        mensaje,
      });
    } finally {
      setEliminandoId(null);
    }
  };

  const exportarCSV = () => {
    const filas = [
      [
        "Animal",
        "Código",
        "Santuario",
        "Fecha Traslado",
        "Motivo",
        "Responsable Transporte",
        "Estado Salida",
        "Estado Llegada",
      ],
      ...filteredData.map((t) => [
        t.animal.nombre,
        t.animal.codigo_identificador,
        t.santuario.nombre,
        fechaCorta(t.fecha_traslado),
        `"${t.motivo.replace(/"/g, '""')}"`,
        t.responsable_transporte ?? "—",
        t.estado_salida ?? "—",
        t.estado_llegada ?? "—",
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "control_traslados.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFicha = (traslado: TrasladoConRelaciones) => {
    const lineas = [
      "FICHA DE TRASLADO - AnimalSmile",
      "".padEnd(40, "="),
      `Animal: ${traslado.animal.nombre} (${traslado.animal.codigo_identificador})`,
      `Santuario destino: ${traslado.santuario.nombre}`,
      `Fecha de traslado: ${fechaCorta(traslado.fecha_traslado)}`,
      `Responsable del transporte: ${traslado.responsable_transporte ?? "—"}`,
      `Estado al salir: ${traslado.estado_salida ?? "—"}`,
      `Estado al llegar: ${traslado.estado_llegada ?? "—"}`,
      "",
      "Motivo del traslado:",
      traslado.motivo,
    ];

    const blob = new Blob([lineas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `traslado_${traslado.animal.codigo_identificador}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="anim-fade-in h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="anim-fade-up delay-1 h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Control de{" "}
              <span style={{ color: palette.primary }}>Traslados</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredData.length} de {traslados.length} traslados
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
            <Link href="/admin/modules/Sanctuaries/Transfers/Form">
              <Button icon={<Plus size={16} />}>Nuevo Traslado</Button>
            </Link>
          </div>
        </div>

        {/* Buscador */}
        <div className="anim-fade-up delay-2 my-4 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por animal, código, santuario, motivo o responsable..."
          />
        </div>

        {/* Panel de Filtros */}
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
            {/* Santuario Destino */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Santuario Destino
              </label>
              <select
                value={filtroSantuario}
                onChange={(e) => {
                  setFiltroSantuario(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="">Todos los santuarios</option>
                {opcionesSantuarios.map((santuario) => (
                  <option key={santuario} value={santuario}>
                    {santuario}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado de Llegada */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Estado de Llegada
              </label>
              <select
                value={filtroEstadoLlegada}
                onChange={(e) => {
                  setFiltroEstadoLlegada(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Todos</option>
                <option value="en_transito">
                  En tránsito (Sin registrar llegada)
                </option>
                <option value="completados">Completados (Con llegada)</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="anim-fade-up delay-4 flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {cargando ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-xs font-medium">
                  Cargando traslados...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  <tr>
                    <th className="px-4 py-3">Animal</th>
                    <th className="px-4 py-3">Santuario Destino</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Motivo</th>
                    <th className="px-4 py-3">Responsable</th>
                    <th className="px-4 py-3">Estados</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item) => (
                    <tr
                      key={item.id_traslado}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-500 shrink-0">
                            <PawPrint size={16} />
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">
                              {item.animal.nombre}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400 font-semibold">
                              {item.animal.codigo_identificador}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Building2 size={13} className="text-slate-400" />
                          {item.santuario.nombre}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        {fechaCorta(item.fecha_traslado)}
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600 max-w-[220px] truncate">
                        {item.motivo}
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        {item.responsable_transporte ?? "—"}
                      </td>

                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-0.5 text-[10px] text-slate-500">
                          <span>
                            <span className="font-bold text-slate-600">
                              Salida:
                            </span>{" "}
                            {item.estado_salida ?? "—"}
                          </span>
                          <span>
                            <span className="font-bold text-slate-600">
                              Llegada:
                            </span>{" "}
                            {item.estado_llegada ?? "—"}
                          </span>
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
                            title="Previsualizar traslado"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Sanctuaries/Transfers/Form?id=${item.id_traslado}`}
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
                            title="Descargar ficha"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            onClick={() => handleEliminar(item)}
                            disabled={eliminandoId === item.id_traslado}
                            className="anim-press p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Eliminar registro"
                          >
                            {eliminandoId === item.id_traslado ? (
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
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-400 font-medium"
                      >
                        {filtrosActivos > 0 || searchTerm
                          ? "No se encontraron traslados con los filtros aplicados."
                          : "No se encontraron traslados registrados."}
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

      {/* Modal de Previsualización (3 Columnas) */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="xl"
        title={
          <span className="flex items-center gap-2">
            <Truck size={18} style={{ color: palette.primary }} />
            Detalle del Traslado
          </span>
        }
      >
        {trasladoSeleccionado && (
          <div className="space-y-5 text-xs text-slate-600 w-full">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="w-14 h-14 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-400 shrink-0">
                <PawPrint size={24} />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-slate-800 truncate">
                  {trasladoSeleccionado.animal.nombre}
                </h3>
                <p className="font-mono text-xs text-slate-500 mt-0.5">
                  Código: {trasladoSeleccionado.animal.codigo_identificador}
                </p>
              </div>
            </div>

            {/* Grid de 3 Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Santuario */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building2 size={12} /> Santuario Destino
                </span>
                <p className="font-semibold text-slate-800">
                  {trasladoSeleccionado.santuario.nombre}
                </p>
              </div>

              {/* Fecha */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Fecha de Traslado
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(trasladoSeleccionado.fecha_traslado)}
                </p>
              </div>

              {/* Responsable */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User size={12} /> Responsable Transporte
                </span>
                <p className="font-semibold text-slate-800">
                  {trasladoSeleccionado.responsable_transporte ?? "—"}
                </p>
              </div>

              {/* Estados */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Estado Salida
                </span>
                <p className="font-semibold text-slate-800">
                  {trasladoSeleccionado.estado_salida ?? "—"}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Estado Llegada
                </span>
                <p className="font-semibold text-slate-800">
                  {trasladoSeleccionado.estado_llegada ?? "—"}
                </p>
              </div>
            </div>

            {/* Motivo (Ancho completo) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <FileText size={14} /> Motivo del Traslado
              </span>
              <p className="font-semibold text-slate-800">
                {trasladoSeleccionado.motivo}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="anim-press px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-sm transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: palette.primary }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmacion !== null}
        title="Eliminar traslado"
        description={
          confirmacion
            ? `¿Estás seguro de eliminar el traslado de "${confirmacion.animal.nombre}" hacia "${confirmacion.santuario.nombre}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar traslado"
        loading={eliminandoId === confirmacion?.id_traslado}
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
