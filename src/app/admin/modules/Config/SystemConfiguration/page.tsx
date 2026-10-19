"use client";

import React, { useState } from "react";
import { useTheme, defaultPalette, Palette } from "@/src/context/ThemeContext";
import {
  Palette as PaletteIcon,
  RotateCcw,
  Check,
  Sparkles,
  Save,
  ShieldCheck,
} from "lucide-react";

// Paletas predefinidas adicionales
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

export default function ConfiguracionSistemaPage() {
  const { palette, updatePalette, resetDefaultPalette } = useTheme();
  const [customColors, setCustomColors] = useState<Palette>(palette);
  const [mensajeGuardado, setMensajeGuardado] = useState(false);

  const handleColorChange = (key: keyof Palette, value: string) => {
    const updated = { ...customColors, [key]: value, name: "Personalizada" };
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-2 text-slate-800">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <PaletteIcon style={{ color: palette.primary }} size={24} />
            <span>
              Personalización del{" "}
              <span style={{ color: palette.primary }}>Sistema</span>
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ajusta los colores principales de la interfaz. La paleta
            seleccionada se aplicará a todos los módulos.
          </p>
        </div>

        <button
          onClick={resetDefaultPalette}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition shrink-0"
        >
          <RotateCcw size={14} />
          <span>Restablecer por Defecto</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Izquierdo: Editor de Colores y Paletas Predeterminadas */}
        <div className="lg:col-span-7 space-y-6">
          {/* Paletas Predeterminadas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} style={{ color: palette.secondary }} />
              <span>Paletas Predeterminadas</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {presetPalettes.map((preset) => {
                const isSelected = palette.name === preset.name;
                return (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "border-2 bg-slate-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    style={{
                      borderColor: isSelected ? palette.primary : undefined,
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-800">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                          style={{ backgroundColor: palette.primary }}
                        >
                          <Check size={12} />
                        </span>
                      )}
                    </div>

                    {/* Muestra de los 5 colores */}
                    <div className="flex gap-1.5 w-full">
                      <div
                        className="h-4 flex-1 rounded-md"
                        style={{ backgroundColor: preset.primary }}
                        title="Principal"
                      />
                      <div
                        className="h-4 flex-1 rounded-md"
                        style={{ backgroundColor: preset.secondary }}
                        title="Secundario"
                      />
                      <div
                        className="h-4 flex-1 rounded-md"
                        style={{ backgroundColor: preset.accent }}
                        title="Acento"
                      />
                      <div
                        className="h-4 flex-1 rounded-md"
                        style={{ backgroundColor: preset.dark }}
                        title="Oscuro"
                      />
                      <div
                        className="h-4 flex-1 rounded-md"
                        style={{ backgroundColor: preset.muted }}
                        title="Grisáceo"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor Personalizado Individual */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Ajuste Manual de Colores
            </h2>

            <div className="space-y-3">
              {[
                { label: "Color Principal (Acentos, Active)", key: "primary" },
                {
                  label: "Color Secundario (Íconos, Bordes)",
                  key: "secondary",
                },
                { label: "Color de Acento (Alertas, Botones)", key: "accent" },
                { label: "Color Púrpura Intenso (Navegación)", key: "dark" },
                { label: "Color Grisáceo (Detalles, Avatares)", key: "muted" },
              ].map(({ label, key }) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <span className="text-xs font-semibold text-slate-700">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColors[key as keyof Palette] as string}
                      onChange={(e) =>
                        handleColorChange(key as keyof Palette, e.target.value)
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                    />
                    <input
                      type="text"
                      value={customColors[key as keyof Palette] as string}
                      onChange={(e) =>
                        handleColorChange(key as keyof Palette, e.target.value)
                      }
                      className="w-20 px-2 py-1 text-xs font-mono uppercase bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold text-xs shadow-md transition hover:opacity-95"
              style={{ backgroundColor: palette.primary }}
            >
              <Save size={16} />
              <span>Guardar Configuración en el Sistema</span>
            </button>

            {mensajeGuardado && (
              <p className="text-xs text-emerald-600 font-bold text-center flex items-center justify-center gap-1 mt-2">
                <ShieldCheck size={14} /> ¡Preferencias de color guardadas
                correctamente!
              </p>
            )}
          </div>
        </div>

        {/* Lado Derecho: Vista Previa en Tiempo Real */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 sticky top-6">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Vista Previa en Tiempo Real
            </h2>

            {/* Simulación en pequeño del Sidebar / Componentes */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-3">
              {/* Ejemplo Logo */}
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: palette.primary }}
                >
                  🐾
                </div>
                <span className="font-bold text-sm text-slate-800">
                  Animal<span style={{ color: palette.primary }}>Smile</span>
                </span>
              </div>

              {/* Ejemplo Botón Principal */}
              <button
                className="w-full py-2 rounded-lg text-white font-bold text-xs shadow-xs"
                style={{ backgroundColor: palette.primary }}
              >
                Botón Principal
              </button>

              {/* Ejemplo Elemento Secundario */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100 text-xs">
                <span className="font-medium text-slate-600">
                  Ícono de Sección
                </span>
                <PaletteIcon size={16} style={{ color: palette.secondary }} />
              </div>

              {/* Ejemplo Badge de Acento */}
              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-100 text-xs">
                <span className="text-slate-600">Estado Activo</span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: palette.accent }}
                >
                  Confirmado
                </span>
              </div>

              {/* Ejemplo Avatar Muted */}
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100">
                <div
                  className="w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                  style={{ backgroundColor: palette.muted }}
                >
                  US
                </div>
                <span className="text-[11px] font-bold text-slate-700">
                  Usuario de Prueba
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
