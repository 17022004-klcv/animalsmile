"use client";

import { useTheme } from "@/src/context/ThemeContext";

interface TabsProps {
  activeTab: "especies" | "taxonomias";
  onChange: (tab: "especies" | "taxonomias") => void;
}

export function TabsSwitcher({ activeTab, onChange }: TabsProps) {
  const { palette } = useTheme();

  return (
    <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
      <button
        onClick={() => onChange("especies")}
        className={`px-4 py-1.5 rounded-lg font-bold transition ${
          activeTab === "especies"
            ? "text-white shadow-xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
        style={
          activeTab === "especies"
            ? { backgroundColor: palette.primary }
            : undefined
        }
      >
        Especies
      </button>
      <button
        onClick={() => onChange("taxonomias")}
        className={`px-4 py-1.5 rounded-lg font-bold transition ${
          activeTab === "taxonomias"
            ? "text-white shadow-xs"
            : "text-slate-600 hover:text-slate-900"
        }`}
        style={
          activeTab === "taxonomias"
            ? { backgroundColor: palette.primary }
            : undefined
        }
      >
        Taxonomía
      </button>
    </div>
  );
}
