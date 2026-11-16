"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import {
  actualizarSolicitante,
  crearSolicitante,
  obtenerSolicitante,
} from "@/src/services/applicants/applicants-client";
import { TIPOS_VIVIENDA, type SolicitanteInput } from "@/src/types/solicitantes";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Home,
  Phone,
  MapPin,
  Dog,
  Loader2,
  AlertTriangle,
} from "lucide-react";

function FormularioSolicitante() {
  const { palette } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idSolicitante = searchParams.get("id");
  const modoEdicion = idSolicitante !== null;

  const [cargandoSolicitante, setCargandoSolicitante] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documentoIdentidad, setDocumentoIdentidad] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [tipoVivienda, setTipoVivienda] = useState("");
  const [tieneMascotas, setTieneMascotas] = useState(false);

  useEffect(() => {
    if (!idSolicitante) return;
    let cancelado = false;

    obtenerSolicitante(idSolicitante)
      .then((s) => {
        if (cancelado) return;
        setDocumentoIdentidad(s.documento_identidad);
        setNombre(s.nombre);
        setApellido(s.apellido);
        setEmail(s.email);
        setTelefono(s.telefono);
        setDireccion(s.direccion);
        setTipoVivienda(s.tipo_vivienda ?? "");
        setTieneMascotas(s.tiene_mascotas ?? false);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el solicitante.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoSolicitante(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idSolicitante]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const payload: SolicitanteInput = {
      documento_identidad: documentoIdentidad.trim(),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      email: email.trim(),
      telefono: telefono.trim(),
      direccion: direccion.trim(),
      tipo_vivienda: tipoVivienda || null,
      tiene_mascotas: tieneMascotas,
    };

    try {
      if (modoEdicion && idSolicitante) {
        await actualizarSolicitante(idSolicitante, payload);
      } else {
        await crearSolicitante(payload);
      }
      router.push("/admin/modules/Adoption/Applicants");
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
              href="/admin/modules/Adoption/Applicants"
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
                    <span style={{ color: palette.primary }}>Solicitante</span>
                  </>
                ) : (
                  <>
                    Registro de{" "}
                    <span style={{ color: palette.primary }}>
                      Nuevo Solicitante
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-500">
                {modoEdicion
                  ? "Actualiza los datos personales y de contacto del solicitante."
                  : "Ingresa los datos personales, de contacto y vivienda del solicitante."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={guardando || cargandoSolicitante}
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
          {cargandoSolicitante ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">
                Cargando solicitante...
              </span>
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
              {/* COLUMNA 1: IDENTIFICACIÓN PERSONAL */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <User size={15} style={{ color: palette.secondary }} />
                  <span>1. Identificación</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Documento de Identidad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 01234567-8"
                    value={documentoIdentidad}
                    onChange={(e) => setDocumentoIdentidad(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. María"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. López"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* COLUMNA 2: CONTACTO Y RESIDENCIA */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Mail size={15} style={{ color: palette.secondary }} />
                  <span>2. Contacto y Residencia</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="+503 7000-0000"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección Residencial *
                  </label>
                  <div className="relative">
                    <MapPin
                      size={13}
                      className="absolute left-3 top-2.5 text-slate-400"
                    />
                    <textarea
                      rows={3}
                      required
                      placeholder="Calle, colonia, municipio..."
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      className={`${inputClass} pl-8 resize-none`}
                    />
                  </div>
                </div>
              </div>

              {/* COLUMNA 3: VIVIENDA Y MASCOTAS */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Home size={15} style={{ color: palette.primary }} />
                  <span>3. Vivienda</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Vivienda
                  </label>
                  <select
                    value={tipoVivienda}
                    onChange={(e) => setTipoVivienda(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Selecciona...</option>
                    {TIPOS_VIVIENDA.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tieneMascotas}
                      onChange={(e) => setTieneMascotas(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 accent-[var(--color-primary)] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Dog size={14} className="text-slate-400" />
                      ¿Tiene mascotas actualmente?
                    </span>
                  </label>
                  <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                    Registra si el solicitante convive con animales para facilitar
                    la evaluación de la adopción.
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

export default function SolicitanteFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando formulario...</span>
        </div>
      }
    >
      <FormularioSolicitante />
    </Suspense>
  );
}
