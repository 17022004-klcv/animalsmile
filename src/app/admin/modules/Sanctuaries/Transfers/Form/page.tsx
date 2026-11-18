"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";
import { Button } from "@/src/components/ui/Button";
import { obtenerAnimales } from "@/src/services/animals/animal-client";
import {
  actualizarTraslado,
  crearTraslado,
  obtenerSantuarios,
  obtenerTraslado,
} from "@/src/services/sanctuaries/sanctuary-client";
import type { AnimalConRelaciones } from "@/src/types/animal";
import type { SantuarioConTraslados } from "@/src/types/santuario";
import type { TrasladoInput } from "@/src/types/traslado";
import { Validaciones } from "@/src/utils/validaciones";
import {
  ArrowLeft,
  Save,
  PawPrint,
  Building2,
  Truck,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

function FormularioTraslado() {
  const { palette } = useTheme();
  const { mostrarToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idTraslado = searchParams.get("id");
  const modoEdicion = idTraslado !== null;

  const [animales, setAnimales] = useState<AnimalConRelaciones[]>([]);
  const [santuarios, setSantuarios] = useState<SantuarioConTraslados[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [cargandoTraslado, setCargandoTraslado] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [idAnimal, setIdAnimal] = useState("");
  const [idSantuario, setIdSantuario] = useState("");
  const [fechaTraslado, setFechaTraslado] = useState("");
  const [motivo, setMotivo] = useState("");
  const [responsableTransporte, setResponsableTransporte] = useState("");
  const [estadoSalida, setEstadoSalida] = useState("");
  const [estadoLlegada, setEstadoLlegada] = useState("");

  useEffect(() => {
    let cancelado = false;

    Promise.all([obtenerAnimales(), obtenerSantuarios()])
      .then(([listaAnimales, listaSantuarios]) => {
        if (cancelado) return;
        setAnimales(listaAnimales);
        setSantuarios(listaSantuarios);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los animales y santuarios.",
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
    if (!idTraslado) return;
    let cancelado = false;

    obtenerTraslado(idTraslado)
      .then((t) => {
        if (cancelado) return;
        setIdAnimal(t.id_animal);
        setIdSantuario(t.id_santuario);
        setFechaTraslado(t.fecha_traslado.slice(0, 10));
        setMotivo(t.motivo);
        setResponsableTransporte(t.responsable_transporte ?? "");
        setEstadoSalida(t.estado_salida ?? "");
        setEstadoLlegada(t.estado_llegada ?? "");
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el traslado.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoTraslado(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idTraslado]);

  const animalSeleccionado = animales.find((a) => a.id_animal === idAnimal);
  const santuarioSeleccionado = santuarios.find(
    (s) => s.id_santuario === idSantuario,
  );

  const PASOS = [
    {
      id: "animal",
      titulo: "Animal",
      descripcion: "Selecciona el animal que será trasladado",
      icono: PawPrint,
    },
    {
      id: "santuario",
      titulo: "Santuario Destino",
      descripcion: "Selecciona el santuario que recibirá al animal",
      icono: Building2,
    },
    {
      id: "datos",
      titulo: "Datos del Traslado",
      descripcion: "Fecha, motivo, responsable y estados",
      icono: Truck,
    },
  ] as const;

  const [paso, setPaso] = useState(0);

  const validarPasoActual = (): boolean => {
    setError(null);

    if (paso === 0) {
      if (!idAnimal) {
        const mensaje = "Debes seleccionar un animal antes de continuar.";
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return false;
      }
    }

    if (paso === 1) {
      if (!idSantuario) {
        const mensaje = "Debes seleccionar un santuario antes de continuar.";
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return false;
      }
    }

    if (paso === 2) {
      if (!fechaTraslado) {
        const mensaje = "La fecha del traslado es obligatoria.";
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return false;
      }
      if (!motivo.trim()) {
        const mensaje = "El motivo del traslado es obligatorio.";
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return false;
      }

      const errResponsable = Validaciones.validarSoloLetras(
        responsableTransporte,
        "Responsable del Transporte",
        { requerido: false, maxLength: 100 },
      );
      if (errResponsable) {
        setError(errResponsable);
        mostrarToast(errResponsable, "error");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const payload: TrasladoInput = {
      id_animal: idAnimal,
      id_santuario: idSantuario,
      fecha_traslado: fechaTraslado,
      motivo: motivo.trim(),
      responsable_transporte: responsableTransporte.trim() || null,
      estado_salida: estadoSalida.trim() || null,
      estado_llegada: estadoLlegada.trim() || null,
    };

    try {
      if (modoEdicion && idTraslado) {
        await actualizarTraslado(idTraslado, payload);
        mostrarToast("Traslado actualizado correctamente.", "success");
      } else {
        await crearTraslado(payload);
        mostrarToast("Traslado registrado correctamente.", "success");
      }
      router.push("/admin/modules/Sanctuaries/Transfers");
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

  const inputClass =
    "w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition";
  const cargando = cargandoCatalogos || cargandoTraslado;

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <form
        onSubmit={handleFormSubmit}
        className="anim-fade-in h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-4 shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/modules/Sanctuaries/Transfers"
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
                    <span style={{ color: palette.primary }}>Traslado</span>
                  </>
                ) : (
                  <>
                    Registro de{" "}
                    <span style={{ color: palette.primary }}>
                      Nuevo Traslado
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {modoEdicion
                  ? "Actualiza el animal, el santuario destino y los datos del traslado."
                  : "Completa los pasos para registrar el traslado."}
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

        {/* Stepper horizontal con numeración y línea conectora */}
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

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mt-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Contenedor central con scroll interno */}
        <div className="flex-1 min-h-0 my-4 overflow-y-auto pr-1">
          {cargando ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando traslado...</span>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-5 py-1">
              {/* PASO 1: ANIMAL */}
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
                        Animal a trasladar
                      </h2>
                      <p className="text-xs text-slate-500">
                        Selecciona el animal que será trasladado al santuario
                        destino.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Animal a Trasladar *
                      </label>
                      <select
                        required
                        value={idAnimal}
                        onChange={(e) => setIdAnimal(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Selecciona un animal...</option>
                        {animales.map((a) => (
                          <option key={a.id_animal} value={a.id_animal}>
                            {a.nombre} — {a.codigo_identificador}
                          </option>
                        ))}
                      </select>
                      {animales.length === 0 && (
                        <p className="text-[11px] text-amber-600 mt-1 font-medium">
                          No hay animales registrados.{" "}
                          <Link
                            href="/admin/modules/Animals/Income/Form"
                            className="underline font-bold"
                            style={{ color: palette.primary }}
                          >
                            Registra uno primero
                          </Link>
                          .
                        </p>
                      )}
                    </div>

                    {animalSeleccionado ? (
                      <div className="anim-fade-up delay-4 space-y-2 p-4 bg-white rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-800">
                            {animalSeleccionado.nombre}
                          </p>
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              color: palette.primary,
                              backgroundColor: `${palette.primary}10`,
                              border: `1px solid ${palette.primary}30`,
                            }}
                          >
                            {animalSeleccionado.estado.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400">
                          {animalSeleccionado.codigo_identificador}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-600">
                            Especie:
                          </span>{" "}
                          {animalSeleccionado.especie?.nombre_comun ?? "—"}
                        </p>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[11px]">
                          Selecciona el animal que será trasladado.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* PASO 2: SANTUARIO DESTINO */}
              {paso === 1 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.primary}12`,
                        color: palette.primary,
                      }}
                    >
                      <Building2 size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Santuario destino
                      </h2>
                      <p className="text-xs text-slate-500">
                        Selecciona el santuario que recibirá al animal y revisa
                        sus datos de contacto.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 space-y-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Santuario *
                      </label>
                      <select
                        required
                        value={idSantuario}
                        onChange={(e) => setIdSantuario(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Selecciona un santuario...</option>
                        {santuarios.map((s) => (
                          <option key={s.id_santuario} value={s.id_santuario}>
                            {s.nombre}
                          </option>
                        ))}
                      </select>
                      {santuarios.length === 0 && (
                        <p className="text-[11px] text-amber-600 mt-1 font-medium">
                          No hay santuarios registrados.{" "}
                          <Link
                            href="/admin/modules/Sanctuaries/Sanctuaries/Form"
                            className="underline font-bold"
                            style={{ color: palette.primary }}
                          >
                            Registra uno primero
                          </Link>
                          .
                        </p>
                      )}
                    </div>

                    {santuarioSeleccionado ? (
                      <div className="anim-fade-up delay-4 space-y-2 p-4 bg-white rounded-xl border border-slate-200">
                        <p className="font-bold text-slate-800">
                          {santuarioSeleccionado.nombre}
                        </p>
                        <div className="space-y-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <User
                              size={11}
                              className="text-slate-400 shrink-0"
                            />
                            {santuarioSeleccionado.contacto_principal ?? "—"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Phone
                              size={11}
                              className="text-slate-400 shrink-0"
                            />
                            {santuarioSeleccionado.telefono ?? "—"}
                          </span>
                          <span className="flex items-center gap-1.5 truncate">
                            <Mail
                              size={11}
                              className="text-slate-400 shrink-0"
                            />
                            {santuarioSeleccionado.email ?? "—"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-[11px]">
                          Selecciona el santuario que recibirá al animal.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* PASO 3: DATOS DEL TRASLADO */}
              {paso === 2 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.dark}12`,
                        color: palette.dark,
                      }}
                    >
                      <Truck size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Datos del traslado
                      </h2>
                      <p className="text-xs text-slate-500">
                        Fecha, motivo, responsable del transporte y estados de
                        salida/llegada.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fecha *
                      </label>
                      <div className="relative">
                        <Calendar
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="date"
                          required
                          value={fechaTraslado}
                          onChange={(e) => setFechaTraslado(e.target.value)}
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Responsable
                      </label>
                      <input
                        type="text"
                        placeholder="Transportista"
                        value={responsableTransporte}
                        onChange={(e) =>
                          setResponsableTransporte(
                            Validaciones.formatearSoloLetras(
                              e.target.value,
                              100,
                            ),
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Motivo del Traslado *
                      </label>
                      <div className="relative">
                        <FileText
                          size={13}
                          className="absolute left-3 top-2.5 text-slate-400"
                        />
                        <textarea
                          rows={3}
                          required
                          placeholder="Motivo o justificación del traslado..."
                          value={motivo}
                          onChange={(e) => setMotivo(e.target.value)}
                          className={`${inputClass} pl-8 resize-none`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estado al Salir
                      </label>
                      <input
                        type="text"
                        placeholder="Buen estado"
                        value={estadoSalida}
                        onChange={(e) => setEstadoSalida(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estado al Llegar
                      </label>
                      <input
                        type="text"
                        placeholder="Sin novedad"
                        value={estadoLlegada}
                        onChange={(e) => setEstadoLlegada(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer de Navegación */}
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
                disabled={guardando || cargando}
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

export default function TrasladoFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando formulario...</span>
        </div>
      }
    >
      <FormularioTraslado />
    </Suspense>
  );
}
