"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  paletaSitioDesdeConfig,
  useSiteTheme,
  useTheme,
} from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import {
  guardarConfigSitio,
  obtenerConfigSitio,
  subirImagenesSitio,
} from "@/src/services/config/config-client";
import {
  CONFIGURACION_SITIO_DEFECTO,
  SECCIONES_SITIO,
  mapaConfiguracionSitio,
  parsearGaleriaSitio,
  serializarGaleriaSitio,
  type CampoSitio,
  type TipoCampoSitio,
} from "@/src/services/config/site-config";
import type { ConfiguracionSitioInput } from "@/src/services/config/config-validation";
import {
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Eye,
  FileText,
  Globe,
  Heart,
  Home,
  Image as ImageIcon,
  Images,
  Loader2,
  Palette as PaletteIcon,
  PawPrint,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
} from "lucide-react";

const ICONOS: Record<string, React.ElementType> = {
  general: PaletteIcon,
  inicio: Home,
  nosotros: Users,
  servicios: ShieldCheck,
  rescates: PawPrint,
  adopciones: Heart,
  donar: DollarSign,
};

function etiquetaBoton(type: TipoCampoSitio) {
  if (type === "gallery") return "Subir fotos";
  if (type === "image") return "Subir imagen";
  return "Subir";
}

export default function ConfiguracionSitioPage() {
  const { palette } = useTheme();
  const {
    sitePalette,
    actualizarPaletaSitio,
    setSitioConfig,
  } = useSiteTheme();

  const [valores, setValores] = useState<Record<string, string>>({
    ...CONFIGURACION_SITIO_DEFECTO,
  });
  const [seccionActiva, setSeccionActiva] = useState("general");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const inputArchivoRef = useRef<HTMLInputElement>(null);
  const [campoArchivo, setCampoArchivo] = useState<{
    key: string;
    type: TipoCampoSitio;
  } | null>(null);

  const camposPorClave = useMemo(() => {
    const mapa: Record<string, CampoSitio> = {};
    for (const seccion of SECCIONES_SITIO) {
      for (const campo of seccion.fields) mapa[campo.key] = campo;
    }
    return mapa;
  }, []);

  const seccion =
    SECCIONES_SITIO.find((item) => item.id === seccionActiva) ??
    SECCIONES_SITIO[0];

  useEffect(() => {
    let cancelado = false;

    obtenerConfigSitio()
      .then((filas) => {
        if (cancelado) return;
        const mapa = mapaConfiguracionSitio(filas);
        const combinada = { ...CONFIGURACION_SITIO_DEFECTO, ...mapa };
        setValores(combinada);
        setSitioConfig(combinada);
        if (Object.keys(mapa).some((clave) => clave.startsWith("color_"))) {
          actualizarPaletaSitio(paletaSitioDesdeConfig(mapa));
        }
        setError(null);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar la configuración del sitio.",
        );
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [actualizarPaletaSitio, setSitioConfig]);

  const actualizarValor = (clave: string, valor: string) => {
    setValores((prev) => ({ ...prev, [clave]: valor }));
    if (clave.startsWith("color_")) {
      actualizarPaletaSitio(paletaSitioDesdeConfig({ ...valores, [clave]: valor }));
    }
    setMensaje(null);
    setError(null);
  };

  const abrirSelectorArchivo = (campo: CampoSitio) => {
    setCampoArchivo({ key: campo.key, type: campo.type });
    const input = inputArchivoRef.current;
    if (!input) return;
    input.value = "";
    input.multiple = campo.type === "gallery";
    input.click();
  };

  const manejarArchivos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const archivos = Array.from(input.files ?? []);
    if (!archivos.length || !campoArchivo) return;

    const campo = camposPorClave[campoArchivo.key];
    if (!campo) return;

    setSubiendo(campo.key);
    setError(null);
    setMensaje(null);

    try {
      const urls = await subirImagenesSitio(archivos);
      if (!urls.length) throw new Error("No se recibieron imágenes.");

      if (campo.type === "gallery") {
        const actuales = parsearGaleriaSitio(valores[campo.key]);
        const nuevas = Array.from(new Set([...actuales, ...urls])).slice(0, 6);
        actualizarValor(campo.key, serializarGaleriaSitio(nuevas));
      } else {
        actualizarValor(campo.key, urls[0]);
      }

      setMensaje(
        campo.type === "gallery"
          ? "Fotos subidas correctamente."
          : "Imagen subida correctamente.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron subir las imágenes.",
      );
    } finally {
      setSubiendo(null);
      input.value = "";
      setCampoArchivo(null);
    }
  };

  const quitarImagen = (campo: CampoSitio, url?: string) => {
    if (campo.type === "gallery") {
      const actuales = parsearGaleriaSitio(valores[campo.key]);
      const nuevas = url ? actuales.filter((item) => item !== url) : [];
      actualizarValor(campo.key, serializarGaleriaSitio(nuevas));
    } else {
      actualizarValor(campo.key, "");
    }
  };

  const restablecerTodo = () => {
    setValores({ ...CONFIGURACION_SITIO_DEFECTO });
    setSitioConfig({ ...CONFIGURACION_SITIO_DEFECTO });
    actualizarPaletaSitio(paletaSitioDesdeConfig(CONFIGURACION_SITIO_DEFECTO));
    setMensaje("Valores restablecidos. Guarda para aplicar los cambios.");
    setError(null);
  };

  const restablecerSeccion = () => {
    const siguiente = { ...valores };
    for (const campo of seccion.fields) {
      siguiente[campo.key] = CONFIGURACION_SITIO_DEFECTO[campo.key] ?? "";
    }
    setValores(siguiente);
    if (seccion.id === "general") {
      actualizarPaletaSitio(paletaSitioDesdeConfig(siguiente));
    }
    setMensaje(`La sección "${seccion.label}" se restableció.`);
    setError(null);
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setMensaje(null);

    const configuraciones: ConfiguracionSitioInput[] = SECCIONES_SITIO.flatMap(
      (item) =>
        item.fields.map((campo) => ({
          clave: campo.key,
          valor: valores[campo.key] ?? "",
          tipo_dato:
            campo.type === "gallery"
              ? "galeria"
              : campo.type === "image"
                ? "url"
                : campo.type === "color"
                  ? "color"
                  : "string",
          seccion: item.id,
          descripcion: campo.label,
        })),
    );

    try {
      const filas = await guardarConfigSitio(configuraciones);
      const mapa = mapaConfiguracionSitio(filas);
      const combinada = { ...CONFIGURACION_SITIO_DEFECTO, ...mapa };
      setValores(combinada);
      setSitioConfig(combinada);
      actualizarPaletaSitio(paletaSitioDesdeConfig(combinada));
      setMensaje("Configuración del sitio guardada correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la configuración del sitio.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const imagenesPreview = parsearGaleriaSitio(
    valores[`${seccion.id}_imagenes`] ?? "",
  );

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col">
      <input
        ref={inputArchivoRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={manejarArchivos}
      />

      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Globe size={22} style={{ color: palette.primary }} />
              Configuración del{" "}
              <span style={{ color: palette.primary }}>Sitio Web</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Administra las fotos, descripciones y colores de cada sección
              pública. Estos cambios no afectan al sistema administrativo.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              icon={<RefreshCw size={15} />}
              onClick={restablecerTodo}
              disabled={cargando || guardando}
            >
              Restablecer
            </Button>
            <Button
              onClick={guardar}
              disabled={cargando || guardando || subiendo !== null}
              icon={
                guardando ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )
              }
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-4 shrink-0">
          {SECCIONES_SITIO.map((item) => {
            const Icono = ICONOS[item.id] ?? FileText;
            const activa = item.id === seccionActiva;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSeccionActiva(item.id);
                  setMensaje(null);
                  setError(null);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition whitespace-nowrap ${
                  activa
                    ? "text-white shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
                style={
                  activa
                    ? {
                        backgroundColor: palette.primary,
                        borderColor: palette.primary,
                      }
                    : undefined
                }
              >
                <Icono size={14} />
                {item.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {mensaje && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-semibold shrink-0">
            <CheckCircle2 size={14} />
            {mensaje}
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          {cargando ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">
                Cargando configuración del sitio...
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              <div className="xl:col-span-7 space-y-4">
                <div className="flex items-start justify-between gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <div>
                    <h2 className="text-sm font-black text-slate-800">
                      {seccion.label}
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {seccion.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={restablecerSeccion}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
                  >
                    <RefreshCw size={11} />
                    Restablecer sección
                  </button>
                </div>

                {seccion.fields.map((campo) => (
                  <CampoFormulario
                    key={campo.key}
                    campo={campo}
                    valor={valores[campo.key] ?? ""}
                    subiendo={subiendo === campo.key}
                    onCambiar={(valor) => actualizarValor(campo.key, valor)}
                    onSubir={() => abrirSelectorArchivo(campo)}
                    onQuitar={(url) => quitarImagen(campo, url)}
                  />
                ))}
              </div>

              <div className="xl:col-span-5">
                <div className="sticky top-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Eye size={15} style={{ color: palette.secondary }} />
                      Vista previa
                    </h2>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Los cambios se aplican al guardar
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs">
                    <div
                      className="flex items-center justify-between gap-3 px-4 py-3 text-white"
                      style={{
                        background: `linear-gradient(135deg, ${sitePalette.primary}, ${sitePalette.secondary})`,
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={
                            valores.sitio_logo ||
                            CONFIGURACION_SITIO_DEFECTO.sitio_logo
                          }
                          alt="Logo del sitio"
                          className="w-7 h-7 rounded-lg object-contain bg-white/90 p-0.5 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-black truncate">
                            {valores.sitio_nombre || "AnimalSmile"}
                          </p>
                          <p className="text-[10px] text-white/80 truncate">
                            {valores.sitio_lema || "Refugio de Animales"}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 text-[9px] font-bold text-white/90">
                        <span>Inicio</span>
                        <span>Nosotros</span>
                        <span>Servicios</span>
                        <span>Adopciones</span>
                      </div>
                    </div>

                    {seccion.id === "general" ? (
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-5 gap-1.5">
                          {(
                            [
                              "primary",
                              "secondary",
                              "accent",
                              "dark",
                              "muted",
                            ] as const
                          ).map((clave) => (
                            <div key={clave} className="space-y-1">
                              <div
                                className="h-12 rounded-lg border border-white shadow-2xs"
                                style={{ backgroundColor: sitePalette[clave] }}
                              />
                              <p className="text-[8px] font-mono text-center text-slate-500 uppercase">
                                {clave}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-xl bg-white border border-slate-100 p-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">
                            Identidad
                          </p>
                          <p className="text-sm font-black text-slate-800 mt-1">
                            {valores.sitio_nombre || "AnimalSmile"}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {valores.sitio_lema || "Refugio de Animales"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 space-y-3">
                        {imagenesPreview[0] ? (
                          <img
                            src={imagenesPreview[0]}
                            alt={seccion.label}
                            className="w-full h-40 object-cover rounded-xl border border-slate-100"
                          />
                        ) : (
                          <div
                            className="w-full h-40 rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 text-white"
                            style={{
                              background: `linear-gradient(135deg, ${sitePalette.primary}, ${sitePalette.accent})`,
                            }}
                          >
                            <ImageIcon size={22} />
                            <span className="text-[10px] font-bold">
                              Sin foto de portada
                            </span>
                          </div>
                        )}

                        <div className="rounded-xl bg-white border border-slate-100 p-3 space-y-1.5">
                          <p
                            className="text-[10px] font-bold uppercase tracking-wide"
                            style={{ color: sitePalette.primary }}
                          >
                            {seccion.label}
                          </p>
                          <h3 className="text-base font-black text-slate-800 leading-tight">
                            {valores[`${seccion.id}_titulo`] || seccion.label}
                          </h3>
                          {valores[`${seccion.id}_subtitulo`] && (
                            <p className="text-[11px] font-semibold text-slate-500">
                              {valores[`${seccion.id}_subtitulo`]}
                            </p>
                          )}
                          <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
                            {valores[`${seccion.id}_descripcion`] ||
                              "Agrega una descripción para esta sección."}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-[10px] text-slate-500">
                    <SparklesIcon color={palette.accent} />
                    <span>
                      La paleta personalizada se guarda solo para el sitio
                      público.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SparklesIcon({ color }: { color: string }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3 1.9 5.8L20 10.7l-6.1 1.9L12 18.4l-1.9-5.8L4 10.7l6.1-1.9L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function CampoFormulario({
  campo,
  valor,
  subiendo,
  onCambiar,
  onSubir,
  onQuitar,
}: {
  campo: CampoSitio;
  valor: string;
  subiendo: boolean;
  onCambiar: (valor: string) => void;
  onSubir: () => void;
  onQuitar: (url?: string) => void;
}) {
  const { palette } = useTheme();
  const imagenes = parsearGaleriaSitio(valor);

  if (campo.type === "textarea") {
    return (
      <label className="block space-y-1.5">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
          {campo.label}
        </span>
        <textarea
          value={valor}
          onChange={(e) => onCambiar(e.target.value)}
          placeholder={campo.placeholder}
          rows={4}
          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition resize-y"
        />
        {campo.help && (
          <span className="text-[10px] text-slate-400">{campo.help}</span>
        )}
      </label>
    );
  }

  if (campo.type === "image") {
    return (
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
          {campo.label}
        </span>
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          {valor ? (
            <img
              src={valor}
              alt={campo.label}
              className="w-16 h-16 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
              <ImageIcon size={20} />
            </div>
          )}
          <div className="flex-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSubir}
              disabled={subiendo}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white transition disabled:opacity-60"
              style={{ backgroundColor: palette.primary }}
            >
              {subiendo ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              {subiendo ? "Subiendo..." : etiquetaBoton(campo.type)}
            </button>
            {valor && (
              <button
                type="button"
                onClick={() => onQuitar()}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 transition"
              >
                <Trash2 size={13} />
                Quitar
              </button>
            )}
          </div>
        </div>
        {campo.help && (
          <span className="text-[10px] text-slate-400">{campo.help}</span>
        )}
      </div>
    );
  }

  if (campo.type === "gallery") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
            {campo.label}
          </span>
          <span className="text-[10px] font-semibold text-slate-400">
            {imagenes.length}/6
          </span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          {imagenes.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {imagenes.map((url, index) => (
                <div
                  key={`${url}-${index}`}
                  className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white"
                >
                  <img
                    src={url}
                    alt={`${campo.label} ${index + 1}`}
                    className="w-full h-20 object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[8px] font-bold">
                      Portada
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onQuitar(url)}
                    className="absolute top-1 right-1 p-1 rounded bg-white/90 text-red-600 opacity-0 group-hover:opacity-100 transition"
                    title="Quitar imagen"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 text-slate-400">
              <Images size={20} />
              <span className="text-[10px] font-semibold">
                Aún no hay fotos en esta sección
              </span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onSubir}
              disabled={subiendo || imagenes.length >= 6}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white transition disabled:opacity-60"
              style={{ backgroundColor: palette.primary }}
            >
              {subiendo ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              {subiendo ? "Subiendo..." : etiquetaBoton(campo.type)}
            </button>
            {imagenes.length > 0 && (
              <button
                type="button"
                onClick={() => onQuitar()}
                className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-[11px] font-bold text-red-600 hover:bg-red-50 border border-red-200 transition"
              >
                <Trash2 size={13} />
                Quitar todas
              </button>
            )}
          </div>
        </div>

        {campo.help && (
          <span className="text-[10px] text-slate-400">{campo.help}</span>
        )}
      </div>
    );
  }

  if (campo.type === "color") {
    return (
      <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
          {campo.label}
        </span>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={valor || "#000000"}
            onChange={(e) => onCambiar(e.target.value.toUpperCase())}
            className="w-9 h-9 rounded-lg cursor-pointer border-none bg-transparent"
          />
          <input
            type="text"
            value={valor}
            onChange={(e) => onCambiar(e.target.value)}
            maxLength={7}
            className="w-24 px-2.5 py-1.5 text-xs font-mono uppercase bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
      </div>
    );
  }

  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">
        {campo.label}
      </span>
      <input
        type="text"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        placeholder={campo.placeholder}
        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
      />
      {campo.help && (
        <span className="text-[10px] text-slate-400">{campo.help}</span>
      )}
    </label>
  );
}
