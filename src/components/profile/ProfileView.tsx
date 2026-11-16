"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { fechaCorta, formatearEstado } from "@/src/services/animals/animal-format";
import type { PerfilUsuario } from "@/src/types/usuario";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Fingerprint,
  Loader2,
  Mail,
  Phone,
  Shield,
  User,
  XCircle,
} from "lucide-react";

export function ProfileView() {
  const { palette } = useTheme();

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let cancelado = false;

    fetch("/api/auth/me")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error ?? "No se pudo cargar el perfil.");
        }
        return data.usuario as PerfilUsuario;
      })
      .then((usuario) => {
        if (cancelado) return;
        setPerfil(usuario);
        setError(null);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(
          err instanceof Error ? err.message : "No se pudo cargar el perfil.",
        );
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [intento]);

  const reintentar = () => {
    setCargando(true);
    setError(null);
    setIntento((valor) => valor + 1);
  };

  const iniciales = perfil
    ? `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`.toUpperCase()
    : "U";

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col overflow-hidden">
        <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              title="Volver al panel"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800">
                Mi <span style={{ color: palette.primary }}>Perfil</span>
              </h1>
              <p className="text-xs text-slate-500">
                Consulta la información de tu cuenta en AnimalSmile.
              </p>
            </div>
          </div>

          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
            style={{
              color: palette.primary,
              backgroundColor: `${palette.primary}12`,
              border: `1px solid ${palette.primary}30`,
            }}
          >
            <User size={12} />
            Cuenta de administrador
          </span>
        </div>

        <div className="flex-1 min-h-0 py-5 overflow-hidden">
          {cargando && !perfil ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando perfil...</span>
            </div>
          ) : error && !perfil ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
              <span className="w-11 h-11 rounded-full flex items-center justify-center bg-red-50 text-red-500">
                <AlertTriangle size={20} />
              </span>
              <p className="text-xs font-semibold text-red-600 max-w-xs">
                {error}
              </p>
              <button
                onClick={reintentar}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold transition hover:opacity-90"
                style={{ backgroundColor: palette.primary }}
              >
                Reintentar
              </button>
            </div>
          ) : perfil ? (
            <div className="h-full grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 overflow-hidden">
              <div className="flex flex-col gap-4 min-h-0">
                <div
                  className="relative overflow-hidden rounded-2xl p-5 text-white shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                  }}
                >
                  <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
                  <div className="absolute -right-2 -bottom-14 w-28 h-28 rounded-full bg-white/10" />

                  <div className="relative flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/20 border-2 border-white/40 text-3xl font-black">
                      {iniciales}
                    </div>
                    <h2 className="mt-3 text-lg font-black leading-tight">
                      {perfil.nombre} {perfil.apellido}
                    </h2>
                    <p className="text-xs font-medium text-white/80 break-all">
                      {perfil.email}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-[10px] font-bold uppercase tracking-wide">
                      <Shield size={10} />
                      {formatearEstado(perfil.rol)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    {perfil.activo === false ? (
                      <XCircle size={11} />
                    ) : (
                      <CheckCircle2 size={11} />
                    )}
                    Estado de la cuenta
                  </p>
                  <p
                    className={`font-bold text-xs mt-0.5 ${
                      perfil.activo === false
                        ? "text-red-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {perfil.activo === false ? "Inactiva" : "Activa"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col min-h-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                  <Shield size={15} style={{ color: palette.secondary }} />
                  Información de la cuenta
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Mail size={11} /> Correo electrónico
                    </span>
                    <p className="font-semibold text-slate-800 text-xs mt-1 truncate">
                      {perfil.email}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Phone size={11} /> Teléfono
                    </span>
                    <p className="font-semibold text-slate-800 text-xs mt-1">
                      {perfil.telefono ?? "No registrado"}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Shield size={11} /> Rol en el sistema
                    </span>
                    <p className="font-semibold text-slate-800 text-xs mt-1">
                      {formatearEstado(perfil.rol)}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Calendar size={11} /> Miembro desde
                    </span>
                    <p className="font-semibold text-slate-800 text-xs mt-1">
                      {fechaCorta(perfil.creado_en)}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Fingerprint size={11} /> Identificador de usuario
                    </span>
                    <p className="font-mono font-semibold text-slate-600 text-[10px] mt-1 break-all">
                      {perfil.id}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tu información de perfil es administrada por el equipo del
                    sistema. Si necesitas actualizar tus datos de contacto, ponte
                    en contacto con un administrador.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Sesión autenticada con AnimalSmile</span>
          <span className="font-semibold text-slate-600">
            Sistema AnimalSmile
          </span>
        </div>
      </div>
    </div>
  );
}
