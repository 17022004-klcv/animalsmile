"use client";

import React, { useEffect, useState } from "react";
import { useTheme, defaultPalette, Palette } from "@/src/context/ThemeContext";
import {
  actualizarConfigSistema,
  crearConfigSistema,
  obtenerConfigSistema,
} from "@/src/services/config/config-client";

import {
  Palette as PaletteIcon,
  RotateCcw,
  Check,
  Sparkles,
  Save,
  Gauge,
  Loader2,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Sliders,
  DollarSign,
  HeartPulse,
} from "lucide-react";

type ParametroDashboard = {
  clave: string;
  label: string;
  descripcion: string;
  porDefecto: string;
  sufijo: string;
};

const PARAMETROS_DASHBOARD: ParametroDashboard[] = [
  {
    clave: "dashboard_capacidad_refugio",
    label: "Capacidad del refugio",
    descripcion: "Número máximo de animales que puede alojar el refugio.",
    porDefecto: "50",
    sufijo: "animales",
  },
  {
    clave: "dashboard_meta_recaudacion",
    label: "Meta de recaudación",
    descripcion: "Objetivo de recaudación mostrado en el panel principal.",
    porDefecto: "5000",
    sufijo: "USD",
  },
];

const presetPalettes: Palette[] = [
  defaultPalette,
  {
    name: "Océano Calma",
    primary: "#0284C7",
    secondary: "#0EA5E9",
    accent: "#38BDF8",
    dark: "#0369A1",
    muted: "#64748B",
  },
  {
    name: "Bosque Silvestre",
    primary: "#059669",
    secondary: "#10B981",
    accent: "#34D399",
    dark: "#047857",
    muted: "#6B7280",
  },
  {
    name: "Atardecer Cálido",
    primary: "#D97706",
    secondary: "#F59E0B",
    accent: "#FBBF24",
    dark: "#B45309",
    muted: "#78716C",
  },
];

const COLORES = [
  { label: "Principal", key: "primary" },
  { label: "Secundario", key: "secondary" },
  { label: "Acento", key: "accent" },
  { label: "Oscuro", key: "dark" },
  { label: "Grisáceo", key: "muted" },
] as const;

export default function ConfiguracionSistemaPage() {
  const { palette, updatePalette, resetDefaultPalette } = useTheme();

  const [customColors, setCustomColors] = useState<Palette>(palette);
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  const [valoresDashboard, setValoresDashboard] = useState<
    Record<string, string>
  >(
    Object.fromEntries(
      PARAMETROS_DASHBOARD.map((p) => [p.clave, p.porDefecto]),
    ),
  );

  const [idsDashboard, setIdsDashboard] = useState<Record<string, string>>({});
  const [cargandoDashboard, setCargandoDashboard] = useState(true);
  const [guardandoDashboard, setGuardandoDashboard] = useState(false);
  const [mensajeDashboard, setMensajeDashboard] = useState<string | null>(null);
  const [errorDashboard, setErrorDashboard] = useState<string | null>(null);

  // Slider: solamente 2 pasos
  const [pasoActual, setPasoActual] = useState(0);
  const PASOS = 2;

  useEffect(() => {
    let cancelado = false;

    obtenerConfigSistema()
      .then((configuraciones) => {
        if (cancelado) return;

        const valores = Object.fromEntries(
          PARAMETROS_DASHBOARD.map((p) => [p.clave, p.porDefecto]),
        );

        const ids: Record<string, string> = {};

        for (const configuracion of configuraciones) {
          if (configuracion.clave in valores) {
            valores[configuracion.clave] = configuracion.valor;
            ids[configuracion.clave] = configuracion.id_config;
          }
        }

        setValoresDashboard(valores);
        setIdsDashboard(ids);
      })
      .catch((err) => {
        if (!cancelado) {
          setErrorDashboard(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los parámetros.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoDashboard(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const guardarDashboard = async () => {
    setGuardandoDashboard(true);
    setErrorDashboard(null);

    try {
      const ids = { ...idsDashboard };

      for (const parametro of PARAMETROS_DASHBOARD) {
        const valor =
          valoresDashboard[parametro.clave]?.trim() || parametro.porDefecto;

        const id = ids[parametro.clave];

        if (id) {
          await actualizarConfigSistema(id, { valor });
        } else {
          const creada = await crearConfigSistema({
            clave: parametro.clave,
            valor,
            tipo_dato: "number",
            descripcion: parametro.descripcion,
            modulo: "dashboard",
            editable: true,
          });

          ids[parametro.clave] = creada.id_config;
        }
      }

      setIdsDashboard(ids);
      setMensajeDashboard("Parámetros guardados correctamente.");

      setTimeout(() => setMensajeDashboard(null), 3000);
    } catch (err) {
      setErrorDashboard(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los parámetros.",
      );
    } finally {
      setGuardandoDashboard(false);
    }
  };

  const handleColorChange = (key: keyof Palette, value: string) => {
    const updated = {
      ...customColors,
      [key]: value,
      name: "Personalizada",
    };

    setCustomColors(updated);
    updatePalette(updated);
  };

  const handleSelectPreset = (p: Palette) => {
    setCustomColors(p);
    updatePalette(p);
  };

  const handleSave = () => {
    setMensajeGuardado(true);
    setTimeout(() => setMensajeGuardado(false), 3000);
  };

  const cambiarSlide = (direccion: number) => {
    setPasoActual((actual) =>
      Math.max(0, Math.min(PASOS - 1, actual + direccion)),
    );
  };

  return (
    <div className="anim-fade-in h-[calc(100vh-5rem)] w-full p-3 sm:p-5 overflow-hidden bg-slate-50 text-slate-800 flex flex-col select-none">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="anim-fade-up delay-1 h-full w-full max-w-7xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden relative">
        {/* HEADER */}
        <div className="anim-fade-up delay-2 flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: `${palette.primary}15`,
                color: palette.primary,
              }}
            >
              <PaletteIcon size={21} />
            </div>

            <div>
              <h1 className="text-lg font-black text-slate-800">
                Configuración del sistema
              </h1>

              <p className="text-xs text-slate-400 font-medium">
                Paso {pasoActual + 1} de {PASOS}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pasoActual === 1 && (
              <button
                onClick={() => {
                  resetDefaultPalette();
                  setCustomColors(defaultPalette);
                }}
                className="anim-press hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                <RotateCcw size={14} />
                Restablecer
              </button>
            )}

            <div className="flex items-center bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => cambiarSlide(-1)}
                disabled={pasoActual === 0}
                className="anim-press p-2 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition"
              >
                <ChevronLeft size={17} />
              </button>

              <button
                onClick={() => cambiarSlide(1)}
                disabled={pasoActual === PASOS - 1}
                className="anim-press p-2 rounded-lg text-slate-600 hover:bg-white disabled:opacity-30 transition"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* SLIDERS */}
        <div className="flex-1 min-h-0 overflow-hidden bg-slate-50/60">
          <div
            className="flex h-full w-[200%] transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${pasoActual * 50}%)`,
            }}
          >
            {/* ========================================= */}
            {/* SLIDE 1: CONFIGURACIÓN DASHBOARD */}
            {/* ========================================= */}

            <section className="w-1/2 h-full shrink-0 p-4 sm:p-7 flex items-center justify-center">
              <div className="anim-fade-up delay-3 w-full max-w-2xl bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${palette.primary}15`,
                      color: palette.primary,
                    }}
                  >
                    <Gauge size={23} />
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-slate-800">
                      Métricas del Dashboard
                    </h2>

                    <p className="text-xs text-slate-400">
                      Personaliza los valores de tu panel principal.
                    </p>
                  </div>
                </div>

                {cargandoDashboard ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-400 py-10">
                    <Loader2 size={18} className="animate-spin" />
                    Cargando parámetros...
                  </div>
                ) : (
                  <div className="anim-fade-up delay-4 space-y-4">
                    {PARAMETROS_DASHBOARD.map((parametro) => (
                      <div
                        key={parametro.clave}
                        className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                          {parametro.label}
                        </label>

                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            min={1}
                            value={valoresDashboard[parametro.clave] ?? ""}
                            onChange={(e) =>
                              setValoresDashboard((prev) => ({
                                ...prev,
                                [parametro.clave]: e.target.value,
                              }))
                            }
                            className="w-full px-4 py-3 text-base font-bold bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[var(--color-primary)] transition"
                          />

                          <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                            {parametro.sufijo}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-400 mt-2">
                          {parametro.descripcion}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={guardarDashboard}
                  disabled={guardandoDashboard || cargandoDashboard}
                  className="anim-press w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-white font-bold text-sm shadow-sm transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: palette.primary }}
                >
                  {guardandoDashboard ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Guardar métricas
                </button>

                {mensajeDashboard && (
                  <p className="text-xs text-emerald-600 font-bold text-center">
                    ✓ {mensajeDashboard}
                  </p>
                )}

                {errorDashboard && (
                  <p className="text-xs text-rose-600 font-bold text-center">
                    ⚠ {errorDashboard}
                  </p>
                )}
              </div>
            </section>

            {/* ========================================= */}
            {/* SLIDE 2: COLORES Y VISTA PREVIA */}
            {/* ========================================= */}

            <section className="w-1/2 h-full shrink-0 p-3 sm:p-5 lg:p-6 flex flex-col gap-4">
              {/* PALETAS PREDEFINIDAS */}
              <div className="anim-fade-up delay-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={17} style={{ color: palette.primary }} />

                  <div>
                    <h2 className="text-sm font-black text-slate-800">
                      Paletas predefinidas
                    </h2>

                    <p className="text-[10px] text-slate-400">
                      Selecciona un estilo para tu sistema.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {presetPalettes.map((preset) => {
                    const isSelected = palette.name === preset.name;

                    return (
                      <button
                        key={preset.name}
                        onClick={() => handleSelectPreset(preset)}
                        className={`anim-press p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? "bg-slate-50 shadow-sm"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                        style={{
                          borderColor: isSelected ? palette.primary : undefined,
                          borderWidth: isSelected ? 2 : 1,
                        }}
                      >
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[11px] font-bold text-slate-700 truncate">
                            {preset.name}
                          </span>

                          {isSelected && (
                            <Check
                              size={14}
                              style={{ color: palette.primary }}
                            />
                          )}
                        </div>

                        <div className="flex gap-1">
                          {[
                            preset.primary,
                            preset.secondary,
                            preset.accent,
                            preset.dark,
                            preset.muted,
                          ].map((color, index) => (
                            <div
                              key={index}
                              className="h-2.5 flex-1 rounded-md"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* EDITOR Y VISTA PREVIA */}
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* EDITOR DE COLORES */}
                <div className="anim-fade-up delay-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col min-w-0">
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 shrink-0">
                    <Sliders size={18} style={{ color: palette.primary }} />

                    <div>
                      <h2 className="text-sm font-black text-slate-800">
                        Ajuste manual
                      </h2>

                      <p className="text-[10px] text-slate-400">
                        Personaliza cada tonalidad.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-evenly gap-2">
                    {COLORES.map(({ label, key }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100"
                      >
                        <span className="text-xs font-bold text-slate-700">
                          {label}
                        </span>

                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customColors[key]}
                            onChange={(e) =>
                              handleColorChange(key, e.target.value)
                            }
                            className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                          />

                          <input
                            type="text"
                            value={customColors[key]}
                            onChange={(e) =>
                              handleColorChange(key, e.target.value)
                            }
                            className="w-[76px] px-2 py-1.5 text-[11px] font-mono uppercase bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none text-center"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleSave}
                    className="anim-press mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-xs shadow-sm transition hover:opacity-90 shrink-0"
                    style={{ backgroundColor: palette.primary }}
                  >
                    <Save size={16} />
                    Guardar colores
                  </button>

                  {mensajeGuardado && (
                    <p className="text-[11px] text-emerald-600 font-bold text-center mt-2">
                      ✓ ¡Preferencias guardadas!
                    </p>
                  )}
                </div>

                {/* VISTA PREVIA CLARA */}
                <div className="anim-fade-up delay-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col min-w-0 relative overflow-hidden">
                  {/* Encabezado */}
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 shrink-0">
                    <LayoutDashboard
                      size={18}
                      style={{ color: palette.primary }}
                    />

                    <div>
                      <h2 className="text-sm font-black text-slate-800">
                        Vista previa
                      </h2>

                      <p className="text-[10px] text-slate-400">
                        Así lucirá tu sistema.
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-evenly gap-3">
                    {/* TARJETA RECAUDACIÓN */}
                    <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            Recaudado
                          </p>

                          <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">
                            $4,250
                            <span className="text-[10px] font-medium text-slate-400 ml-1">
                              / $5,000
                            </span>
                          </p>
                        </div>

                        <div
                          className="p-2.5 rounded-xl"
                          style={{
                            backgroundColor: `${palette.primary}15`,
                            color: palette.primary,
                          }}
                        >
                          <DollarSign size={18} />
                        </div>
                      </div>

                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-3">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: "85%",
                            backgroundColor: palette.primary,
                          }}
                        />
                      </div>
                    </div>

                    {/* TARJETA ESTADO */}
                    <div className="bg-slate-50 rounded-2xl p-3 sm:p-4 border border-slate-100 flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${palette.secondary}15`,
                          color: palette.secondary,
                        }}
                      >
                        <HeartPulse size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800">
                          Estado del Refugio
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          42 / 50 animales (Capacidad Normal)
                        </p>
                      </div>
                    </div>

                    {/* BOTONES */}
                    <div className="flex gap-2 pt-2">
                      <button
                        className="anim-press flex-1 py-2.5 rounded-xl text-[10px] font-bold text-white transition hover:opacity-90"
                        style={{ backgroundColor: palette.primary }}
                      >
                        Aprobar adopción
                      </button>

                      <button
                        className="anim-press flex-1 py-2.5 rounded-xl text-[10px] font-bold border transition hover:bg-slate-100"
                        style={{
                          color: palette.dark,
                          borderColor: `${palette.dark}30`,
                          backgroundColor: "white",
                        }}
                      >
                        Revisar
                      </button>
                    </div>
                  </div>

                  {/* Indicador inferior */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 shrink-0">
                    <span className="text-[9px] font-semibold text-slate-400">
                      Apariencia del sistema
                    </span>

                    <div className="flex gap-1">
                      {[palette.primary, palette.secondary, palette.accent].map(
                        (color, index) => (
                          <div
                            key={index}
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* FOOTER / INDICADORES */}
        <div className="anim-fade-up delay-6 px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-center gap-2 shrink-0">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => setPasoActual(index)}
              aria-label={`Ir al paso ${index + 1}`}
              className={`anim-press h-2 rounded-full transition-all duration-300 ${
                pasoActual === index
                  ? "w-8"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
              style={{
                backgroundColor:
                  pasoActual === index ? palette.primary : undefined,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
