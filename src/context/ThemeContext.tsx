"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

const THEME_STORAGE_KEY = "animalsmile_theme";

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
