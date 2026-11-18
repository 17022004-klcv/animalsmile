"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Toast, type ToastTipo } from "@/src/components/ui/Toast";

interface ToastContextValue {
  mostrarToast: (mensaje: string, tipo?: ToastTipo) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface EstadoToast {
  id: number;
  open: boolean;
  mensaje: string;
  tipo: ToastTipo;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<EstadoToast>({
    id: 0,
    open: false,
    mensaje: "",
    tipo: "success",
  });

  const mostrarToast = useCallback((mensaje: string, tipo: ToastTipo = "success") => {
    setToast((prev) => ({
      id: prev.id + 1,
      open: true,
      mensaje,
      tipo,
    }));
  }, []);

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      <Toast
        key={toast.id}
        open={toast.open}
        message={toast.mensaje}
        type={toast.tipo}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const contexto = useContext(ToastContext);
  if (!contexto) {
    throw new Error("useToast debe usarse dentro de ToastProvider.");
  }
  return contexto;
}
