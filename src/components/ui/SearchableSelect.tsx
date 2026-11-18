"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { useTheme } from "@/src/context/ThemeContext";
import { ChevronDown, Search, X, Check } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  sublabel?: string; // Por si quieres mostrar info extra como "CÓDIGO - 001"
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string | number | null | undefined;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Seleccionar opción...",
  searchPlaceholder = "Buscar...",
  label,
  disabled = false,
  error,
}) => {
  const { palette } = useTheme();
  const listboxId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Opción seleccionada actualmente
  const selectedOption = options.find((opt) => opt.value === value);

  // Filtrado de opciones
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.sublabel &&
        opt.sublabel.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autofoco en el input de búsqueda al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string | number) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className="anim-fade-in flex flex-col gap-1.5 w-full text-xs font-medium"
      ref={containerRef}
    >
      {/* Label opcional */}
      {label && (
        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="relative w-full">
        {/* Botón Principal (Select Trigger) */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`anim-press w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-all text-left bg-white shadow-2xs ${
            error
              ? "border-red-300 text-red-700 bg-red-50/30"
              : isOpen
                ? "border-slate-400 ring-2 ring-slate-100"
                : "border-slate-200 hover:border-slate-300 text-slate-800"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "cursor-pointer"}`}
        >
          <span className="truncate">
            {selectedOption ? (
              <span className="font-semibold text-slate-800">
                {selectedOption.label}
                {selectedOption.sublabel && (
                  <span className="ml-1.5 text-slate-400 font-normal">
                    ({selectedOption.sublabel})
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </span>

          <ChevronDown
            size={15}
            className={`text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Menú Desplegable (Dropdown) */}
        {isOpen && (
          <div
            id={listboxId}
            className="anim-scale-in absolute z-50 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col"
          >
            {/* Buscador Superior */}
            <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Search size={14} className="text-slate-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="anim-press p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Lista de Opciones */}
            <ul className="max-h-56 overflow-y-auto divide-y divide-slate-50 py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <li key={opt.value}>
                      <button
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`anim-press w-full text-left px-3.5 py-2 flex items-center justify-between gap-2 transition-colors ${
                          isSelected
                            ? "bg-slate-50 font-bold text-slate-900"
                            : "hover:bg-slate-50/80 text-slate-700"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs">{opt.label}</span>
                          {opt.sublabel && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              {opt.sublabel}
                            </span>
                          )}
                        </div>

                        {isSelected && (
                          <Check
                            size={14}
                            className="shrink-0"
                            style={{ color: palette.primary }}
                          />
                        )}
                      </button>
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-6 text-center text-slate-400 font-medium text-xs">
                  No se encontraron resultados
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Mensaje de error opcional */}
      {error && (
        <span className="text-[10px] font-semibold text-red-500">{error}</span>
      )}
    </div>
  );
};
