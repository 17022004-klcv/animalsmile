"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import {
  actualizarSantuario,
  crearSantuario,
  obtenerSantuario,
} from "@/src/services/sanctuaries/sanctuary-client";
import type { SantuarioInput } from "@/src/types/santuario";
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
} from "lucide-react";

function FormularioSantuario() {
  const { palette } = useTheme();
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
      } else {
        await crearSantuario(payload);
      }
      router.push("/admin/modules/Sanctuaries/Sanctuaries");
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
              href="/admin/modules/Sanctuaries/Sanctuaries"
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
              <p className="text-xs text-slate-500">
                {modoEdicion
                  ? "Actualiza los datos de contacto y cobertura del santuario."
                  : "Ingresa los datos del santuario y el tipo de fauna que puede alojar."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          {cargandoSantuario ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando santuario...</span>
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
              {/* COLUMNA 1: IDENTIFICACIÓN */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Building2 size={15} style={{ color: palette.secondary }} />
                  <span>1. Identificación</span>
                </h2>

                <div>
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
                      onChange={(e) => setNombre(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div>
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
                      onChange={(e) => setContactoPrincipal(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    El nombre del santuario debe ser único dentro del sistema para
                    facilitar la identificación durante los traslados.
                  </p>
                </div>
              </div>

              {/* COLUMNA 2: CONTACTO */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Phone size={15} style={{ color: palette.secondary }} />
                  <span>2. Contacto</span>
                </h2>

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
                      onChange={(e) => setTelefono(e.target.value)}
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

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Estos datos se usan para coordinar traslados y dar seguimiento
                    a los animales enviados al santuario.
                  </p>
                </div>
              </div>

              {/* COLUMNA 3: UBICACIÓN Y COBERTURA */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <PawPrint size={15} style={{ color: palette.primary }} />
                  <span>3. Ubicación y Fauna</span>
                </h2>

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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Fauna Permitida
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej. Caninos, felinos, fauna silvestre..."
                    value={tipoFaunaPermitida}
                    onChange={(e) => setTipoFaunaPermitida(e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
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
