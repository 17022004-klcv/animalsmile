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
  eliminarDonacionFinanciera,
  obtenerDonacionesFinancieras,
} from "@/src/services/donations/donation-client";
import type { DonacionConRegistrador } from "@/src/types/donacion";
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Mail,
  Plus,
  Trash2,
  User,
  Users,
  Filter,
  X,
} from "lucide-react";

function formatoMonto(monto: number | null): string {
  return monto === null ? "—" : `$${monto.toFixed(2)}`;
}

export default function DonacionesFinancierasPage() {
  const { palette } = useTheme();

  const [donaciones, setDonaciones] = useState<DonacionConRegistrador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<DonacionConRegistrador | null>(null);
  const [toast, setToast] = useState<{
    tipo: ToastTipo;
    mensaje: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [donacionSeleccionada, setDonacionSeleccionada] =
    useState<DonacionConRegistrador | null>(null);

  // --- Filtros avanzados ---
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [filtroMonto, setFiltroMonto] = useState<
    "todos" | "bajo" | "medio" | "alto"
  >("todos");

  const itemsPerPage = 8;

  const cargarDonaciones = async () => {
    try {
      const data = await obtenerDonacionesFinancieras();
      setDonaciones(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las donaciones financieras.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerDonacionesFinancieras()
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
              : "No se pudieron cargar las donaciones financieras.",
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

  // Extraer métodos de pago únicos
  const opcionesMetodos = useMemo(() => {
    const metodos = donaciones
      .map((d) => d.metodo_pago)
      .filter((m): m is string => !!m && m.trim() !== "");
    return Array.from(new Set(metodos)).sort();
  }, [donaciones]);

  const filtrosActivos = useMemo(() => {
    let n = 0;
    if (filtroMetodo) n++;
    if (filtroMonto !== "todos") n++;
    return n;
  }, [filtroMetodo, filtroMonto]);

  const limpiarFiltros = () => {
    setFiltroMetodo("");
    setFiltroMonto("todos");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return donaciones.filter((item) => {
      const texto = searchTerm.toLowerCase();
      const coincideTexto =
        !texto ||
        (item.donante_nombre ?? "").toLowerCase().includes(texto) ||
        (item.donante_email ?? "").toLowerCase().includes(texto) ||
        (item.metodo_pago ?? "").toLowerCase().includes(texto) ||
        (item.descripcion_detalle ?? "").toLowerCase().includes(texto) ||
        (item.registrador
          ? `${item.registrador.nombre} ${item.registrador.apellido}`
          : ""
        )
          .toLowerCase()
          .includes(texto);

      const coincideMetodo = !filtroMetodo || item.metodo_pago === filtroMetodo;

      const monto = item.monto ?? 0;
      const coincideMonto =
        filtroMonto === "todos" ||
        (filtroMonto === "bajo" && monto < 10) ||
        (filtroMonto === "medio" && monto >= 10 && monto <= 50) ||
        (filtroMonto === "alto" && monto > 50);

      return coincideTexto && coincideMetodo && coincideMonto;
    });
  }, [donaciones, searchTerm, filtroMetodo, filtroMonto]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const totalRecaudado = filteredData.reduce(
    (total, item) => total + (item.monto ?? 0),
    0,
  );

  const handleVerDetalle = (donacion: DonacionConRegistrador) => {
    setDonacionSeleccionada(donacion);
    setModalOpen(true);
  };

  const handleEliminar = (donacion: DonacionConRegistrador) => {
    setConfirmacion(donacion);
  };

  const confirmarEliminacion = async () => {
    if (!confirmacion) return;

    const donante = confirmacion.donante_nombre ?? "Anónimo";
    const monto = formatoMonto(confirmacion.monto);
    setEliminandoId(confirmacion.id_donacion);
    setError(null);
    try {
      await eliminarDonacionFinanciera(confirmacion.id_donacion);
      setConfirmacion(null);
      setToast({
        tipo: "success",
        mensaje: `La donación de "${donante}" por ${monto} se eliminó correctamente.`,
      });
      await cargarDonaciones();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo eliminar la donación.";
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
        "Donante",
        "Email",
        "Monto",
        "Método de Pago",
        "Fecha",
        "Descripción",
        "Comprobante",
        "Registrado por",
      ],
      ...filteredData.map((d) => [
        d.donante_nombre ?? "Anónimo",
        d.donante_email ?? "—",
        d.monto?.toFixed(2) ?? "—",
        d.metodo_pago ?? "—",
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
    a.download = "donaciones_financieras.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFicha = (donacion: DonacionConRegistrador) => {
    const lineas = [
      "FICHA DE DONACIÓN FINANCIERA - AnimalSmile",
      "".padEnd(46, "="),
      `Donante: ${donacion.donante_nombre ?? "Anónimo"}`,
      `Correo: ${donacion.donante_email ?? "—"}`,
      `Monto: ${formatoMonto(donacion.monto)}`,
      `Método de pago: ${donacion.metodo_pago ?? "—"}`,
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
    a.download = `donacion_${donacion.id_donacion.slice(0, 8)}.txt`;
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
              Donaciones{" "}
              <span style={{ color: palette.primary }}>Financieras</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Total recaudado (filtro actual):{" "}
              <span className="font-bold" style={{ color: palette.primary }}>
                {formatoMonto(totalRecaudado)}
              </span>
              {filtrosActivos > 0 && (
                <span
                  style={{ color: palette.primary }}
                  className="font-semibold ml-1"
                >
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
            <Link href="/admin/modules/Donations/FinancialDonations/Form">
              <Button icon={<Plus size={16} />}>Nueva Donación</Button>
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
            placeholder="Buscar por donante, correo, método o descripción..."
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
            {/* Método de Pago */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Método de Pago
              </label>
              <select
                value={filtroMetodo}
                onChange={(e) => {
                  setFiltroMetodo(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="">Todos los métodos</option>
                {opcionesMetodos.map((metodo) => (
                  <option key={metodo} value={metodo}>
                    {metodo}
                  </option>
                ))}
              </select>
            </div>

            {/* Rango de Monto */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Monto de Donación
              </label>
              <select
                value={filtroMonto}
                onChange={(e) => {
                  setFiltroMonto(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Cualquier monto</option>
                <option value="bajo">Menor a $10.00</option>
                <option value="medio">Entre $10.00 y $50.00</option>
                <option value="alto">Mayor a $50.00</option>
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
                  Cargando donaciones...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  <tr>
                    <th className="px-4 py-3">Donante</th>
                    <th className="px-4 py-3">Monto</th>
                    <th className="px-4 py-3">Método</th>
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
                            <DollarSign size={16} />
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
                          className="font-black text-sm"
                          style={{ color: palette.primary }}
                        >
                          {formatoMonto(item.monto)}
                        </span>
                      </td>

                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            color: palette.secondary,
                            backgroundColor: `${palette.secondary}12`,
                            border: `1px solid ${palette.secondary}30`,
                          }}
                        >
                          <CreditCard size={11} />
                          {item.metodo_pago ?? "No indicado"}
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
                            title="Previsualizar donación"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Donations/FinancialDonations/Form?id=${item.id_donacion}`}
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
                            disabled={eliminandoId === item.id_donacion}
                            className="anim-press p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
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
                        {filtrosActivos > 0 || searchTerm
                          ? "No se encontraron donaciones con los filtros aplicados."
                          : "No se encontraron donaciones financieras."}
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
            <DollarSign size={18} style={{ color: palette.primary }} />
            Detalle de la Donación
          </span>
        }
      >
        {donacionSeleccionada && (
          <div className="space-y-5 text-xs text-slate-600 w-full">
            {/* Header con degradado */}
            <div
              className="flex items-center justify-between gap-3 p-4 rounded-2xl text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
              }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 border border-white/40 shrink-0">
                  <DollarSign size={24} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-lg truncate">
                    {donacionSeleccionada.donante_nombre ?? "Anónimo"}
                  </h3>
                  <p className="text-xs text-white/80 truncate">
                    {donacionSeleccionada.donante_email ??
                      "Sin correo registrado"}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-black shrink-0">
                {formatoMonto(donacionSeleccionada.monto)}
              </span>
            </div>

            {/* Grid de 3 Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Fila 1 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <CreditCard size={12} /> Método de Pago
                </span>
                <p className="font-semibold text-slate-800">
                  {donacionSeleccionada.metodo_pago ?? "No indicado"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Fecha de Donación
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(donacionSeleccionada.fecha_donacion)}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users size={12} /> Registrado por
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {donacionSeleccionada.registrador
                    ? `${donacionSeleccionada.registrador.nombre} ${donacionSeleccionada.registrador.apellido}`
                    : "—"}
                </p>
              </div>

              {/* Fila 2 (Comprobante y Detalle) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center md:col-span-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText size={12} /> Comprobante
                </span>
                {donacionSeleccionada.comprobante_url ? (
                  <a
                    href={donacionSeleccionada.comprobante_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-xs hover:underline break-all"
                    style={{ color: palette.primary }}
                  >
                    Ver comprobante adjunto
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <p className="font-semibold text-slate-800">No adjunto</p>
                )}
              </div>

              {/* Detalle (Ancho completo) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 md:col-span-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <FileText size={14} /> Detalle de la Donación
                </span>
                <p className="font-semibold text-slate-800">
                  {donacionSeleccionada.descripcion_detalle ??
                    "Sin detalle registrado."}
                </p>
              </div>
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
        title="Eliminar donación financiera"
        description={
          confirmacion
            ? `¿Estás seguro de eliminar la donación de "${confirmacion.donante_nombre ?? "Anónimo"}" por ${formatoMonto(confirmacion.monto)}? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar donación"
        loading={eliminandoId === confirmacion?.id_donacion}
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
