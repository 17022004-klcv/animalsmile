"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";
import { Button } from "@/src/components/ui/Button";
import {
  actualizarDonacionEspecie,
  crearDonacionEspecie,
  obtenerDonacionEspecie,
} from "@/src/services/donations/donation-client";
import type { DonacionEspecieInput } from "@/src/services/donations/donation-validation";
import {
  etiquetaTipoDonacion,
  formatearCantidad,
} from "@/src/services/donations/donation-format";
import {
  TIPOS_DONACION_ESPECIE,
  UNIDADES_MEDIDA,
} from "@/src/types/donacion";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Hash,
  Link2,
  Loader2,
  Mail,
  Package,
  Ruler,
  Save,
  User,
} from "lucide-react";

const PASOS = [
  {
    id: "donante",
    titulo: "Donante",
    descripcion: "Datos de contacto",
    icono: User,
  },
  {
    id: "articulo",
    titulo: "Artículo",
    descripcion: "Tipo y cantidad",
    icono: Package,
  },
  {
    id: "detalle",
    titulo: "Detalle",
    descripcion: "Confirmación",
    icono: FileText,
  },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FormularioDonacionEspecie() {
  const { palette } = useTheme();
  const { mostrarToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idDonacion = searchParams.get("id");
  const modoEdicion = idDonacion !== null;

  const [paso, setPaso] = useState(0);
  const [cargandoDonacion, setCargandoDonacion] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [donanteNombre, setDonanteNombre] = useState("");
  const [donanteEmail, setDonanteEmail] = useState("");
  const [tipo, setTipo] = useState<string>("Alimentos");
  const [cantidad, setCantidad] = useState("");
  const [unidadMedida, setUnidadMedida] = useState("");
  const [unidadOtra, setUnidadOtra] = useState("");
  const [fechaDonacion, setFechaDonacion] = useState("");
  const [descripcionDetalle, setDescripcionDetalle] = useState("");
  const [comprobanteUrl, setComprobanteUrl] = useState("");

  useEffect(() => {
    if (!idDonacion) return;
    let cancelado = false;

    obtenerDonacionEspecie(idDonacion)
      .then((d) => {
        if (cancelado) return;
        setDonanteNombre(d.donante_nombre ?? "");
        setDonanteEmail(d.donante_email ?? "");
        setTipo(d.tipo);
        setCantidad(d.cantidad === null ? "" : String(d.cantidad));

        const unidad = d.unidad_medida ?? "";
        if (unidad && !(UNIDADES_MEDIDA as readonly string[]).includes(unidad)) {
          setUnidadMedida("Otra");
          setUnidadOtra(unidad);
        } else {
          setUnidadMedida(unidad);
          setUnidadOtra("");
        }

        setFechaDonacion((d.fecha_donacion ?? "").slice(0, 10));
        setDescripcionDetalle(d.descripcion_detalle ?? "");
        setComprobanteUrl(d.comprobante_url ?? "");
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar la donación.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoDonacion(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idDonacion]);

  const unidadFinal = unidadMedida === "Otra" ? unidadOtra.trim() : unidadMedida;
  const tipoValido = (TIPOS_DONACION_ESPECIE as readonly string[]).includes(
    tipo,
  );
  const cantidadNumerica = cantidad.trim() === "" ? null : Number(cantidad);
  const fechaLegible = fechaDonacion
    ? new Date(`${fechaDonacion}T12:00:00`).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Sin definir";

  const validarPaso = (indice: number): string | null => {
    if (indice === 0) {
      const email = donanteEmail.trim();
      if (email && !EMAIL_RE.test(email)) {
        return "El correo electrónico no es válido.";
      }
    }

    if (indice === 1) {
      if (!tipoValido) {
        return "Debes seleccionar un tipo de donación válido.";
      }
      const cantidadIngresada = Number(cantidad);
      if (
        !cantidad.trim() ||
        !Number.isFinite(cantidadIngresada) ||
        cantidadIngresada <= 0
      ) {
        return "Debes indicar una cantidad válida.";
      }
      if (!unidadFinal) {
        return "La unidad de medida es obligatoria.";
      }
      if (!fechaDonacion) {
        return "La fecha de la donación es obligatoria.";
      }
      if (Number.isNaN(new Date(fechaDonacion).getTime())) {
        return "La fecha de la donación no es válida.";
      }
    }

    return null;
  };

  const avanzarPaso = () => {
    const mensaje = validarPaso(paso);
    if (mensaje) {
      setError(mensaje);
      mostrarToast(mensaje, "error");
      return;
    }
    setError(null);
    setPaso((actual) => Math.min(actual + 1, PASOS.length - 1));
  };

  const retrocederPaso = () => {
    setError(null);
    setPaso((actual) => Math.max(actual - 1, 0));
  };

  const irAPaso = (indice: number) => {
    if (indice >= paso) return;
    setError(null);
    setPaso(indice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paso < PASOS.length - 1) {
      avanzarPaso();
      return;
    }

    for (let indice = 0; indice < PASOS.length; indice += 1) {
      const mensaje = validarPaso(indice);
      if (mensaje) {
        setPaso(indice);
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return;
      }
    }

    setGuardando(true);
    setError(null);

    const payload: DonacionEspecieInput = {
      donante_nombre: donanteNombre.trim(),
      donante_email: donanteEmail.trim() || null,
      tipo: tipo as DonacionEspecieInput["tipo"],
      cantidad: Number(cantidad),
      unidad_medida: unidadFinal,
      descripcion_detalle: descripcionDetalle.trim() || null,
      fecha_donacion: fechaDonacion,
      comprobante_url: comprobanteUrl.trim() || null,
    };

    try {
      if (modoEdicion && idDonacion) {
        await actualizarDonacionEspecie(idDonacion, payload);
        mostrarToast("Donación en especie actualizada correctamente.", "success");
      } else {
        await crearDonacionEspecie(payload);
        mostrarToast("Donación en especie registrada correctamente.", "success");
      }
      router.push("/admin/modules/Donations/InKindDonations");
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo guardar el registro.";
      setError(mensaje);
      mostrarToast(mensaje, "error");
    } finally {
      setGuardando(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition";

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <form
        onSubmit={handleSubmit}
        className="anim-fade-in h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden"
      >
        <div className="flex items-center justify-between gap-4 shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/modules/Donations/InKindDonations"
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
                    <span style={{ color: palette.primary }}>
                      Donación en Especie
                    </span>
                  </>
                ) : (
                  <>
                    Registro de{" "}
                    <span style={{ color: palette.primary }}>
                      Nueva Donación en Especie
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {modoEdicion
                  ? "Actualiza los datos del donante y los detalles del artículo."
                  : "Completa los pasos para registrar los artículos donados."}
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
              const habilitado = indice <= paso;
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
                      habilitado ? "cursor-pointer" : "cursor-not-allowed opacity-60"
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
          {cargandoDonacion ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando donación...</span>
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
                      <User size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Datos del donante
                      </h2>
                      <p className="text-xs text-slate-500">
                        Indica quién realiza el aporte. Si lo dejas vacío, la
                        donación se registrará como anónima.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre del Donante
                      </label>
                      <input
                        type="text"
                        placeholder="Anónimo"
                        value={donanteNombre}
                        onChange={(e) => setDonanteNombre(e.target.value)}
                        className={inputClass}
                      />
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
                          placeholder="donante@correo.com"
                          value={donanteEmail}
                          onChange={(e) => setDonanteEmail(e.target.value)}
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div className="anim-fade-up delay-4 sm:col-span-2 p-4 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                      <span
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${palette.primary}12`,
                          color: palette.primary,
                        }}
                      >
                        <Package size={17} />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Tipo de donación
                        </p>
                        <p
                          className="text-sm font-black"
                          style={{ color: palette.primary }}
                        >
                          En especie
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Este formulario registra alimentos, medicamentos,
                          higiene y equipamiento.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

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
                      <Package size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Datos del artículo
                      </h2>
                      <p className="text-xs text-slate-500">
                        Registra qué se donó, la cantidad y la fecha de entrega.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tipo de Donación *
                      </label>
                      <div className="relative">
                        <Package
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <select
                          value={tipo}
                          onChange={(e) => setTipo(e.target.value)}
                          className={`${inputClass} pl-8`}
                        >
                          {TIPOS_DONACION_ESPECIE.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {etiquetaTipoDonacion(opcion)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cantidad *
                      </label>
                      <div className="relative">
                        <Hash
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="number"
                          required
                          min="0.01"
                          step="0.01"
                          placeholder="0"
                          value={cantidad}
                          onChange={(e) => setCantidad(e.target.value)}
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Unidad de Medida *
                      </label>
                      <div className="relative">
                        <Ruler
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <select
                          value={unidadMedida}
                          onChange={(e) => setUnidadMedida(e.target.value)}
                          className={`${inputClass} pl-8`}
                        >
                          <option value="">Selecciona una unidad...</option>
                          {UNIDADES_MEDIDA.map((unidad) => (
                            <option key={unidad} value={unidad}>
                              {unidad === "Otra" ? "Otra unidad..." : unidad}
                            </option>
                          ))}
                        </select>
                      </div>
                      {unidadMedida === "Otra" && (
                        <input
                          type="text"
                          required
                          placeholder="Especifica la unidad"
                          value={unidadOtra}
                          onChange={(e) => setUnidadOtra(e.target.value)}
                          className={`${inputClass} mt-2`}
                        />
                      )}
                    </div>

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
                          value={fechaDonacion}
                          onChange={(e) => setFechaDonacion(e.target.value)}
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Comprobante
                      </label>
                      <div className="relative">
                        <Link2
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="url"
                          placeholder="https://..."
                          value={comprobanteUrl}
                          onChange={(e) => setComprobanteUrl(e.target.value)}
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Enlace opcional al comprobante o recibo de la entrega.
                      </p>
                    </div>
                  </div>
                </section>
              )}

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
                      <FileText size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Detalle y confirmación
                      </h2>
                      <p className="text-xs text-slate-500">
                        Añade una descripción y revisa el resumen antes de
                        guardar el registro.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 space-y-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Detalle o motivo de la donación..."
                        value={descripcionDetalle}
                        onChange={(e) => setDescripcionDetalle(e.target.value)}
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <div
                      className="anim-scale-in delay-4 rounded-2xl p-5 text-white shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">
                            Resumen de la donación
                          </p>
                          <p className="text-3xl font-black mt-1">
                            {formatearCantidad(cantidadNumerica, unidadFinal)}
                          </p>
                          <p className="text-[11px] font-semibold text-white/90 mt-0.5">
                            {etiquetaTipoDonacion(tipo)}
                          </p>
                        </div>
                        <span className="w-11 h-11 rounded-full bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
                          <Package size={20} />
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-[11px] text-white/90 sm:grid-cols-2">
                        <p className="truncate">
                          <span className="font-bold text-white">
                            Donante:
                          </span>{" "}
                          {donanteNombre.trim() || "Anónimo"}
                        </p>
                        <p className="truncate">
                          <span className="font-bold text-white">Correo:</span>{" "}
                          {donanteEmail.trim() || "Sin correo"}
                        </p>
                        <p className="truncate">
                          <span className="font-bold text-white">Tipo:</span>{" "}
                          {etiquetaTipoDonacion(tipo)}
                        </p>
                        <p>
                          <span className="font-bold text-white">Fecha:</span>{" "}
                          {fechaLegible}
                        </p>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      El registro quedará asociado automáticamente al usuario
                      administrador que guarda la donación.
                    </p>
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
                icon={<ChevronLeft size={15} />}
              >
                Anterior
              </Button>
            )}

            {paso < PASOS.length - 1 ? (
              <Button type="submit" icon={<ChevronRight size={15} />}>
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={guardando}
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

export default function DonacionEspecieFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando formulario...</span>
        </div>
      }
    >
      <FormularioDonacionEspecie />
    </Suspense>
  );
}
