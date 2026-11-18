"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

export interface Palette {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  muted: string;
}

export const defaultPalette: Palette = {
  name: "AnimalSmile (Por defecto)",
  primary: "#ED019F",
  secondary: "#727EFF",
  accent: "#FA5780",
  dark: "#666DF3",
  muted: "#7CA6C2",
};

export const defaultSitePalette: Palette = {
  name: "AnimalSmile Sitio (Por defecto)",
  primary: "#ED019F",
  secondary: "#727EFF",
  accent: "#FA5780",
  dark: "#666DF3",
  muted: "#7CA6C2",
};

const THEME_STORAGE_KEY = "animalsmile_theme";
const SITE_THEME_STORAGE_KEY = "animalsmile_site_theme";
const THEME_CHANGE_EVENT = "animalsmile_theme_change";
const SITE_THEME_CHANGE_EVENT = "animalsmile_site_theme_change";

// Variables de caché en memoria para mantener referencias estables
let cachedThemeRaw: string | null = null;
let cachedThemePalette: Palette = defaultPalette;

let cachedSiteThemeRaw: string | null = null;
let cachedSiteThemePalette: Palette = defaultSitePalette;

function cargarPaletaGuardada(): Palette {
  if (typeof window === "undefined") return defaultPalette;
  try {
    const guardada = localStorage.getItem(THEME_STORAGE_KEY);
    if (!guardada) {
      cachedThemeRaw = null;
      cachedThemePalette = defaultPalette;
      return defaultPalette;
    }
    // Si el JSON en localStorage no ha cambiado, devolvemos la misma referencia
    if (guardada === cachedThemeRaw) {
      return cachedThemePalette;
    }
    cachedThemeRaw = guardada;
    cachedThemePalette = JSON.parse(guardada) as Palette;
    return cachedThemePalette;
  } catch {
    return defaultPalette;
  }
}

function cargarPaletaSitioGuardada(): Palette {
  if (typeof window === "undefined") return defaultSitePalette;
  try {
    const guardada = localStorage.getItem(SITE_THEME_STORAGE_KEY);
    if (!guardada) {
      cachedSiteThemeRaw = null;
      cachedSiteThemePalette = defaultSitePalette;
      return defaultSitePalette;
    }
    // Si el JSON en localStorage no ha cambiado, devolvemos la misma referencia
    if (guardada === cachedSiteThemeRaw) {
      return cachedSiteThemePalette;
    }
    cachedSiteThemeRaw = guardada;
    cachedSiteThemePalette = JSON.parse(guardada) as Palette;
    return cachedSiteThemePalette;
  } catch {
    return defaultSitePalette;
  }
}

function suscribirPaleta(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function suscribirPaletaSitio(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(SITE_THEME_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SITE_THEME_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function paletaServidor(): Palette {
  return defaultPalette;
}

function paletaSitioServidor(): Palette {
  return defaultSitePalette;
}

function notificarCambio(nombre: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(nombre));
  }
}

interface ThemeContextType {
  palette: Palette;
  updatePalette: (newPalette: Palette) => void;
  resetDefaultPalette: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const palette = useSyncExternalStore(
    suscribirPaleta,
    cargarPaletaGuardada,
    paletaServidor,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", palette.primary);
    root.style.setProperty("--color-secondary", palette.secondary);
    root.style.setProperty("--color-accent", palette.accent);
    root.style.setProperty("--color-dark", palette.dark);
    root.style.setProperty("--color-muted", palette.muted);
  }, [palette]);

  const updatePalette = useCallback((newPalette: Palette) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newPalette));
    } catch {
      console.error("No se pudo guardar la paleta personalizada.");
    }
    notificarCambio(THEME_CHANGE_EVENT);
  }, []);

  const resetDefaultPalette = useCallback(() => {
    updatePalette(defaultPalette);
  }, [updatePalette]);

  return (
    <ThemeContext.Provider
      value={{ palette, updatePalette, resetDefaultPalette }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}

interface SiteThemeContextType {
  sitePalette: Palette;
  actualizarPaletaSitio: (newPalette: Palette) => void;
  restablecerPaletaSitio: () => void;
  sitioConfig: Record<string, string>;
  setSitioConfig: (config: Record<string, string>) => void;
}

const SiteThemeContext = createContext<SiteThemeContextType | undefined>(
  undefined,
);

export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const sitePalette = useSyncExternalStore(
    suscribirPaletaSitio,
    cargarPaletaSitioGuardada,
    paletaSitioServidor,
  );
  const [sitioConfig, setSitioConfig] = useState<Record<string, string>>({});

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--site-primary", sitePalette.primary);
    root.style.setProperty("--site-secondary", sitePalette.secondary);
    root.style.setProperty("--site-accent", sitePalette.accent);
    root.style.setProperty("--site-dark", sitePalette.dark);
    root.style.setProperty("--site-muted", sitePalette.muted);
  }, [sitePalette]);

  const actualizarPaletaSitio = useCallback((newPalette: Palette) => {
    try {
      localStorage.setItem(SITE_THEME_STORAGE_KEY, JSON.stringify(newPalette));
    } catch {
      console.error("No se pudo guardar la paleta del sitio.");
    }
    notificarCambio(SITE_THEME_CHANGE_EVENT);
  }, []);

  const restablecerPaletaSitio = useCallback(() => {
    actualizarPaletaSitio(defaultSitePalette);
  }, [actualizarPaletaSitio]);

  return (
    <SiteThemeContext.Provider
      value={{
        sitePalette,
        actualizarPaletaSitio,
        restablecerPaletaSitio,
        sitioConfig,
        setSitioConfig,
      }}
    >
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme() {
  const context = useContext(SiteThemeContext);
  if (!context) {
    throw new Error("useSiteTheme debe usarse dentro de un SiteThemeProvider");
  }
  return context;
}

export function paletaSitioDesdeConfig(
  config: Record<string, string>,
): Palette {
  return {
    name: "Personalizada",
    primary: config.color_primary || defaultSitePalette.primary,
    secondary: config.color_secondary || defaultSitePalette.secondary,
    accent: config.color_accent || defaultSitePalette.accent,
    dark: config.color_dark || defaultSitePalette.dark,
    muted: config.color_muted || defaultSitePalette.muted,
  };
}
