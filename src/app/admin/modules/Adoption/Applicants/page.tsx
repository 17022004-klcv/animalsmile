"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import { fechaCorta } from "@/src/services/animals/animal-format"; // Reutilizamos tu helper de fecha
import {
  obtenerSolicitantes,
  eliminarSolicitante,
} from "@/src/services/applicants/applicants-client";
import type { SolicitanteConConteo } from "@/src/types/solicitantes";
import {
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  User,
  Home,
  Phone,
  Mail,
  FileText,
  Dog,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function SolicitantesPage() {
  const { palette } = useTheme();

  const [solicitantes, setSolicitantes] = useState<SolicitanteConConteo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [solicitanteSeleccionado, setSolicitanteSeleccionado] =
    useState<SolicitanteConConteo | null>(null);

  const itemsPerPage = 10;

  const cargarSolicitantes = async () => {
    try {
      const data = await obtenerSolicitantes();
      setSolicitantes(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los solicitantes.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerSolicitantes()
      .then((data) => {
        if (cancelado) return;
        setSolicitantes(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los solicitantes.",
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

  const filteredData = solicitantes.filter(
    (item: SolicitanteConConteo) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.documento_identidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.telefono.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleVerDetalle = (solicitante: SolicitanteConConteo) => {
    setSolicitanteSeleccionado(solicitante);
    setModalOpen(true);
  };

  const handleEliminar = async (solicitante: SolicitanteConConteo) => {
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar al solicitante "${solicitante.nombre} ${solicitante.apellido}" (${solicitante.documento_identidad})? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setEliminandoId(solicitante.id_solicitante);
    setError(null);
    try {
      await eliminarSolicitante(solicitante.id_solicitante);
      await cargarSolicitantes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar el solicitante.",
      );
    } finally {
      setEliminandoId(null);
    }
  };

  const exportarCSV = () => {
    const filas = [
      [
        "Documento",
        "Nombre",
        "Apellido",
        "Email",
        "Teléfono",
        "Dirección",
        "Tipo Vivienda",
        "Tiene Mascotas",
        "Solicitudes Totales",
        "Fecha Registro",
      ],
      ...filteredData.map((s) => [
        s.documento_identidad,
        s.nombre,
        s.apellido,
        s.email,
        s.telefono,
        `"${s.direccion.replace(/"/g, '""')}"`,
        s.tipo_vivienda ?? "—",
        s.tiene_mascotas ? "Sí" : "No",
        String(s._count.solicitudes),
        fechaCorta(s.creado_en),
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registro_solicitantes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFicha = (solicitante: SolicitanteConConteo) => {
    const lineas = [
      "FICHA DE SOLICITANTE - AnimalSmile",
      "".padEnd(40, "="),
      `Documento Identidad: ${solicitante.documento_identidad}`,
      `Nombre Completo: ${solicitante.nombre} ${solicitante.apellido}`,
      `Email: ${solicitante.email}`,
      `Teléfono: ${solicitante.telefono}`,
      `Dirección: ${solicitante.direccion}`,
      `Tipo de Vivienda: ${solicitante.tipo_vivienda ?? "—"}`,
      `¿Tiene mascotas actuales?: ${solicitante.tiene_mascotas ? "Sí" : "No"}`,
      `Total de solicitudes creadas: ${solicitante._count.solicitudes}`,
      `Fecha de registro: ${fechaCorta(solicitante.creado_en)}`,
    ];

    const blob = new Blob([lineas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `solicitante_${solicitante.documento_identidad}.txt`;
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
              Registro de{" "}
              <span style={{ color: palette.primary }}>Solicitantes</span>
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
            <Link href="/admin/modules/Adoption/Applicants/Form">
              <Button icon={<Plus size={16} />}>Nuevo Solicitante</Button>
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
            placeholder="Buscar por documento, nombre, email o teléfono..."
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
                  Cargando solicitantes...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  <tr>
                    <th className="px-4 py-3">Documento / Solicitante</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Vivienda</th>
                    <th className="px-4 py-3">Mascotas</th>
                    <th className="px-4 py-3">Solicitudes</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item: SolicitanteConConteo) => (
                    <tr
                      key={item.id_solicitante}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Avatar icono + Nombre y Documento */}
                      <td className="px-4 py-2.5 flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-500 shrink-0">
                          <User size={16} />
                        </span>
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.nombre} {item.apellido}
                          </p>
                          <p className="font-mono text-[10px] text-slate-400 font-semibold">
                            {item.documento_identidad}
                          </p>
                        </div>
                      </td>

                      {/* Contacto: Email y Teléfono */}
                      <td className="px-4 py-2.5 text-slate-600">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <Mail size={11} className="text-slate-400" />
                            {item.email}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Phone size={11} />
                            {item.telefono}
                          </span>
                        </div>
                      </td>

                      {/* Vivienda */}
                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        {item.tipo_vivienda ? (
                          <span className="inline-flex items-center gap-1">
                            <Home size={12} className="text-slate-400" />
                            {item.tipo_vivienda.replace("_", " ")}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Posee mascotas */}
                      <td className="px-4 py-2.5">
                        {item.tiene_mascotas ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <Dog size={11} />
                            Sí posee
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            No posee
                          </span>
                        )}
                      </td>

                      {/* Solicitudes asociadas */}
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            color: palette.primary,
                            backgroundColor: `${palette.primary}10`,
                            borderColor: `${palette.primary}30`,
                          }}
                        >
                          <FileText size={11} />
                          {item._count.solicitudes} registradas
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
                            title="Previsualizar solicitante"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Adoption/Applicants/Form?id=${item.id_solicitante}`}
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
                            disabled={eliminandoId === item.id_solicitante}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Eliminar registro"
                          >
                            {eliminandoId === item.id_solicitante ? (
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
                        No se encontraron solicitantes.
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

      {/* Modal de Previsualización de Solicitante */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <UserCheck size={18} style={{ color: palette.primary }} />
            Perfil del Solicitante
          </span>
        }
      >
        {solicitanteSeleccionado && (
          <div className="space-y-3 text-xs text-slate-600">
            {/* Header / Nombre + Documento */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-slate-200 text-slate-600 shadow-xs">
                <User size={22} />
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {solicitanteSeleccionado.nombre}{" "}
                  {solicitanteSeleccionado.apellido}
                </h3>
                <p className="font-mono text-[11px] text-slate-400">
                  DOC: {solicitanteSeleccionado.documento_identidad}
                </p>
              </div>
            </div>

            {/* Grid de Información Principal */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {solicitanteSeleccionado.email}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Teléfono
                </span>
                <p className="font-semibold text-slate-800">
                  {solicitanteSeleccionado.telefono}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Tipo de Vivienda
                </span>
                <p className="font-semibold text-slate-800">
                  {solicitanteSeleccionado.tipo_vivienda
                    ? solicitanteSeleccionado.tipo_vivienda.replace("_", " ")
                    : "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  ¿Tiene Mascotas?
                </span>
                <p className="font-semibold text-slate-800">
                  {solicitanteSeleccionado.tiene_mascotas ? "Sí" : "No"}
                </p>
              </div>
            </div>

            {/* Dirección */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Dirección Residencial
              </span>
              <p className="font-semibold text-slate-800">
                {solicitanteSeleccionado.direccion}
              </p>
            </div>

            {/* Total solicitudes e historia breve */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Resumen de Actividad
              </span>
              <p className="text-slate-700">
                <strong>Solicitudes realizadas:</strong>{" "}
                {solicitanteSeleccionado._count.solicitudes}
              </p>
              <p className="text-slate-700">
                <strong>Fecha de alta:</strong>{" "}
                {fechaCorta(solicitanteSeleccionado.creado_en)}
              </p>
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