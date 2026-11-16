"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import { fechaCorta } from "@/src/services/animals/animal-format";
import {
  eliminarDonacionEspecie,
  obtenerDonacionesEspecie,
} from "@/src/services/donations/donation-client";
import {
  etiquetaTipoDonacion,
  formatearCantidad,
} from "@/src/services/donations/donation-format";
import type { DonacionConRegistrador } from "@/src/types/donacion";
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Hash,
  Link2,
  Loader2,
  Mail,
  Package,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

export default function DonacionesEspeciePage() {
  const { palette } = useTheme();

  const [donaciones, setDonaciones] = useState<DonacionConRegistrador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [donacionSeleccionada, setDonacionSeleccionada] =
    useState<DonacionConRegistrador | null>(null);

  const itemsPerPage = 8;

  const cargarDonaciones = async () => {
    try {
      const data = await obtenerDonacionesEspecie();
      setDonaciones(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las donaciones en especie.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerDonacionesEspecie()
      .then((data) => {
        if (cancelado) return;
        setDonaciones(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las donaciones en especie.",
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

  const filteredData = donaciones.filter((item) => {
    const texto = searchTerm.toLowerCase();
    return (
      (item.donante_nombre ?? "").toLowerCase().includes(texto) ||
      (item.donante_email ?? "").toLowerCase().includes(texto) ||
      etiquetaTipoDonacion(item.tipo).toLowerCase().includes(texto) ||
      (item.unidad_medida ?? "").toLowerCase().includes(texto) ||
      (item.descripcion_detalle ?? "").toLowerCase().includes(texto) ||
      (item.registrador
        ? `${item.registrador.nombre} ${item.registrador.apellido}`
        : ""
      )
        .toLowerCase()
        .includes(texto)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleVerDetalle = (donacion: DonacionConRegistrador) => {
    setDonacionSeleccionada(donacion);
    setModalOpen(true);
  };

  const handleEliminar = async (donacion: DonacionConRegistrador) => {
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar la donación en especie de "${donacion.donante_nombre ?? "Anónimo"}" (${formatearCantidad(donacion.cantidad, donacion.unidad_medida)})? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setEliminandoId(donacion.id_donacion);
    setError(null);
    try {
      await eliminarDonacionEspecie(donacion.id_donacion);
      await cargarDonaciones();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la donación.",
      );
    } finally {
      setEliminandoId(null);
    }
  };

  const exportarCSV = () => {
    const filas = [
      [
        "Donante",
        "Email",
        "Tipo",
        "Cantidad",
        "Unidad de medida",
        "Fecha",
        "Descripción",
        "Comprobante",
        "Registrado por",
      ],
      ...filteredData.map((d) => [
        d.donante_nombre ?? "Anónimo",
        d.donante_email ?? "—",
        etiquetaTipoDonacion(d.tipo),
        d.cantidad ?? "—",
        d.unidad_medida ?? "—",
        fechaCorta(d.fecha_donacion),
        `"${(d.descripcion_detalle ?? "—").replace(/"/g, '""')}"`,
        d.comprobante_url ?? "—",
        d.registrador
          ? `${d.registrador.nombre} ${d.registrador.apellido}`
          : "—",
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "donaciones_especie.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFicha = (donacion: DonacionConRegistrador) => {
    const lineas = [
      "FICHA DE DONACIÓN EN ESPECIE - AnimalSmile",
      "".padEnd(46, "="),
      `Donante: ${donacion.donante_nombre ?? "Anónimo"}`,
      `Correo: ${donacion.donante_email ?? "—"}`,
      `Tipo: ${etiquetaTipoDonacion(donacion.tipo)}`,
      `Cantidad: ${formatearCantidad(donacion.cantidad, donacion.unidad_medida)}`,
      `Fecha: ${fechaCorta(donacion.fecha_donacion)}`,
      `Comprobante: ${donacion.comprobante_url ?? "—"}`,
      `Registrado por: ${
        donacion.registrador
          ? `${donacion.registrador.nombre} ${donacion.registrador.apellido}`
          : "—"
      }`,
      "",
      "Detalle:",
      donacion.descripcion_detalle ?? "Sin detalle registrado.",
    ];

    const blob = new Blob([lineas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donacion_especie_${donacion.id_donacion.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Donaciones{" "}
              <span style={{ color: palette.primary }}>en Especie</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Registros totales:{" "}
              <span className="font-bold" style={{ color: palette.primary }}>
                {donaciones.length}
              </span>
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
            <Link href="/admin/modules/Donations/InKindDonations/Form">
              <Button icon={<Plus size={16} />}>Nueva Donación</Button>
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
            placeholder="Buscar por donante, correo, tipo, unidad o descripción..."
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
                <span className="text-xs font-medium">
                  Cargando donaciones...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/95 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Donante</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Cantidad</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Registrado por</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item) => (
                    <tr
                      key={item.id_donacion}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-full flex items-center justify-center border shrink-0"
                            style={{
                              borderColor: `${palette.primary}30`,
                              backgroundColor: `${palette.primary}10`,
                              color: palette.primary,
                            }}
                          >
                            <Package size={16} />
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">
                              {item.donante_nombre ?? "Anónimo"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium truncate">
                              {item.donante_email ?? "Sin correo registrado"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
                          style={{
                            color: palette.secondary,
                            backgroundColor: `${palette.secondary}12`,
                            border: `1px solid ${palette.secondary}30`,
                          }}
                        >
                          <Package size={11} />
                          {etiquetaTipoDonacion(item.tipo)}
                        </span>
                      </td>

                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 font-black text-sm whitespace-nowrap"
                          style={{ color: palette.primary }}
                        >
                          <Hash size={13} />
                          {formatearCantidad(item.cantidad, item.unidad_medida)}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        {fechaCorta(item.fecha_donacion)}
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600 max-w-[170px] truncate">
                        {item.registrador
                          ? `${item.registrador.nombre} ${item.registrador.apellido}`
                          : "—"}
                      </td>

                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleVerDetalle(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
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
                            title="Previsualizar donación"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Donations/InKindDonations/Form?id=${item.id_donacion}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
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
                            disabled={eliminandoId === item.id_donacion}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Eliminar registro"
                          >
                            {eliminandoId === item.id_donacion ? (
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
                        No se encontraron donaciones en especie.
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
            <Package size={18} style={{ color: palette.primary }} />
            Detalle de la Donación en Especie
          </span>
        }
      >
        {donacionSeleccionada && (
          <div className="space-y-3 text-xs text-slate-600">
            <div
              className="flex items-center justify-between gap-3 p-4 rounded-xl text-white"
              style={{
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-white/20 border border-white/40 shrink-0">
                  <Package size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">
                    {donacionSeleccionada.donante_nombre ?? "Anónimo"}
                  </h3>
                  <p className="text-[11px] text-white/80 truncate">
                    {donacionSeleccionada.donante_email ?? "Sin correo"}
                  </p>
                </div>
              </div>
              <span className="text-lg font-black shrink-0 text-right">
                {formatearCantidad(
                  donacionSeleccionada.cantidad,
                  donacionSeleccionada.unidad_medida,
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Package size={11} /> Tipo
                </span>
                <p className="font-semibold text-slate-800">
                  {etiquetaTipoDonacion(donacionSeleccionada.tipo)}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar size={11} /> Fecha
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(donacionSeleccionada.fecha_donacion)}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Mail size={11} /> Correo
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {donacionSeleccionada.donante_email ?? "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Users size={11} /> Registrado por
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {donacionSeleccionada.registrador
                    ? `${donacionSeleccionada.registrador.nombre} ${donacionSeleccionada.registrador.apellido}`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <FileText size={11} /> Detalle
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {donacionSeleccionada.descripcion_detalle ??
                  "Sin detalle registrado."}
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Link2 size={11} /> Comprobante
              </span>
              {donacionSeleccionada.comprobante_url ? (
                <a
                  href={donacionSeleccionada.comprobante_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-xs mt-0.5 hover:underline break-all"
                  style={{ color: palette.primary }}
                >
                  Ver comprobante
                  <ExternalLink size={11} />
                </a>
              ) : (
                <p className="font-semibold text-slate-800 mt-0.5">
                  No adjunto
                </p>
              )}
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
