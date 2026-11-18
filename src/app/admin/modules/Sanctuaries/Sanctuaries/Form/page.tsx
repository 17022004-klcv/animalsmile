"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";
import { Button } from "@/src/components/ui/Button";
import { SearchableSelect } from "@/src/components/ui/SearchableSelect";
import { TIPOS_FAUNA } from "@/src/utils/constants";
import {
  actualizarSantuario,
  crearSantuario,
  obtenerSantuario,
} from "@/src/services/sanctuaries/sanctuary-client";
import type { SantuarioInput } from "@/src/types/santuario";
import { Validaciones } from "@/src/utils/validaciones";
import {
  ArrowLeft,
  Save,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  PawPrint,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

function FormularioSantuario() {
  const { palette } = useTheme();
  const { mostrarToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idSantuario = searchParams.get("id");
  const modoEdicion = idSantuario !== null;

  const [cargandoSantuario, setCargandoSantuario] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [contactoPrincipal, setContactoPrincipal] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [tipoFaunaPermitida, setTipoFaunaPermitida] = useState("");

  useEffect(() => {
    if (!idSantuario) return;
    let cancelado = false;

    obtenerSantuario(idSantuario)
      .then((s) => {
        if (cancelado) return;
        setNombre(s.nombre);
        setContactoPrincipal(s.contacto_principal ?? "");
        setTelefono(s.telefono ?? "");
        setEmail(s.email ?? "");
        setDireccion(s.direccion ?? "");
        setTipoFaunaPermitida(s.tipo_fauna_permitida ?? "");
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el santuario.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoSantuario(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idSantuario]);

  const PASOS = [
    {
      id: "identificacion",
      titulo: "Identificación",
      descripcion: "Nombre y responsable del santuario",
      icono: Building2,
    },
    {
      id: "contacto",
      titulo: "Contacto",
      descripcion: "Teléfono y correo electrónico",
      icono: Phone,
    },
    {
      id: "ubicacion",
      titulo: "Ubicación y Fauna",
      descripcion: "Dirección y tipo de fauna permitida",
      icono: PawPrint,
    },
  ] as const;

  const [paso, setPaso] = useState(0);

  const validarPasoActual = (): boolean => {
    setError(null);

    if (paso === 0) {
      const errNombre = Validaciones.validarSoloLetras(
        nombre,
        "Nombre del Santuario",
        { requerido: true, maxLength: 100 },
      );
      if (errNombre) {
        setError(errNombre);
        mostrarToast(errNombre, "error");
        return false;
      }

      const errContacto = Validaciones.validarSoloLetras(
        contactoPrincipal,
        "Contacto Principal",
        { requerido: false, maxLength: 100 },
      );
      if (errContacto) {
        setError(errContacto);
        mostrarToast(errContacto, "error");
        return false;
      }
    }

    if (paso === 1) {
      const errTelefono = Validaciones.validarTelefono(telefono, false);
      if (errTelefono) {
        setError(errTelefono);
        mostrarToast(errTelefono, "error");
        return false;
      }

      if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        const mensaje = "Ingresa un correo electrónico válido.";
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

    const payload: SantuarioInput = {
      nombre: nombre.trim(),
      contacto_principal: contactoPrincipal.trim() || null,
      telefono: telefono.trim() || null,
      email: email.trim() || null,
      direccion: direccion.trim() || null,
      tipo_fauna_permitida: tipoFaunaPermitida.trim() || null,
    };

    try {
      if (modoEdicion && idSantuario) {
        await actualizarSantuario(idSantuario, payload);
        mostrarToast("Santuario actualizado correctamente.", "success");
      } else {
        await crearSantuario(payload);
        mostrarToast("Santuario registrado correctamente.", "success");
      }
      router.push("/admin/modules/Sanctuaries/Sanctuaries");
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
              href="/admin/modules/Sanctuaries/Sanctuaries"
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
                    <span style={{ color: palette.primary }}>Santuario</span>
                  </>
                ) : (
                  <>
                    Registro de{" "}
                    <span style={{ color: palette.primary }}>
                      Nuevo Santuario
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {modoEdicion
                  ? "Actualiza los datos de contacto y cobertura del santuario."
                  : "Completa los pasos para registrar el santuario."}
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
          {cargandoSantuario ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando santuario...</span>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-5 py-1">
              {/* PASO 1: IDENTIFICACIÓN */}
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
                      <Building2 size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Identificación del santuario
                      </h2>
                      <p className="text-xs text-slate-500">
                        Registra el nombre único del santuario y el responsable
                        principal.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre del Santuario *
                      </label>
                      <div className="relative">
                        <Building2
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Ej. Santuario San Salvador"
                          value={nombre}
                          onChange={(e) =>
                            setNombre(
                              Validaciones.formatearSoloLetras(
                                e.target.value,
                                100,
                              ),
                            )
                          }
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Contacto Principal
                      </label>
                      <div className="relative">
                        <User
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          placeholder="Nombre de la persona responsable"
                          value={contactoPrincipal}
                          onChange={(e) =>
                            setContactoPrincipal(
                              Validaciones.formatearSoloLetras(
                                e.target.value,
                                100,
                              ),
                            )
                          }
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div className="anim-fade-up delay-4 sm:col-span-2 p-3 bg-white rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        El nombre del santuario debe ser único dentro del
                        sistema para facilitar la identificación durante los
                        traslados.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* PASO 2: CONTACTO */}
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
                      <Phone size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Datos de contacto
                      </h2>
                      <p className="text-xs text-slate-500">
                        Teléfono y correo electrónico para coordinar traslados y
                        seguimiento.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="tel"
                          placeholder="+503 7000-0000"
                          value={telefono}
                          onChange={(e) =>
                            setTelefono(
                              Validaciones.formatearTelefono(e.target.value),
                            )
                          }
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="email"
                          placeholder="contacto@santuario.org"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div className="anim-fade-up delay-4 sm:col-span-2 p-3 bg-white rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Estos datos se usan para coordinar traslados y dar
                        seguimiento a los animales enviados al santuario.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* PASO 3: UBICACIÓN Y FAUNA */}
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
                      <PawPrint size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Ubicación y fauna permitida
                      </h2>
                      <p className="text-xs text-slate-500">
                        Dirección física del santuario y tipo de fauna que puede
                        alojar.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dirección
                      </label>
                      <div className="relative">
                        <MapPin
                          size={13}
                          className="absolute left-3 top-2.5 text-slate-400"
                        />
                        <textarea
                          rows={2}
                          placeholder="Calle, colonia, municipio..."
                          value={direccion}
                          onChange={(e) => setDireccion(e.target.value)}
                          className={`${inputClass} pl-8 resize-none`}
                        />
                      </div>
                    </div>

                    <div>
                      <SearchableSelect
                        label="Tipo de Fauna Permitida"
                        options={TIPOS_FAUNA}
                        value={tipoFaunaPermitida}
                        onChange={(val) => setTipoFaunaPermitida(String(val))}
                        placeholder="Selecciona el tipo de fauna..."
                        searchPlaceholder="Buscar fauna..."
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
                disabled={cargandoSantuario}
                icon={<ChevronRight size={15} />}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={guardando || cargandoSantuario}
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

export default function SantuarioFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando formulario...</span>
        </div>
      }
    >
      <FormularioSantuario />
    </Suspense>
  );
}
