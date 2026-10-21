"use client";

import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscador...",
}: SearchInputProps) {
  return (
    <div className="relative flex-1 max-w-xs">
      <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
      />
    </div>
  );
}

interface SelectFilterProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: string }[];
  label?: string;
}

export function SelectFilter({
  value,
  onChange,
  options,
  label,
}: SelectFilterProps) {
  return (
    <label className="flex items-center gap-2">
      {label && (
        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={onChange}
        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterBarProps {
  especies: FilterOption[];
  estados: FilterOption[];
  especie: string;
  estado: string;
  desde: string;
  hasta: string;
  onEspecieChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onDesdeChange: (value: string) => void;
  onHastaChange: (value: string) => void;
  onLimpiar: () => void;
}

/**
 * Barra de filtros reutilizable: especie, estado y rango de fecha.
 */
export function FilterBar({
  especies,
  estados,
  especie,
  estado,
  desde,
  hasta,
  onEspecieChange,
  onEstadoChange,
  onDesdeChange,
  onHastaChange,
  onLimpiar,
}: FilterBarProps) {
  const hayFiltros = especie || estado || desde || hasta;

  return (
    <div className="flex flex-wrap items-center gap-3 my-4 shrink-0">
      <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase">
        <SlidersHorizontal size={13} />
        Filtros
      </span>

      <label className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
          Especie
        </span>
        <select
          value={especie}
          onChange={(e) => onEspecieChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
        >
          <option value="">Todas</option>
          {especies.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
          Estado
        </span>
        <select
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
        >
          <option value="">Todos</option>
          {estados.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
          Desde
        </span>
        <input
          type="date"
          value={desde}
          onChange={(e) => onDesdeChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
        />
      </label>

      <label className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
          Hasta
        </span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => onHastaChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
        />
      </label>

      {hayFiltros && (
        <button
          onClick={onLimpiar}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
          title="Limpiar filtros"
        >
          <X size={13} />
          Limpiar
        </button>
      )}
    </div>
  );
}
