"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import {
  formatearEstadoSolicitud,
  fechaCorta,
} from "@/src/services/solicitudes/solicitud-format";
import {
  obtenerSolicitudes,
  eliminarSolicitud,
} from "@/src/services/solicitudes/solicitud-client";
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
} from "lucide-react";

export default function SolicitudesAdopcionPage() {
  const { palette } = useTheme();

  const [solicitudes, setSolicitudes] = useState<SolicitudConRelaciones[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState<SolicitudConRelaciones | null>(null);

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

  const filteredData = solicitudes.filter(
    (item: SolicitudConRelaciones) =>
      item.solicitante.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.solicitante.apellido
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.solicitante.documento_identidad
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.animal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.animal.codigo_identificador
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

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

  const handleEliminar = async (solicitud: SolicitudConRelaciones) => {
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar la solicitud de "${solicitud.solicitante.nombre} ${solicitud.solicitante.apellido}" para el animal ${solicitud.animal.nombre}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setEliminandoId(solicitud.id_solicitud);
    setError(null);
    try {
      await eliminarSolicitud(solicitud.id_solicitud);
      await cargarSolicitudes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la solicitud.",
      );
    } finally {
      setEliminandoId(null);
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
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      {/* Marco Principal */}
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Solicitudes de{" "}
              <span style={{ color: palette.primary }}>Adopción</span>
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
            <Link href="/admin/modules/Adoption/Applications/Form">
              <Button icon={<Plus size={16} />}>Nueva Solicitud</Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 my-4 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por solicitante, documento, animal o código..."
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Tabla con scroll interno */}
        <div className="flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
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
                            title="Previsualizar solicitud"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Adoption/Applications/Form?id=${item.id_solicitud}`}
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
                            title="Descargar Ficha"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            onClick={() => handleEliminar(item)}
                            disabled={eliminandoId === item.id_solicitud}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
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
                        No se encontraron registros de solicitudes.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Paginación */}
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

      {/* Modal de Previsualización */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <FileText size={18} style={{ color: palette.primary }} />
            Expediente de Solicitud de Adopción
          </span>
        }
      >
        {solicitudSeleccionada && (
          <div className="space-y-3 text-xs text-slate-600">
            {/* Header Solicitante */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 border-2 border-white shadow-xs text-slate-400">
                <User size={20} />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {solicitudSeleccionada.solicitante.nombre}{" "}
                  {solicitudSeleccionada.solicitante.apellido}
                </h3>
                <p className="font-mono text-[11px] text-slate-400">
                  Doc: {solicitudSeleccionada.solicitante.documento_identidad}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-slate-800 truncate">
                  {solicitudSeleccionada.solicitante.email}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Teléfono
                </span>
                <p className="font-semibold text-slate-800">
                  {solicitudSeleccionada.solicitante.telefono}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Tipo de Vivienda
                </span>
                <p className="font-semibold text-slate-800">
                  {solicitudSeleccionada.solicitante.tipo_vivienda ?? "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Tiene Mascotas
                </span>
                <p className="font-semibold text-slate-800">
                  {solicitudSeleccionada.solicitante.tiene_mascotas
                    ? "Sí"
                    : "No"}
                </p>
              </div>
            </div>

            {/* Datos del Animal Solicitado */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <PawPrint size={12} /> Animal Solicitado
              </span>
              <p className="text-slate-700 font-semibold">
                {solicitudSeleccionada.animal.nombre}{" "}
                <span className="font-mono text-xs font-normal text-slate-400">
                  ({solicitudSeleccionada.animal.codigo_identificador})
                </span>
              </p>
            </div>

            {/* Estado y Notas */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Estado de la Solicitud
                </span>
                <p className="font-semibold text-slate-800">
                  {formatearEstadoSolicitud(solicitudSeleccionada.estado)}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Fecha de Solicitud
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(solicitudSeleccionada.fecha_solicitud)}
                </p>
              </div>
            </div>

            {solicitudSeleccionada.notas_evaluacion && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Notas de Evaluación
                </span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {solicitudSeleccionada.notas_evaluacion}
                </p>
              </div>
            )}

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
