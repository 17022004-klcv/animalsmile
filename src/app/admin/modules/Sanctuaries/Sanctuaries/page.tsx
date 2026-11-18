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
  eliminarSantuario,
  obtenerSantuarios,
} from "@/src/services/sanctuaries/sanctuary-client";
import { SearchableSelect } from "@/src/components/ui/SearchableSelect";
import { TIPOS_FAUNA } from "@/src/utils/constants";
import type { SantuarioConTraslados } from "@/src/types/santuario";
import {
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  Phone,
  PawPrint,
  Truck,
  FileText,
  Loader2,
  AlertTriangle,
  Filter,
  X,
  Mail,
  MapPin,
} from "lucide-react";

export default function SantuariosPage() {
  const { palette } = useTheme();

  const [santuarios, setSantuarios] = useState<SantuarioConTraslados[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] =
    useState<SantuarioConTraslados | null>(null);
  const [toast, setToast] = useState<{
    tipo: ToastTipo;
    mensaje: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [santuarioSeleccionado, setSantuarioSeleccionado] =
    useState<SantuarioConTraslados | null>(null);

  // --- Filtros avanzados (siempre visibles) ---
  const [filtroFauna, setFiltroFauna] = useState("");
  const [filtroTraslados, setFiltroTraslados] = useState<
    "todos" | "sin" | "con" | "muchos"
  >("todos");

  const itemsPerPage = 8;

  const cargarSantuarios = async () => {
    try {
      const data = await obtenerSantuarios();
      setSantuarios(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los santuarios.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerSantuarios()
      .then((data) => {
        if (cancelado) return;
        setSantuarios(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los santuarios.",
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

  // Obtener opciones únicas de fauna permitida dinámicamente
  const opcionesFauna = useMemo(() => {
    const faunas = santuarios
      .map((s) => s.tipo_fauna_permitida)
      .filter((f): f is string => !!f && f.trim() !== "");
    return Array.from(new Set(faunas)).sort();
  }, [santuarios]);

  // Cantidad de filtros activos
  const filtrosActivos = useMemo(() => {
    let n = 0;
    if (filtroFauna) n++;
    if (filtroTraslados !== "todos") n++;
    return n;
  }, [filtroFauna, filtroTraslados]);

  const limpiarFiltros = () => {
    setFiltroFauna("");
    setFiltroTraslados("todos");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return santuarios.filter((item) => {
      // Búsqueda de texto
      const texto = searchTerm.toLowerCase();
      const coincideTexto =
        !texto ||
        item.nombre.toLowerCase().includes(texto) ||
        (item.contacto_principal ?? "").toLowerCase().includes(texto) ||
        (item.telefono ?? "").toLowerCase().includes(texto) ||
        (item.email ?? "").toLowerCase().includes(texto) ||
        (item.direccion ?? "").toLowerCase().includes(texto) ||
        (item.tipo_fauna_permitida ?? "").toLowerCase().includes(texto);

      // Filtro por Fauna
      const coincideFauna =
        !filtroFauna || item.tipo_fauna_permitida === filtroFauna;

      // Filtro por Traslados
      const totalTraslados = item._count?.traslados ?? 0;
      const coincideTraslados =
        filtroTraslados === "todos" ||
        (filtroTraslados === "sin" && totalTraslados === 0) ||
        (filtroTraslados === "con" && totalTraslados > 0) ||
        (filtroTraslados === "muchos" && totalTraslados > 3);

      return coincideTexto && coincideFauna && coincideTraslados;
    });
  }, [santuarios, searchTerm, filtroFauna, filtroTraslados]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleVerDetalle = (santuario: SantuarioConTraslados) => {
    setSantuarioSeleccionado(santuario);
    setModalOpen(true);
  };

  const handleEliminar = (santuario: SantuarioConTraslados) => {
    setConfirmacion(santuario);
  };

  const confirmarEliminacion = async () => {
    if (!confirmacion) return;

    const nombre = confirmacion.nombre;
    setEliminandoId(confirmacion.id_santuario);
    setError(null);
    try {
      await eliminarSantuario(confirmacion.id_santuario);
      setConfirmacion(null);
      setToast({
        tipo: "success",
        mensaje: `El santuario "${nombre}" se eliminó correctamente.`,
      });
      await cargarSantuarios();
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el santuario.";
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
        "Nombre",
        "Contacto Principal",
        "Teléfono",
        "Email",
        "Dirección",
        "Fauna Permitida",
        "Traslados",
        "Fecha Registro",
      ],
      ...filteredData.map((s) => [
        s.nombre,
        s.contacto_principal ?? "—",
        s.telefono ?? "—",
        s.email ?? "—",
        `"${(s.direccion ?? "—").replace(/"/g, '""')}"`,
        `"${(s.tipo_fauna_permitida ?? "—").replace(/"/g, '""')}"`,
        String(s._count?.traslados ?? 0),
        fechaCorta(s.creado_en),
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registro_santuarios.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFicha = (santuario: SantuarioConTraslados) => {
    const lineas = [
      "FICHA DE SANTUARIO - AnimalSmile",
      "".padEnd(40, "="),
      `Nombre: ${santuario.nombre}`,
      `Contacto Principal: ${santuario.contacto_principal ?? "—"}`,
      `Teléfono: ${santuario.telefono ?? "—"}`,
      `Email: ${santuario.email ?? "—"}`,
      `Dirección: ${santuario.direccion ?? "—"}`,
      `Tipo de Fauna Permitida: ${santuario.tipo_fauna_permitida ?? "—"}`,
      `Traslados asociados: ${santuario._count?.traslados ?? 0}`,
      `Fecha de registro: ${fechaCorta(santuario.creado_en)}`,
    ];

    const blob = new Blob([lineas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `santuario_${santuario.nombre.replace(/\s+/g, "_")}.txt`;
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
              Registro de{" "}
              <span style={{ color: palette.primary }}>Santuarios</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {filteredData.length} de {santuarios.length} santuarios
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
            <Link href="/admin/modules/Sanctuaries/Sanctuaries/Form">
              <Button icon={<Plus size={16} />}>Nuevo Santuario</Button>
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
            placeholder="Buscar por nombre, contacto, email o dirección..."
          />
        </div>

        {/* Panel de Filtros Avanzados */}
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
            {/* Fauna usando SearchableSelect */}
            <div>
              <SearchableSelect
                label="Tipo de Fauna"
                options={[
                  { value: "", label: "Todas las faunas" },
                  ...TIPOS_FAUNA,
                ]}
                value={filtroFauna}
                onChange={(val) => {
                  setFiltroFauna(String(val));
                  setCurrentPage(1);
                }}
                placeholder="Todas las faunas"
                searchPlaceholder="Buscar fauna..."
              />
            </div>

            {/* Traslados */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Cantidad de Traslados
              </label>
              <select
                value={filtroTraslados}
                onChange={(e) => {
                  setFiltroTraslados(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Todos</option>
                <option value="sin">Sin traslados</option>
                <option value="con">Con traslados</option>
                <option value="muchos">Más de 3 traslados</option>
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
                  Cargando santuarios...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  <tr>
                    <th className="px-4 py-3">Santuario</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Dirección</th>
                    <th className="px-4 py-3">Fauna</th>
                    <th className="px-4 py-3">Traslados</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item) => (
                    <tr
                      key={item.id_santuario}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-500 shrink-0">
                            <Building2 size={16} />
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">
                              {item.nombre}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Alta: {fechaCorta(item.creado_en)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <User size={11} className="text-slate-400" />
                            {item.contacto_principal ?? "—"}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Phone size={11} />
                            {item.telefono ?? "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-600 max-w-[170px] truncate">
                        {item.email ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-600 max-w-[200px] truncate">
                        {item.direccion ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-600 max-w-[170px] truncate">
                        {item.tipo_fauna_permitida ?? "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            color: palette.primary,
                            backgroundColor: `${palette.primary}10`,
                            borderColor: `${palette.primary}30`,
                          }}
                        >
                          <Truck size={11} />
                          {item._count?.traslados ?? 0}
                        </span>
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
                            title="Previsualizar santuario"
                          >
                            <Eye size={15} />
                          </button>
                          <Link
                            href={`/admin/modules/Sanctuaries/Sanctuaries/Form?id=${item.id_santuario}`}
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
                            disabled={eliminandoId === item.id_santuario}
                            className="anim-press p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Eliminar registro"
                          >
                            {eliminandoId === item.id_santuario ? (
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
                          ? "No se encontraron santuarios con los filtros aplicados."
                          : "No se encontraron santuarios."}
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

      {/* MODAL REESTRUCTURADO A 3 COLUMNAS */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="xl" // <-- Expande el modal
        title={
          <span className="flex items-center gap-2">
            <Building2 size={18} style={{ color: palette.primary }} />
            Perfil del Santuario
          </span>
        }
      >
        {santuarioSeleccionado && (
          <div className="space-y-5 text-xs text-slate-600 w-full">
            {/* Header Santuario */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="w-14 h-14 rounded-full flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-400 shrink-0">
                <Building2 size={24} />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-slate-800 truncate">
                  {santuarioSeleccionado.nombre}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registrado el {fechaCorta(santuarioSeleccionado.creado_en)}
                </p>
              </div>
            </div>

            {/* Grid de 3 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Columna 1 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User size={12} /> Contacto Principal
                </span>
                <p className="font-semibold text-slate-800">
                  {santuarioSeleccionado.contacto_principal ?? "—"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone size={12} /> Teléfono
                </span>
                <p className="font-semibold text-slate-800">
                  {santuarioSeleccionado.telefono ?? "—"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail size={12} /> Correo Electrónico
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {santuarioSeleccionado.email ?? "—"}
                </p>
              </div>

              {/* Fila 2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center md:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin size={12} /> Dirección
                </span>
                <p className="font-semibold text-slate-800">
                  {santuarioSeleccionado.direccion ?? "—"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Truck size={12} /> Traslados Asociados
                </span>
                <p className="font-bold text-slate-800 text-sm">
                  {santuarioSeleccionado._count?.traslados ?? 0}
                </p>
              </div>
            </div>

            {/* Fauna (Ancho completo) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <PawPrint size={14} /> Fauna Permitida
              </span>
              <p className="font-semibold text-slate-800">
                {santuarioSeleccionado.tipo_fauna_permitida ??
                  "No especificada"}
              </p>
            </div>

            {/* Footer del Modal */}
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
        title="Eliminar santuario"
        description={
          confirmacion
            ? `¿Estás seguro de eliminar el santuario "${confirmacion.nombre}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar santuario"
        loading={eliminandoId === confirmacion?.id_santuario}
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
