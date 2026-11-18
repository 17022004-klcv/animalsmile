"use client";

import React, { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useTheme } from "@/src/context/ThemeContext";

export type ToastTipo = "success" | "error" | "info" | "warning";

interface ToastProps {
  open: boolean;
  message: React.ReactNode;
  type?: ToastTipo;
  onClose: () => void;
  duration?: number;
}

const CONFIG: Record<ToastTipo, { icono: LucideIcon; clases: string }> = {
  success: {
    icono: CheckCircle2,
    clases: "border-emerald-200 bg-emerald-50/40 text-emerald-600",
  },
  error: {
    icono: XCircle,
    clases: "border-red-200 bg-red-50/50 text-red-600",
  },
  info: {
    icono: Info,
    clases: "border-sky-200 bg-sky-50/50 text-sky-600",
  },
  warning: {
    icono: AlertTriangle,
    clases: "border-amber-200 bg-amber-50/50 text-amber-600",
  },
};

export function Toast({
  open,
  message,
  type = "success",
  onClose,
  duration = 4000,
}: ToastProps) {
  const { palette } = useTheme();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || duration <= 0) return;
    const temporizador = window.setTimeout(() => onCloseRef.current(), duration);
    return () => window.clearTimeout(temporizador);
  }, [open, duration]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const { icono: Icono, clases } = CONFIG[type];
  const color = type === "error" ? "#dc2626" : palette.primary;

  return (
    <div
      className="anim-toast-in fixed top-4 right-4 z-[60] w-[calc(100%-2rem)] max-w-sm"
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
    >
      <div
        className={`relative flex items-start gap-3 overflow-hidden rounded-2xl border p-4 pr-3 shadow-xl bg-white ${clases}`}
      >
        <span
          className="absolute inset-y-0 left-0 w-1"
          style={{ backgroundColor: color }}
        />
        <span className="mt-0.5 shrink-0">
          <Icono size={18} />
        </span>
        <div className="flex-1 text-xs font-semibold leading-relaxed text-slate-700">
          {message}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          title="Cerrar notificación"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
