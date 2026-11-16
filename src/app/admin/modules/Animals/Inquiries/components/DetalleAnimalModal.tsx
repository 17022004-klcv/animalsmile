"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { useTheme } from "@/src/context/ThemeContext";
import {
  obtenerAnimalConConsultas,
  obtenerCatalogos,
  eliminarConsulta,
} from "@/src/services/inquiries/inquiry-client";
import type {
  CatalogosMedicos,
  ConsultaConRelaciones,
  DetalleAnimalConsultas,
} from "@/src/services/inquiries/inquiry-validation";
import {
  clasesEstadoVacuna,
  clasesTipoConsulta,
  formatearAlcanceVacuna,
  formatearEstadoVacuna,
  formatearTipoConsulta,
} from "@/src/services/inquiries/inquiry-format";
import { fechaCorta } from "@/src/services/animals/animal-format";
import FormularioConsulta from "@/src/app/admin/modules/Animals/Inquiries/components/FormularioConsulta";
import {
  AlertTriangle,
  CalendarClock,
  Edit,
  Loader2,
  PawPrint,
  Pill,
  Plus,
  Syringe,
  Trash2,
} from "lucide-react";

interface DetalleAnimalModalProps {
  idAnimal: string | null;
  onClose: () => void;
  onActualizado: () => void;
}

export default function DetalleAnimalModal({
  idAnimal,
  onClose,
  onActualizado,
}: DetalleAnimalModalProps) {
  const { palette } = useTheme();

  const [detalle, setDetalle] = useState<DetalleAnimalConsultas | null>(null);
  const [catalogos, setCatalogos] = useState<CatalogosMedicos | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consultaEnEdicion, setConsultaEnEdicion] =
    useState<ConsultaConRelaciones | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!idAnimal) return;
    setCargando(true);
    setError(null);
    try {
      const [animal, catalogosMedicos] = await Promise.all([
        obtenerAnimalConConsultas(idAnimal),
        obtenerCatalogos(),
      ]);
      setDetalle(animal);
      setCatalogos(catalogosMedicos);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar la información del animal.",
      );
    } finally {
      setCargando(false);
    }
  }, [idAnimal]);

  useEffect(() => {
    if (!idAnimal) {
      setDetalle(null);
      setConsultaEnEdicion(null);
      setMostrarFormulario(true);
      return;
    }
    setConsultaEnEdicion(null);
    setMostrarFormulario(true);
    cargar();
  }, [idAnimal, cargar]);

  const handleGuardado = () => {
    setConsultaEnEdicion(null);
    setMostrarFormulario(false);
    cargar();
    onActualizado();
  };

  const handleEliminar = async (idConsulta: string) => {
    if (!window.confirm("¿Eliminar esta consulta del expediente?")) return;
    setEliminandoId(idConsulta);
    setError(null);
    try {
      await eliminarConsulta(idConsulta);
      await cargar();
      onActualizado();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la consulta.",
      );
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <Modal
      open={Boolean(idAnimal)}
      onClose={onClose}
      size="xl"
      title={
        <span className="flex items-center gap-2">
          <PawPrint size={18} style={{ color: palette.primary }} />
          Expediente de consultas
        </span>
      }
    >
      {cargando && !detalle ? (
        <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando expediente...</span>
        </div>
      ) : !detalle ? (
        <p className="text-xs text-slate-400 text-center py-8">
          No se encontró información del animal.
        </p>
      ) : (
        <div className="space-y-4 text-xs text-slate-600 max-h-[75vh] overflow-y-auto pr-1">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold">
              <AlertTriangle size={13} />
              {error}
            </div>
          )}

          {/* Encabezado del animal */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            {detalle.foto_principal ? (
              <img
                src={detalle.foto_principal}
                alt={detalle.nombre}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
              />
            ) : (
              <span className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 border-2 border-white shadow-xs text-slate-400">
                <PawPrint size={20} />
              </span>
            )}
            <div className="flex-1">
              <h3 className="font-bold text-sm text-slate-800">
                {detalle.nombre}
              </h3>
              <p className="font-mono text-[11px] text-slate-400">
                {detalle.codigo_identificador} · {detalle.especie.nombre_comun} ·{" "}
                {detalle.especie.taxonomia.nombre_clase}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">
                Expediente
              </p>
              <p className="font-mono text-[11px] text-slate-600">
                {detalle.expediente
                  ? detalle.expediente.id_expediente.slice(0, 8)
                  : "Sin expediente"}
              </p>
            </div>
          </div>

          {/* Plan de vacunas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Syringe size={12} /> Plan de vacunas
                {detalle.plan.vacunas.length > 0 && (
                  <span className="text-slate-400 normal-case tracking-normal font-medium">
                    ({detalle.plan.resumen.al_dia} al día ·{" "}
                    {detalle.plan.resumen.vencidas} vencidas ·{" "}
                    {detalle.plan.resumen.pendientes} pendientes)
                  </span>
                )}
              </span>
            </div>

            {detalle.plan.vacunas.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-3 border border-dashed border-slate-200 rounded-xl">
                No hay vacunas registradas para esta especie.
              </p>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
                    <tr>
                      <th className="px-3 py-2">Vacuna</th>
                      <th className="px-3 py-2">Alcance</th>
                      <th className="px-3 py-2">Última aplicación</th>
                      <th className="px-3 py-2">Próxima dosis</th>
                      <th className="px-3 py-2 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {detalle.plan.vacunas.map((vacuna) => (
                      <tr key={vacuna.id_vacuna} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2">
                          <span className="font-bold text-slate-700">
                            {vacuna.nombre}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {vacuna.dosis_recomendada ?? "Dosis por definir"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-500">
                          {formatearAlcanceVacuna(vacuna.alcance)}
                        </td>
                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                          {fechaCorta(vacuna.ultima_aplicacion)}
                        </td>
                        <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                          {fechaCorta(vacuna.proxima_dosis)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${clasesEstadoVacuna(
                              vacuna.estado,
                            )}`}
                          >
                            {formatearEstadoVacuna(vacuna.estado)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Historial de consultas */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <CalendarClock size={12} /> Consultas registradas (
              {detalle.consultas.length})
            </span>

            {detalle.consultas.length === 0 ? (
              <p className="text-[11px] text-slate-400 text-center py-3 border border-dashed border-slate-200 rounded-xl">
                Este animal todavía no tiene consultas registradas.
              </p>
            ) : (
              <div className="space-y-2">
                {detalle.consultas.map((consulta) => (
                  <div
                    key={consulta.id_consulta}
                    className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${clasesTipoConsulta(
                            consulta.tipo_consulta,
                          )}`}
                        >
                          {formatearTipoConsulta(consulta.tipo_consulta)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {fechaCorta(consulta.fecha_consulta)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setConsultaEnEdicion(consulta);
                            setMostrarFormulario(true);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Editar consulta"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleEliminar(consulta.id_consulta)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Eliminar consulta"
                        >
                          {eliminandoId === consulta.id_consulta ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-slate-700">{consulta.motivo}</p>

                    {consulta.enfermedad && (
                      <p className="text-slate-600">
                        <strong>Enfermedad:</strong> {consulta.enfermedad.nombre}
                        {consulta.enfermedad.requiere_aislamiento && (
                          <span className="ml-1 text-rose-600 font-semibold">
                            (requiere aislamiento)
                          </span>
                        )}
                      </p>
                    )}

                    {consulta.diagnostico && (
                      <p className="text-slate-600">
                        <strong>Diagnóstico:</strong> {consulta.diagnostico}
                      </p>
                    )}

                    {consulta.tratamiento && (
                      <p className="text-slate-600">
                        <strong>Tratamiento:</strong> {consulta.tratamiento}
                      </p>
                    )}

                    {consulta.vacunas.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {consulta.vacunas.map((vacuna) => (
                          <span
                            key={vacuna.id_aplicacion}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-600 border border-sky-200"
                          >
                            {vacuna.vacuna.nombre}
                          </span>
                        ))}
                      </div>
                    )}

                    {consulta.medicamentos.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {consulta.medicamentos.map((medicamento) => (
                          <span
                            key={medicamento.id_aplicacion}
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-200 flex items-center gap-1"
                          >
                            <Pill size={10} />
                            {medicamento.medicamento.nombre}
                            {medicamento.dosis
                              ? ` · ${medicamento.dosis}`
                              : ""}
                          </span>
                        ))}
                      </div>
                    )}

                    {consulta.proxima_cita && (
                      <p className="text-amber-600 font-semibold flex items-center gap-1">
                        <CalendarClock size={12} />
                        Próxima cita: {fechaCorta(consulta.proxima_cita)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario de consulta */}
          {catalogos && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Plus size={12} />
                  {consultaEnEdicion
                    ? "Editando consulta"
                    : "Registrar nueva consulta"}
                </span>

                {!mostrarFormulario && !consultaEnEdicion && (
                  <Button
                    variant="outline"
                    icon={<Plus size={13} />}
                    onClick={() => setMostrarFormulario(true)}
                  >
                    Nueva consulta
                  </Button>
                )}
              </div>

              {mostrarFormulario && (
                <FormularioConsulta
                  idAnimal={detalle.id_animal}
                  planVacunas={detalle.plan.vacunas}
                  medicamentos={catalogos.medicamentos}
                  enfermedades={catalogos.enfermedades}
                  consulta={consultaEnEdicion}
                  onGuardado={handleGuardado}
                  onCancelar={() => {
                    setConsultaEnEdicion(null);
                    setMostrarFormulario(false);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
