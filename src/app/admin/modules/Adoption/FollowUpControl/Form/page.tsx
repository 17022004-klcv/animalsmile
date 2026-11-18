"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";
import { Button } from "@/src/components/ui/Button";
import { subirArchivos } from "@/src/services/animals/animal-client";
import {
  actualizarProgramacionSeguimiento,
  crearSeguimiento,
  obtenerAdopciones,
  obtenerSeguimiento,
  registrarResultadoSeguimiento,
} from "@/src/services/adoptions/adoption-client";
import {
  fechaCorta,
  formatearEstadoSolicitud,
} from "@/src/services/solicitudes/solicitud-format";
import type {
  SeguimientoInput,
  SeguimientoProgramacionParcial,
  SeguimientoResultadoInput,
} from "@/src/types/adopcion";
import {
  ArrowLeft,
  Save,
  CalendarDays,
  PawPrint,
  User,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  ExternalLink,
  ClipboardCheck,
  X,
} from "lucide-react";

const hoyISO = () => new Date().toISOString().slice(0, 10);

type AdopcionOpcion = {
  id_adopcion: string;
  fecha_adopcion: string;
  solicitud: {
    estado: string;
    solicitante: {
      nombre: string;
      apellido: string;
      documento_identidad: string;
    };
    animal: { nombre: string; codigo_identificador: string };
  };
};

type Paso = {
  id: string;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
};

function FormularioSeguimiento() {
  const { palette } = useTheme();
  const { mostrarToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idSeguimiento = searchParams.get("id");
  const idAdopcionParam = searchParams.get("adopcion");
  const modoEdicion = idSeguimiento !== null;
  const archivoRef = useRef<HTMLInputElement>(null);

  const [adopciones, setAdopciones] = useState<AdopcionOpcion[]>([]);
  const [adopcionEdicion, setAdopcionEdicion] =
    useState<AdopcionOpcion | null>(null);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [cargandoSeguimiento, setCargandoSeguimiento] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [idAdopcion, setIdAdopcion] = useState(idAdopcionParam ?? "");
  const [numMes, setNumMes] = useState("1");
  const [fechaProgramada, setFechaProgramada] = useState("");

  const [fechaRealizada, setFechaRealizada] = useState("");
  const [estadoEvaluacion, setEstadoEvaluacion] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [evidencias, setEvidencias] = useState<string[]>([]);

  useEffect(() => {
    let cancelado = false;
    obtenerAdopciones()
      .then((data) => {
        if (cancelado) return;
        setAdopciones(data);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las adopciones.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoCatalogos(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    if (!idSeguimiento) return;
    let cancelado = false;

    obtenerSeguimiento(idSeguimiento)
      .then((seguimiento) => {
        if (cancelado) return;
        setAdopcionEdicion(seguimiento.adopcion);
        setIdAdopcion(seguimiento.id_adopcion);
        setNumMes(String(seguimiento.num_mes));
        setFechaProgramada(seguimiento.fecha_programada.slice(0, 10));
        setFechaRealizada(
          seguimiento.fecha_realizada
            ? seguimiento.fecha_realizada.slice(0, 10)
            : hoyISO(),
        );
        setEstadoEvaluacion(seguimiento.estado_evaluacion ?? "");
        setObservaciones(seguimiento.observaciones ?? "");
        setEvidencias(seguimiento.evidencias_fotos ?? []);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el seguimiento.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoSeguimiento(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idSeguimiento]);

  const adopcionSeleccionada = modoEdicion
    ? adopcionEdicion
    : adopciones.find((a) => a.id_adopcion === idAdopcion);

  const PASOS: Paso[] = [
    {
      id: "adopcion",
      titulo: "Adopción",
      descripcion: "Selecciona la adopción que será evaluada",
      icono: PawPrint,
    },
    {
      id: "programacion",
      titulo: "Programación",
      descripcion: "Indica el mes y la fecha del seguimiento",
      icono: CalendarDays,
    },
    ...(modoEdicion
      ? [
          {
            id: "resultado",
            titulo: "Resultado",
            descripcion: "Registra la evaluación y las evidencias",
            icono: ClipboardCheck,
          },
        ]
      : []),
  ];

  const [paso, setPaso] = useState(0);

  const validarPasoActual = (): boolean => {
    setError(null);

    if (paso === 0 && !idAdopcion) {
      const mensaje = "Debes seleccionar una adopción antes de continuar.";
      setError(mensaje);
      mostrarToast(mensaje, "error");
      return false;
    }

    if (paso === 1) {
      const mes = Number(numMes);
      if (!Number.isInteger(mes) || mes < 1) {
        const mensaje = "El mes debe ser un número entero positivo.";
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const fechaProgramadaFinal = fechaProgramada || hoyISO();

    try {
      if (modoEdicion && idSeguimiento) {
        const programacion: SeguimientoProgramacionParcial = {
          num_mes: Number(numMes),
          fecha_programada: fechaProgramadaFinal,
        };
        await actualizarProgramacionSeguimiento(idSeguimiento, programacion);

        const tieneResultado =
          Boolean(estadoEvaluacion.trim()) ||
          Boolean(observaciones.trim()) ||
          evidencias.length > 0 ||
          Boolean(fechaRealizada);

        if (tieneResultado) {
          const resultado: SeguimientoResultadoInput = {
            fecha_realizada: fechaRealizada || hoyISO(),
            estado_evaluacion: estadoEvaluacion.trim() || null,
            observaciones: observaciones.trim() || null,
            evidencias_fotos: evidencias.length ? evidencias : null,
          };
          await registrarResultadoSeguimiento(idSeguimiento, resultado);
          mostrarToast(
            "Seguimiento actualizado y resultado registrado correctamente.",
            "success",
          );
        } else {
          mostrarToast(
            "Programación de seguimiento actualizada correctamente.",
            "success",
          );
        }
      } else {
        const payload: SeguimientoInput = {
          id_adopcion: idAdopcion,
          num_mes: Number(numMes),
          fecha_programada: fechaProgramadaFinal,
        };
        await crearSeguimiento(payload);
        mostrarToast("Seguimiento programado correctamente.", "success");
      }
      router.push("/admin/modules/Adoption/FollowUpControl");
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo guardar el registro.";
      setError(mensaje);
      mostrarToast(mensaje, "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (paso < PASOS.length - 1) {
      e.preventDefault();
      if (validarPasoActual()) {
        setPaso((prev) => prev + 1);
      }
      return;
    }

    if (!validarPasoActual()) {
      e.preventDefault();
      return;
    }

    handleSubmit(e);
  };

  const irAPaso = (indice: number) => {
    if (indice <= paso || modoEdicion) {
      setError(null);
      setPaso(indice);
    }
  };

  const retrocederPaso = () => {
    setError(null);
    setPaso((prev) => Math.max(0, prev - 1));
  };

  const handleArchivos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(e.target.files ?? []);
    if (archivos.length === 0) return;

    setSubiendo(true);
    setError(null);
    try {
      const urls = await subirArchivos(archivos);
      setEvidencias((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron subir las fotos.",
      );
    } finally {
      setSubiendo(false);
      if (archivoRef.current) archivoRef.current.value = "";
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition";
  const textareaClass = `${inputClass} min-h-[100px] resize-y leading-relaxed`;
  const cargando = cargandoCatalogos || cargandoSeguimiento;

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <form
        onSubmit={handleFormSubmit}
        className="anim-fade-in h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/modules/Adoption/FollowUpControl"
              className="anim-press p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition shrink-0"
              title="Volver al listado"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-800 truncate">
                {modoEdicion ? (
                  <>
                    Edición de{" "}
                    <span style={{ color: palette.primary }}>Seguimiento</span>
                  </>
                ) : (
                  <>
                    Registro de{" "}
                    <span style={{ color: palette.primary }}>
                      Nuevo Seguimiento
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {modoEdicion
                  ? "Actualiza la programación y registra el resultado de la evaluación."
                  : "Completa los pasos para programar un seguimiento post adopción."}
              </p>
            </div>
          </div>

          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
            style={{
              color: palette.primary,
              backgroundColor: `${palette.primary}10`,
              border: `1px solid ${palette.primary}30`,
            }}
          >
            Paso {paso + 1} de {PASOS.length}
          </span>
        </div>

        <div className="anim-fade-up delay-1 shrink-0 pt-5">
          <ol className="flex items-center gap-2 sm:gap-3">
            {PASOS.map((p, indice) => {
              const activo = indice === paso;
              const completado = indice < paso;
              const habilitado = indice <= paso || modoEdicion;
              const Icono = p.icono;

              return (
                <li
                  key={p.id}
                  className="flex items-center gap-2 sm:gap-3 flex-1 last:flex-none min-w-0"
                >
                  <button
                    type="button"
                    onClick={() => irAPaso(indice)}
                    disabled={!habilitado}
                    aria-current={activo ? "step" : undefined}
                    className={`anim-press flex items-center gap-2.5 rounded-2xl px-1.5 py-1.5 transition text-left min-w-0 ${
                      habilitado
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center border text-xs font-black shrink-0 transition"
                      style={{
                        backgroundColor:
                          completado || activo ? palette.primary : "#ffffff",
                        borderColor:
                          completado || activo ? palette.primary : "#e2e8f0",
                        color: completado || activo ? "#ffffff" : "#94a3b8",
                      }}
                    >
                      {completado ? <Check size={15} /> : <Icono size={15} />}
                    </span>
                    <span className="hidden sm:block min-w-0">
                      <span
                        className="block text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: activo ? palette.primary : "#94a3b8",
                        }}
                      >
                        Paso {indice + 1}
                      </span>
                      <span
                        className={`block text-xs font-bold truncate ${
                          activo ? "text-slate-800" : "text-slate-500"
                        }`}
                      >
                        {p.titulo}
                      </span>
                    </span>
                  </button>

                  {indice < PASOS.length - 1 && (
                    <span
                      className="flex-1 h-0.5 rounded-full transition-colors"
                      style={{
                        backgroundColor: completado
                          ? palette.primary
                          : "#e2e8f0",
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mt-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 my-4 overflow-y-auto pr-1">
          {cargando ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando seguimiento...</span>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-5 py-1">
              {paso === 0 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.secondary}12`,
                        color: palette.secondary,
                      }}
                    >
                      <PawPrint size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Adopción a evaluar
                      </h2>
                      <p className="text-xs text-slate-500">
                        Selecciona la adopción a la que pertenecerá este
                        seguimiento.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Adopción *
                      </label>
                      <select
                        required
                        disabled={modoEdicion}
                        value={idAdopcion}
                        onChange={(e) => setIdAdopcion(e.target.value)}
                        className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-500`}
                      >
                        <option value="">
                          {modoEdicion
                            ? "Adopción del seguimiento"
                            : "Selecciona una adopción..."}
                        </option>
                        {!modoEdicion &&
                          adopciones.map((a) => (
                            <option key={a.id_adopcion} value={a.id_adopcion}>
                              {a.solicitud.solicitante.nombre}{" "}
                              {a.solicitud.solicitante.apellido} —{" "}
                              {a.solicitud.animal.nombre} (
                              {a.solicitud.animal.codigo_identificador})
                            </option>
                          ))}
                      </select>
                      {!modoEdicion && adopciones.length === 0 && (
                        <p className="text-[11px] text-amber-600 mt-1 font-medium">
                          No hay adopciones registradas. Crea un contrato de
                          adopción primero.
                        </p>
                      )}
                    </div>

                    {adopcionSeleccionada ? (
                      <div className="anim-fade-up delay-4 space-y-3 p-4 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-start justify-between gap-2">
                          <p className="flex items-center gap-2 font-bold text-slate-800">
                            <User size={14} className="text-slate-400" />
                            {adopcionSeleccionada.solicitud.solicitante.nombre}{" "}
                            {adopcionSeleccionada.solicitud.solicitante.apellido}
                          </p>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            {formatearEstadoSolicitud(
                              adopcionSeleccionada.solicitud.estado,
                            )}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400">
                          DOC:{" "}
                          {
                            adopcionSeleccionada.solicitud.solicitante
                              .documento_identidad
                          }
                        </p>
                        <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-xl">
                          <span className="flex items-center gap-2 font-bold text-slate-800">
                            <PawPrint size={14} className="text-slate-400" />
                            {adopcionSeleccionada.solicitud.animal.nombre}
                            <span className="font-mono text-[10px] font-normal text-slate-500">
                              {
                                adopcionSeleccionada.solicitud.animal
                                  .codigo_identificador
                              }
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Adoptado el{" "}
                            {fechaCorta(adopcionSeleccionada.fecha_adopcion)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="anim-fade-up delay-4 p-6 text-center text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[11px]">
                          Selecciona una adopción para ver el adoptante y el
                          animal.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {paso === 1 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.dark}12`,
                        color: palette.dark,
                      }}
                    >
                      <CalendarDays size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Programación del seguimiento
                      </h2>
                      <p className="text-xs text-slate-500">
                        Define el mes posterior a la adopción y la fecha en que
                        se realizará la evaluación.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Mes de seguimiento *
                        </label>
                        <input
                          type="number"
                          min={1}
                          required
                          value={numMes}
                          onChange={(e) => setNumMes(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Fecha programada
                        </label>
                        <input
                          type="date"
                          value={fechaProgramada}
                          onChange={(e) => setFechaProgramada(e.target.value)}
                          className={inputClass}
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Si se deja vacío, se usará la fecha actual.
                        </p>
                      </div>
                    </div>

                    <div className="anim-fade-up delay-4 p-3 bg-white rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Los seguimientos permiten verificar el bienestar del
                        animal y el cumplimiento del contrato durante los meses
                        posteriores a la adopción.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {paso === 2 && modoEdicion && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.secondary}12`,
                        color: palette.secondary,
                      }}
                    >
                      <ClipboardCheck size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Resultado de la evaluación
                      </h2>
                      <p className="text-xs text-slate-500">
                        Registra la fecha real, el estado y las evidencias del
                        seguimiento realizado.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 space-y-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Fecha de realización
                        </label>
                        <input
                          type="date"
                          value={fechaRealizada}
                          onChange={(e) => setFechaRealizada(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Estado de evaluación
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Satisfactorio, requiere seguimiento..."
                          value={estadoEvaluacion}
                          onChange={(e) => setEstadoEvaluacion(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Observaciones
                      </label>
                      <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Describe el estado del animal, la vivienda y cualquier novedad relevante."
                        className={textareaClass}
                      />
                    </div>

                    <div className="anim-fade-up delay-4 p-4 bg-white rounded-xl border border-slate-200">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <Upload size={14} style={{ color: palette.primary }} />
                        {subiendo
                          ? "Subiendo evidencias..."
                          : "Adjuntar evidencias fotográficas"}
                      </label>
                      <input
                        ref={archivoRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                        onChange={handleArchivos}
                        disabled={subiendo}
                        className="mt-2 block w-full text-[11px] text-slate-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:text-white disabled:opacity-50"
                        style={{ backgroundColor: "transparent" }}
                      />
                      {subiendo && (
                        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Loader2 size={12} className="animate-spin" />
                          Procesando archivos...
                        </p>
                      )}

                      {evidencias.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {evidencias.map((url) => (
                            <div
                              key={url}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                            >
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold hover:underline"
                                style={{ color: palette.primary }}
                              >
                                <ExternalLink size={11} />
                                Evidencia
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  setEvidencias((prev) =>
                                    prev.filter((u) => u !== url),
                                  )
                                }
                                className="text-slate-400 hover:text-red-600 transition"
                                title="Quitar evidencia"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="anim-fade-up delay-4 p-3 bg-white rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Guardar con los campos de resultado vacíos conservará la
                        programación sin marcar el seguimiento como realizado.
                      </p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:block">
            {paso === 0
              ? "Los campos marcados con (*) son obligatorios."
              : `Paso ${paso + 1} de ${PASOS.length} · ${PASOS[paso].descripcion}`}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {paso > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={retrocederPaso}
                disabled={guardando}
                icon={<ChevronLeft size={15} />}
              >
                Anterior
              </Button>
            )}

            {paso < PASOS.length - 1 ? (
              <Button
                type="submit"
                disabled={cargando}
                icon={<ChevronRight size={15} />}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={guardando || cargando || subiendo}
                icon={
                  guardando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )
                }
              >
                {modoEdicion ? "Guardar Cambios" : "Guardar Registro"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function SeguimientoFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando formulario...</span>
        </div>
      }
    >
      <FormularioSeguimiento />
    </Suspense>
  );
}
