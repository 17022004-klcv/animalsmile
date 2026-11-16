"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
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

function cargarPaletaGuardada(): Palette {
  if (typeof window === "undefined") return defaultPalette;
  const guardada = localStorage.getItem(THEME_STORAGE_KEY);
  if (!guardada) return defaultPalette;
  try {
    return JSON.parse(guardada) as Palette;
  } catch {
    return defaultPalette;
  }
}

function cargarPaletaSitioGuardada(): Palette {
  if (typeof window === "undefined") return defaultSitePalette;
  const guardada = localStorage.getItem(SITE_THEME_STORAGE_KEY);
  if (!guardada) return defaultSitePalette;
  try {
    return JSON.parse(guardada) as Palette;
  } catch {
    return defaultSitePalette;
  }
}

interface ThemeContextType {
  palette: Palette;
  updatePalette: (newPalette: Palette) => void;
  resetDefaultPalette: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPalette] = useState<Palette>(cargarPaletaGuardada);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", palette.primary);
    root.style.setProperty("--color-secondary", palette.secondary);
    root.style.setProperty("--color-accent", palette.accent);
    root.style.setProperty("--color-dark", palette.dark);
    root.style.setProperty("--color-muted", palette.muted);
  }, [palette]);

  const updatePalette = (newPalette: Palette) => {
    setPalette(newPalette);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newPalette));
  };

  const resetDefaultPalette = () => {
    updatePalette(defaultPalette);
  };

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
  const [sitePalette, setSitePalette] = useState<Palette>(
    cargarPaletaSitioGuardada,
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
    setSitePalette(newPalette);
    localStorage.setItem(SITE_THEME_STORAGE_KEY, JSON.stringify(newPalette));
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
