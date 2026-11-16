"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { obtenerSolicitantes } from "@/src/services/applicants/applicants-client";
import { obtenerAnimales } from "@/src/services/animals/animal-client";
import {
  actualizarSolicitud,
  crearSolicitud,
  obtenerSolicitud,
} from "@/src/services/solicitudes/solicitud-client";
import { formatearEstadoSolicitud } from "@/src/services/solicitudes/solicitud-format";
import {
  ESTADOS_SOLICITUD,
  type SolicitudInput,
} from "@/src/types/solicitud";
import type { SolicitanteConConteo } from "@/src/types/solicitantes";
import type { AnimalConRelaciones } from "@/src/types/animal";
import {
  ArrowLeft,
  Save,
  User,
  PawPrint,
  ClipboardList,
  Mail,
  Phone,
  MapPin,
  Dog,
  Loader2,
  AlertTriangle,
} from "lucide-react";

function FormularioSolicitud() {
  const { palette } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idSolicitud = searchParams.get("id");
  const modoEdicion = idSolicitud !== null;

  const [solicitantes, setSolicitantes] = useState<SolicitanteConConteo[]>([]);
  const [animales, setAnimales] = useState<AnimalConRelaciones[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [cargandoSolicitud, setCargandoSolicitud] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [idSolicitante, setIdSolicitante] = useState("");
  const [idAnimal, setIdAnimal] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [notasEvaluacion, setNotasEvaluacion] = useState("");

  useEffect(() => {
    let cancelado = false;

    Promise.all([obtenerSolicitantes(), obtenerAnimales()])
      .then(([listaSolicitantes, listaAnimales]) => {
        if (cancelado) return;
        setSolicitantes(listaSolicitantes);
        setAnimales(listaAnimales);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los solicitantes y animales.",
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
    if (!idSolicitud) return;
    let cancelado = false;

    obtenerSolicitud(idSolicitud)
      .then((s) => {
        if (cancelado) return;
        setIdSolicitante(s.id_solicitante);
        setIdAnimal(s.id_animal);
        setEstado(s.estado);
        setNotasEvaluacion(s.notas_evaluacion ?? "");
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar la solicitud.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoSolicitud(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idSolicitud]);

  const solicitanteSeleccionado = solicitantes.find(
    (s) => s.id_solicitante === idSolicitante,
  );
  const animalSeleccionado = animales.find((a) => a.id_animal === idAnimal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const payload: SolicitudInput = {
      id_solicitante: idSolicitante,
      id_animal: idAnimal,
      estado,
      notas_evaluacion: notasEvaluacion.trim() || null,
    };

    try {
      if (modoEdicion && idSolicitud) {
        await actualizarSolicitud(idSolicitud, payload);
      } else {
        await crearSolicitud(payload);
      }
      router.push("/admin/modules/Adoption/Applications");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el registro.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition";
  const cargando = cargandoCatalogos || cargandoSolicitud;

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      {/* Marco Contenedor Fijo (Sin Scroll de Pantalla) */}
      <form
        onSubmit={handleSubmit}
        className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/modules/Adoption/Applications"
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              title="Volver al listado"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800">
                {modoEdicion ? (
                  <>
                    Edición de{" "}
                    <span style={{ color: palette.primary }}>Solicitud</span>
                  </>
                ) : (
                  <>
                    Registro de{" "}
                    <span style={{ color: palette.primary }}>
                      Nueva Solicitud
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-500">
                {modoEdicion
                  ? "Actualiza el solicitante, el animal y la evaluación de la solicitud."
                  : "Selecciona el solicitante y el animal para registrar la solicitud de adopción."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mt-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* CONTENEDOR FIJO DIVIDIDO EN 3 COLUMNAS (SIN SCROLL) */}
        <div className="flex-1 min-h-0 my-4 overflow-hidden">
          {cargando ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">
                Cargando solicitud...
              </span>
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
              {/* COLUMNA 1: SOLICITANTE */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <User size={15} style={{ color: palette.secondary }} />
                  <span>1. Solicitante</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Solicitante *
                  </label>
                  <select
                    required
                    value={idSolicitante}
                    onChange={(e) => setIdSolicitante(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Selecciona un solicitante...</option>
                    {solicitantes.map((s) => (
                      <option key={s.id_solicitante} value={s.id_solicitante}>
                        {s.nombre} {s.apellido} — {s.documento_identidad}
                      </option>
                    ))}
                  </select>
                  {solicitantes.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      No hay solicitantes registrados.{" "}
                      <Link
                        href="/admin/modules/Adoption/Applicants/Form"
                        className="underline font-bold"
                        style={{ color: palette.primary }}
                      >
                        Registra uno primero
                      </Link>
                      .
                    </p>
                  )}
                </div>

                {solicitanteSeleccionado ? (
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">
                      {solicitanteSeleccionado.nombre}{" "}
                      {solicitanteSeleccionado.apellido}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400">
                      DOC: {solicitanteSeleccionado.documento_identidad}
                    </p>
                    <div className="space-y-1 text-slate-600">
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail size={11} className="text-slate-400 shrink-0" />
                        {solicitanteSeleccionado.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        {solicitanteSeleccionado.telefono}
                      </span>
                      <span className="flex items-start gap-1.5">
                        <MapPin size={11} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          {solicitanteSeleccionado.direccion}
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Dog size={11} className="text-slate-400 shrink-0" />
                        {solicitanteSeleccionado.tiene_mascotas
                          ? "Tiene mascotas"
                          : "Sin mascotas"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-[11px]">
                      Selecciona un solicitante para ver sus datos de contacto.
                    </p>
                  </div>
                )}
              </div>

              {/* COLUMNA 2: ANIMAL SOLICITADO */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <PawPrint size={15} style={{ color: palette.secondary }} />
                  <span>2. Animal Solicitado</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Animal *
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
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
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
                    <div className="space-y-1 text-[11px] text-slate-500">
                      <p>
                        <span className="font-semibold text-slate-600">
                          Especie:
                        </span>{" "}
                        {animalSeleccionado.especie?.nombre_comun ?? "—"}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-600">
                          Raza:
                        </span>{" "}
                        {animalSeleccionado.raza_variedad ?? "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-[11px]">
                      Selecciona un animal para ver su ficha resumida.
                    </p>
                  </div>
                )}
              </div>

              {/* COLUMNA 3: EVALUACIÓN */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ClipboardList size={15} style={{ color: palette.primary }} />
                  <span>3. Evaluación</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado de la Solicitud *
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className={inputClass}
                  >
                    {ESTADOS_SOLICITUD.map((valor) => (
                      <option key={valor} value={valor}>
                        {formatearEstadoSolicitud(valor)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Notas de Evaluación
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Observaciones, resultado de la entrevista, condiciones..."
                    value={notasEvaluacion}
                    onChange={(e) => setNotasEvaluacion(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    La fecha de la solicitud se registra automáticamente. El
                    estado puede actualizarse conforme avance la evaluación.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer del Formulario */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Campos marcados con (*) son obligatorios</span>
          <span className="font-semibold text-slate-600">
            Sistema AnimalSmile
          </span>
        </div>
      </form>
    </div>
  );
}

export default function SolicitudFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando formulario...</span>
        </div>
      }
    >
      <FormularioSolicitud />
    </Suspense>
  );
}
