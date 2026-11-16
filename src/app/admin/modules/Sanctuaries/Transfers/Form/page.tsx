"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
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
} from "lucide-react";

function FormularioTraslado() {
  const { palette } = useTheme();
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
      } else {
        await crearTraslado(payload);
      }
      router.push("/admin/modules/Sanctuaries/Transfers");
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
  const cargando = cargandoCatalogos || cargandoTraslado;

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
              href="/admin/modules/Sanctuaries/Transfers"
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
              <p className="text-xs text-slate-500">
                {modoEdicion
                  ? "Actualiza el animal, el santuario destino y los datos del traslado."
                  : "Registra el animal que será trasladado y el santuario de destino."}
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
              <span className="text-xs font-medium">Cargando traslado...</span>
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
              {/* COLUMNA 1: ANIMAL */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <PawPrint size={15} style={{ color: palette.secondary }} />
                  <span>1. Animal</span>
                </h2>

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
                    <p className="text-[11px] text-slate-500">
                      <span className="font-semibold text-slate-600">
                        Especie:
                      </span>{" "}
                      {animalSeleccionado.especie?.nombre_comun ?? "—"}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-[11px]">
                      Selecciona el animal que será trasladado.
                    </p>
                  </div>
                )}
              </div>

              {/* COLUMNA 2: SANTUARIO DESTINO */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Building2 size={15} style={{ color: palette.secondary }} />
                  <span>2. Santuario Destino</span>
                </h2>

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
                  <div className="space-y-2 p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">
                      {santuarioSeleccionado.nombre}
                    </p>
                    <div className="space-y-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <User size={11} className="text-slate-400 shrink-0" />
                        {santuarioSeleccionado.contacto_principal ?? "—"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone size={11} className="text-slate-400 shrink-0" />
                        {santuarioSeleccionado.telefono ?? "—"}
                      </span>
                      <span className="flex items-center gap-1.5 truncate">
                        <Mail size={11} className="text-slate-400 shrink-0" />
                        {santuarioSeleccionado.email ?? "—"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-[11px]">
                      Selecciona el santuario que recibirá al animal.
                    </p>
                  </div>
                )}
              </div>

              {/* COLUMNA 3: DATOS DEL TRASLADO */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Truck size={15} style={{ color: palette.primary }} />
                  <span>3. Datos del Traslado</span>
                </h2>

                <div className="grid grid-cols-2 gap-3">
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
                      onChange={(e) => setResponsableTransporte(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Motivo del Traslado *
                  </label>
                  <div className="relative">
                    <FileText
                      size={13}
                      className="absolute left-3 top-2.5 text-slate-400"
                    />
                    <textarea
                      rows={2}
                      required
                      placeholder="Motivo o justificación del traslado..."
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      className={`${inputClass} pl-8 resize-none`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
