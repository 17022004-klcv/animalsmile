"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import { fechaCorta } from "@/src/services/animals/animal-format";
import {
  eliminarSantuario,
  obtenerSantuarios,
} from "@/src/services/sanctuaries/sanctuary-client";
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
} from "lucide-react";

export default function SantuariosPage() {
  const { palette } = useTheme();

  const [santuarios, setSantuarios] = useState<SantuarioConTraslados[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [santuarioSeleccionado, setSantuarioSeleccionado] =
    useState<SantuarioConTraslados | null>(null);

  const itemsPerPage = 8;

  const cargarSantuarios = async () => {
    try {
      const data = await obtenerSantuarios();
      setSantuarios(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los santuarios.",
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

  const filteredData = santuarios.filter((item) => {
    const texto = searchTerm.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(texto) ||
      (item.contacto_principal ?? "").toLowerCase().includes(texto) ||
      (item.telefono ?? "").toLowerCase().includes(texto) ||
      (item.email ?? "").toLowerCase().includes(texto) ||
      (item.direccion ?? "").toLowerCase().includes(texto) ||
      (item.tipo_fauna_permitida ?? "").toLowerCase().includes(texto)
    );
  });

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

  const handleEliminar = async (santuario: SantuarioConTraslados) => {
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar el santuario "${santuario.nombre}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setEliminandoId(santuario.id_santuario);
    setError(null);
    try {
      await eliminarSantuario(santuario.id_santuario);
      await cargarSantuarios();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el santuario.",
      );
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
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Registro de{" "}
              <span style={{ color: palette.primary }}>Santuarios</span>
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
            <Link href="/admin/modules/Sanctuaries/Sanctuaries/Form">
              <Button icon={<Plus size={16} />}>Nuevo Santuario</Button>
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
            placeholder="Buscar por nombre, contacto, email o dirección..."
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
                <span className="text-xs font-medium">Cargando santuarios...</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/95 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
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
                            <p className="font-bold text-slate-800">{item.nombre}</p>
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
                            className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = palette.primary;
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#64748b";
                            }}
                            title="Previsualizar santuario"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Sanctuaries/Sanctuaries/Form?id=${item.id_santuario}`}
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
                            disabled={eliminandoId === item.id_santuario}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
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
                        No se encontraron santuarios.
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
            <Building2 size={18} style={{ color: palette.primary }} />
            Perfil del Santuario
          </span>
        }
      >
        {santuarioSeleccionado && (
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-600 shadow-xs">
                <Building2 size={22} />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {santuarioSeleccionado.nombre}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Registrado el {fechaCorta(santuarioSeleccionado.creado_en)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Contacto Principal
                </span>
                <p className="font-semibold text-slate-800">
                  {santuarioSeleccionado.contacto_principal ?? "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Teléfono
                </span>
                <p className="font-semibold text-slate-800">
                  {santuarioSeleccionado.telefono ?? "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {santuarioSeleccionado.email ?? "—"}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Dirección
              </span>
              <p className="font-semibold text-slate-800">
                {santuarioSeleccionado.direccion ?? "—"}
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <PawPrint size={12} /> Fauna Permitida
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {santuarioSeleccionado.tipo_fauna_permitida ?? "—"}
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <FileText size={12} /> Traslados Asociados
              </span>
              <span className="font-bold text-slate-800">
                {santuarioSeleccionado._count?.traslados ?? 0}
              </span>
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
