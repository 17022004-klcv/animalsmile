"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput, FilterBar } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import { formatearEstado, fechaCorta } from "@/src/services/animals/animal-format";
import { obtenerEspecies } from "@/src/services/classifications/classification-client";
import {
  obtenerExpedientes,
  obtenerExpediente,
  guardarExpediente,
  agregarHistorial,
  eliminarHistorial,
} from "@/src/services/medical/medical-client";
import type {
  ExpedienteConRelaciones,
  ExpedienteListado,
} from "@/src/services/medical/medical-validation";
import { ESTADOS_ANIMAL } from "@/src/types/animal";
import {
  Download,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  PawPrint,
  Loader2,
  AlertTriangle,
  Save,
  Plus,
  Trash2,
  Stethoscope,
  Syringe,
  CalendarClock,
  FileText,
} from "lucide-react";

const TIPOS_REGISTRO = [
  "Consulta General",
  "Vacunación",
  "Desparasitación",
  "Cirugía",
  "Tratamiento",
  "Examen",
  "Otro",
] as const;

export default function ExpedientesPage() {
  const { palette } = useTheme();

  const [expedientes, setExpedientes] = useState<ExpedienteListado[]>([]);
  const [especies, setEspecies] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] =
    useState<ExpedienteListado | null>(null);
  const [expedienteDetalle, setExpedienteDetalle] =
    useState<ExpedienteConRelaciones | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Formulario del expediente
  const [esterilizado, setEsterilizado] = useState(false);
  const [fechaEsterilizacion, setFechaEsterilizacion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Formulario de nueva entrada de historial
  const [tipoRegistro, setTipoRegistro] = useState<string>(TIPOS_REGISTRO[0]);
  const [descripcion, setDescripcion] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [proximaCita, setProximaCita] = useState("");
  const [guardandoHistorial, setGuardandoHistorial] = useState(false);

  const itemsPerPage = 10;

  const cargarExpedientes = async () => {
    try {
      const data = await obtenerExpedientes();
      setExpedientes(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los expedientes.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    Promise.all([obtenerExpedientes(), obtenerEspecies()])
      .then(([expedientesData, especiesData]) => {
        if (cancelado) return;
        setExpedientes(expedientesData);
        setEspecies(
          especiesData.map((e) => ({
            label: e.nombre_comun,
            value: String(e.id_especie),
          })),
        );
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los expedientes.",
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

  const estados = useMemo(
    () =>
      ESTADOS_ANIMAL.map((estado) => ({
        label: formatearEstado(estado),
        value: estado,
      })),
    [],
  );

  const limpiarFiltros = () => {
    setFiltroEspecie("");
    setFiltroEstado("");
    setFiltroDesde("");
    setFiltroHasta("");
    setCurrentPage(1);
  };

  const filteredData = expedientes.filter((item) => {
    if (filtroEspecie && String(item.especie.id_especie) !== filtroEspecie) {
      return false;
    }
    if (filtroEstado && item.estado !== filtroEstado) return false;

    if (filtroDesde || filtroHasta) {
      const iso = item.expediente_medico?.actualizado_en;
      if (!iso) return false;
      const fecha = new Date(iso).getTime();
      if (filtroDesde && fecha < new Date(filtroDesde).getTime()) return false;
      if (filtroHasta) {
        const hasta = new Date(filtroHasta);
        hasta.setHours(23, 59, 59, 999);
        if (fecha > hasta.getTime()) return false;
      }
    }

    const texto = searchTerm.toLowerCase();
    return (
      item.nombre.toLowerCase().includes(texto) ||
      item.codigo_identificador.toLowerCase().includes(texto) ||
      item.especie.nombre_comun.toLowerCase().includes(texto)
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const abrirDetalle = async (item: ExpedienteListado) => {
    setAnimalSeleccionado(item);
    setModalOpen(true);
    setCargandoDetalle(true);
    setError(null);
    try {
      const exp = await obtenerExpediente(item.id_animal);
      setExpedienteDetalle(exp);
      setEsterilizado(exp?.esterilizado ?? false);
      setFechaEsterilizacion(
        exp?.fecha_esterilizacion ? exp.fecha_esterilizacion.slice(0, 10) : "",
      );
      setObservaciones(exp?.observaciones_generales ?? "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar el expediente.",
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const limpiarFormHistorial = () => {
    setTipoRegistro(TIPOS_REGISTRO[0]);
    setDescripcion("");
    setDiagnostico("");
    setTratamiento("");
    setProximaCita("");
  };

  const handleGuardarExpediente = async () => {
    if (!animalSeleccionado) return;
    setGuardando(true);
    setError(null);
    try {
      const exp = await guardarExpediente(animalSeleccionado.id_animal, {
        esterilizado,
        fecha_esterilizacion: fechaEsterilizacion || null,
        observaciones_generales: observaciones || null,
      });
      setExpedienteDetalle((prev) =>
        prev
          ? { ...prev, ...exp }
          : { ...exp, historiales_clinicos: [] },
      );
      await cargarExpedientes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el expediente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarHistorial = async () => {
    if (!expedienteDetalle) return;
    if (!descripcion.trim()) {
      setError("La descripción de la consulta es obligatoria.");
      return;
    }
    setGuardandoHistorial(true);
    setError(null);
    try {
      await agregarHistorial(expedienteDetalle.id_expediente, {
        tipo_registro: tipoRegistro,
        descripcion,
        diagnostico: diagnostico || null,
        tratamiento: tratamiento || null,
        proxima_cita: proximaCita || null,
      });
      const exp = await obtenerExpediente(animalSeleccionado!.id_animal);
      setExpedienteDetalle(exp);
      limpiarFormHistorial();
      await cargarExpedientes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la entrada clínica.",
      );
    } finally {
      setGuardandoHistorial(false);
    }
  };

  const handleEliminarHistorial = async (id: string) => {
    if (!window.confirm("¿Eliminar esta entrada del historial clínico?")) return;
    setError(null);
    try {
      await eliminarHistorial(id);
      const exp = await obtenerExpediente(animalSeleccionado!.id_animal);
      setExpedienteDetalle(exp);
      await cargarExpedientes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el registro.",
      );
    }
  };

  const descargarFicha = (item: ExpedienteListado) => {
    const exp = item.expediente_medico;
    const lineas = [
      "EXPEDIENTE MÉDICO - AnimalSmile",
      "".padEnd(40, "="),
      `Código: ${item.codigo_identificador}`,
      `Nombre: ${item.nombre}`,
      `Especie: ${item.especie.nombre_comun}`,
      `Estado: ${formatearEstado(item.estado)}`,
      "",
      "-- Datos médicos --",
      `Esterilizado: ${exp?.esterilizado ? "Sí" : "No"}`,
      `Fecha esterilización: ${fechaCorta(
        exp?.fecha_esterilizacion ?? null,
      )}`,
      `Observaciones: ${exp?.observaciones_generales ?? "—"}`,
      `Entradas clínicas: ${exp?._count.historiales_clinicos ?? 0}`,
      `Última actualización: ${fechaCorta(exp?.actualizado_en ?? null)}`,
    ];

    const blob = new Blob([lineas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expediente_${item.codigo_identificador}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] transition";

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      {/* Marco Principal */}
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Expedientes{" "}
              <span style={{ color: palette.primary }}>Médicos</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/modules/Animals/Income">
              <Button variant="outline" icon={<PawPrint size={15} />}>
                Ir a Animales
              </Button>
            </Link>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="flex items-center gap-3 mt-4 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por código, nombre o especie..."
          />
        </div>

        {/* Filtros reutilizables */}
        <FilterBar
          especies={especies}
          estados={estados}
          especie={filtroEspecie}
          estado={filtroEstado}
          desde={filtroDesde}
          hasta={filtroHasta}
          onEspecieChange={(v) => {
            setFiltroEspecie(v);
            setCurrentPage(1);
          }}
          onEstadoChange={(v) => {
            setFiltroEstado(v);
            setCurrentPage(1);
          }}
          onDesdeChange={(v) => {
            setFiltroDesde(v);
            setCurrentPage(1);
          }}
          onHastaChange={(v) => {
            setFiltroHasta(v);
            setCurrentPage(1);
          }}
          onLimpiar={limpiarFiltros}
        />

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
                  Cargando expedientes...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  <tr>
                    <th className="px-4 py-3">Foto / Código</th>
                    <th className="px-4 py-3">Nombre</th>
                    <th className="px-4 py-3">Especie</th>
                    <th className="px-4 py-3">Esterilizado</th>
                    <th className="px-4 py-3">Entradas</th>
                    <th className="px-4 py-3">Próxima cita</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item) => {
                    const exp = item.expediente_medico;
                    const proxima = exp?.historiales_clinicos[0]?.proxima_cita;
                    return (
                      <tr
                        key={item.id_animal}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            {item.foto_principal ? (
                              <img
                                src={item.foto_principal}
                                alt={item.nombre}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                              />
                            ) : (
                              <span className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-400 shrink-0">
                                <PawPrint size={15} />
                              </span>
                            )}
                            <span className="font-mono font-bold text-slate-700">
                              {item.codigo_identificador}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-2.5 font-bold text-slate-800">
                          {item.nombre}
                        </td>

                        <td className="px-4 py-2.5 font-medium text-slate-600">
                          {item.especie.nombre_comun}
                        </td>

                        <td className="px-4 py-2.5">
                          {exp ? (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                exp.esterilizado
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {exp.esterilizado ? "Sí" : "No"}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                              Sin expediente
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2.5 font-medium text-slate-600">
                          {exp?._count.historiales_clinicos ?? 0}
                        </td>

                        <td className="px-4 py-2.5 font-medium text-slate-600 whitespace-nowrap">
                          {fechaCorta(proxima ?? null)}
                        </td>

                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => abrirDetalle(item)}
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
                              title="Ver / editar expediente"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() => abrirDetalle(item)}
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
                              title="Editar expediente"
                            >
                              <Edit size={15} />
                            </button>

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
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!cargando && paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-400 font-medium"
                      >
                        No se encontraron expedientes.
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

      {/* Modal de Expediente */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <Stethoscope size={18} style={{ color: palette.primary }} />
            Expediente Médico
          </span>
        }
      >
        {animalSeleccionado && (
          <div className="space-y-4 text-xs text-slate-600 max-h-[70vh] overflow-y-auto pr-1">
            {/* Encabezado animal */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              {animalSeleccionado.foto_principal ? (
                <img
                  src={animalSeleccionado.foto_principal}
                  alt={animalSeleccionado.nombre}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <span className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 border-2 border-white shadow-xs text-slate-400">
                  <PawPrint size={20} />
                </span>
              )}
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {animalSeleccionado.nombre}
                </h3>
                <p className="font-mono text-[11px] text-slate-400">
                  {animalSeleccionado.codigo_identificador} ·{" "}
                  {animalSeleccionado.especie.nombre_comun}
                </p>
              </div>
            </div>

            {cargandoDetalle ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-xs font-medium">
                  Cargando expediente...
                </span>
              </div>
            ) : (
              <>
                {/* Datos generales del expediente */}
                <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <FileText size={12} /> Datos generales
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={esterilizado}
                      onChange={(e) => setEsterilizado(e.target.checked)}
                      className="accent-[var(--color-primary)]"
                    />
                    <span className="font-semibold text-slate-700">
                      Esterilizado
                    </span>
                  </label>

                  {esterilizado && (
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Fecha de esterilización
                      </label>
                      <input
                        type="date"
                        value={fechaEsterilizacion}
                        onChange={(e) =>
                          setFechaEsterilizacion(e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Observaciones generales
                    </label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      rows={2}
                      placeholder="Observaciones médicas relevantes..."
                      className={inputClass}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      icon={
                        guardando ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Save size={14} />
                        )
                      }
                      onClick={handleGuardarExpediente}
                      disabled={guardando}
                    >
                      Guardar expediente
                    </Button>
                  </div>
                </div>

                {/* Historial clínico */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <CalendarClock size={12} /> Historial clínico (
                    {expedienteDetalle?.historiales_clinicos.length ?? 0})
                  </span>

                  {expedienteDetalle?.historiales_clinicos.length ? (
                    <div className="space-y-2">
                      {expedienteDetalle.historiales_clinicos.map((h) => (
                        <div
                          key={h.id_historial}
                          className="p-3 bg-white rounded-xl border border-slate-200 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full bg-[var(--color-primary)]">
                              {h.tipo_registro}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-medium">
                                {fechaCorta(h.fecha_consulta)}
                              </span>
                              <button
                                onClick={() =>
                                  handleEliminarHistorial(h.id_historial)
                                }
                                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                title="Eliminar entrada"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-700">{h.descripcion}</p>
                          {h.diagnostico && (
                            <p className="text-slate-600">
                              <strong>Diagnóstico:</strong> {h.diagnostico}
                            </p>
                          )}
                          {h.tratamiento && (
                            <p className="text-slate-600">
                              <strong>Tratamiento:</strong> {h.tratamiento}
                            </p>
                          )}
                          {h.proxima_cita && (
                            <p className="text-amber-600 font-semibold flex items-center gap-1">
                              <CalendarClock size={12} />
                              Próxima cita: {fechaCorta(h.proxima_cita)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-center py-3">
                      Sin entradas clínicas registradas.
                    </p>
                  )}
                </div>

                {/* Nueva entrada */}
                {expedienteDetalle ? (
                  <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Plus size={12} /> Nueva entrada clínica
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Tipo
                        </label>
                        <select
                          value={tipoRegistro}
                          onChange={(e) => setTipoRegistro(e.target.value)}
                          className={inputClass}
                        >
                          {TIPOS_REGISTRO.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Próxima cita
                        </label>
                        <input
                          type="date"
                          value={proximaCita}
                          onChange={(e) => setProximaCita(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Descripción *
                      </label>
                      <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        rows={2}
                        placeholder="Motivo de la consulta..."
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Diagnóstico
                        </label>
                        <input
                          type="text"
                          value={diagnostico}
                          onChange={(e) => setDiagnostico(e.target.value)}
                          placeholder="Opcional"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Tratamiento
                        </label>
                        <input
                          type="text"
                          value={tratamiento}
                          onChange={(e) => setTratamiento(e.target.value)}
                          placeholder="Opcional"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        icon={
                          guardandoHistorial ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Syringe size={14} />
                          )
                        }
                        onClick={handleAgregarHistorial}
                        disabled={guardandoHistorial}
                      >
                        Agregar entrada
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 text-center">
                    Guarda el expediente para poder agregar entradas clínicas.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
