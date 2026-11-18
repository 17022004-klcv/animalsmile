"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { pedir } from "@/src/services/common/http";
import {
  fechaCorta,
  formatearEstado,
} from "@/src/services/animals/animal-format";
import {
  X,
  Syringe,
  Plus,
  Loader2,
  AlertTriangle,
  PawPrint,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface VacunaPlan {
  id_vacuna: number;
  nombre: string;
  estado: "al_dia" | "pendiente" | "vencida";
  fecha_aplicacion?: string | null;
  proxima_dosis?: string | null;
}

interface DetalleAnimalVacunas {
  id_animal: string;
  nombre: string;
  codigo_identificador: string;
  estado: string;
  foto_principal?: string | null;
  especie: {
    nombre_comun: string;
  };
  vacunas: VacunaPlan[];
}

interface DetalleAnimalModalProps {
  idAnimal: string | null;
  onClose: () => void;
  onActualizado?: () => void;
}

export default function DetalleAnimalModal({
  idAnimal,
  onClose,
}: DetalleAnimalModalProps) {
  const { palette } = useTheme();
  const [detalle, setDetalle] = useState<DetalleAnimalVacunas | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idAnimal) {
      setDetalle(null);
      return;
    }

    let cancelado = false;
    setCargando(true);
    setError(null);

    pedir<DetalleAnimalVacunas>(`/api/admin/animals/${idAnimal}/inquiries`)
      .then((data) => {
        if (!cancelado) setDetalle(data);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el plan de vacunas del animal.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idAnimal]);

  if (!idAnimal) return null;

  const badgeEstadoVacuna = (estado: VacunaPlan["estado"]) => {
    if (estado === "al_dia") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 size={11} /> Al día
        </span>
      );
    }
    if (estado === "vencida") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
          <AlertCircle size={11} /> Vencida
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
        <Clock size={11} /> Pendiente
      </span>
    );
  };

  return (
    <div
      className="anim-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 select-none"
      onClick={onClose}
    >
      <div
        className="anim-scale-in w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {detalle?.foto_principal ? (
              <img
                src={detalle.foto_principal}
                alt={detalle.nombre}
                className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <span
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${palette.primary}15`,
                  color: palette.primary,
                }}
              >
                <PawPrint size={18} />
              </span>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-800 truncate">
                  {detalle ? detalle.nombre : "Cargando expediente..."}
                </h2>
                {detalle && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                    {detalle.codigo_identificador}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {detalle
                  ? `${detalle.especie.nombre_comun} · ${formatearEstado(detalle.estado)}`
                  : "Plan de vacunación del expediente"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="anim-press p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo: Solo Vacunas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Syringe size={15} style={{ color: palette.primary }} />
              <span>Plan de Vacunación</span>
            </h3>
            {detalle && (
              <span className="text-[11px] font-semibold text-slate-400">
                {detalle.vacunas?.length ?? 0} vacunas en catálogo
              </span>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold">
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {cargando ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">
                Cargando esquema de vacunas...
              </span>
            </div>
          ) : detalle && detalle.vacunas && detalle.vacunas.length > 0 ? (
            <div className="anim-fade-up delay-1 border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Vacuna</th>
                    <th className="px-4 py-2.5">Última aplicación</th>
                    <th className="px-4 py-2.5">Próxima dosis</th>
                    <th className="px-4 py-2.5 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detalle.vacunas.map((v) => (
                    <tr key={v.id_vacuna} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-bold text-slate-800">
                        {v.nombre}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {v.fecha_aplicacion
                          ? fechaCorta(v.fecha_aplicacion)
                          : "Sin aplicar"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {v.proxima_dosis ? fechaCorta(v.proxima_dosis) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {badgeEstadoVacuna(v.estado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !error && (
              <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-slate-400 text-xs">
                Este animal aún no tiene vacunas registradas en su catálogo de
                especie.
              </div>
            )
          )}
        </div>

        {/* Footer del Modal con botón para ir al Form */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>

          <Link
            href={`/admin/modules/Animals/Inquiries/Form?id=${idAnimal}`}
            onClick={onClose}
          >
            <Button type="button" icon={<Plus size={15} />}>
              Agregar nueva consulta
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
