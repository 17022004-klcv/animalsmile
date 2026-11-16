"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
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
} from "lucide-react";

export default function TrasladosPage() {
  const { palette } = useTheme();

  const [traslados, setTraslados] = useState<TrasladoConRelaciones[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [trasladoSeleccionado, setTrasladoSeleccionado] =
    useState<TrasladoConRelaciones | null>(null);

  const itemsPerPage = 8;

  const cargarTraslados = async () => {
    try {
      const data = await obtenerTraslados();
      setTraslados(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los traslados.",
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

  const filteredData = traslados.filter((item) => {
    const texto = searchTerm.toLowerCase();
    return (
      item.animal.nombre.toLowerCase().includes(texto) ||
      item.animal.codigo_identificador.toLowerCase().includes(texto) ||
      item.santuario.nombre.toLowerCase().includes(texto) ||
      item.motivo.toLowerCase().includes(texto) ||
      (item.responsable_transporte ?? "").toLowerCase().includes(texto)
    );
  });

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

  const handleEliminar = async (traslado: TrasladoConRelaciones) => {
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar el traslado de "${traslado.animal.nombre}" hacia "${traslado.santuario.nombre}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setEliminandoId(traslado.id_traslado);
    setError(null);
    try {
      await eliminarTraslado(traslado.id_traslado);
      await cargarTraslados();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el traslado.",
      );
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
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Control de{" "}
              <span style={{ color: palette.primary }}>Traslados</span>
            </h1>
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

        <div className="flex items-center gap-3 my-4 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por animal, código, santuario, motivo o responsable..."
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            {cargando ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-xs font-medium">Cargando traslados...</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/95 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = palette.primary;
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#64748b";
                            }}
                            title="Previsualizar traslado"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Sanctuaries/Transfers/Form?id=${item.id_traslado}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                palette.secondary;
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#64748b";
                            }}
                            title="Editar registro"
                          >
                            <Edit size={15} />
                          </Link>

                          <button
                            onClick={() => descargarFicha(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = palette.dark;
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#64748b";
                            }}
                            title="Descargar ficha"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            onClick={() => handleEliminar(item)}
                            disabled={eliminandoId === item.id_traslado}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
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
                        No se encontraron traslados registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>
            mostrando {filteredData.length > 0 ? startIndex + 1 : 0}-
            {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
            {filteredData.length} registros
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-bold text-slate-700">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <Truck size={18} style={{ color: palette.primary }} />
            Detalle del Traslado
          </span>
        }
      >
        {trasladoSeleccionado && (
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-600 shadow-xs">
                <PawPrint size={22} />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {trasladoSeleccionado.animal.nombre}
                </h3>
                <p className="font-mono text-[11px] text-slate-400">
                  {trasladoSeleccionado.animal.codigo_identificador}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Building2 size={11} /> Santuario Destino
                </span>
                <p className="font-semibold text-slate-800">
                  {trasladoSeleccionado.santuario.nombre}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar size={11} /> Fecha
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(trasladoSeleccionado.fecha_traslado)}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <User size={11} /> Responsable del Transporte
                </span>
                <p className="font-semibold text-slate-800">
                  {trasladoSeleccionado.responsable_transporte ?? "—"}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <FileText size={11} /> Motivo
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {trasladoSeleccionado.motivo}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Estado de Salida
                </span>
                <p className="font-semibold text-slate-800">
                  {trasladoSeleccionado.estado_salida ?? "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Estado de Llegada
                </span>
                <p className="font-semibold text-slate-800">
                  {trasladoSeleccionado.estado_llegada ?? "—"}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition"
                style={{ backgroundColor: palette.primary }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
