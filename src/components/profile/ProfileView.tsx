"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import {
  fechaCorta,
  formatearEstado,
} from "@/src/services/animals/animal-format";
import { cambiarMiContrasena } from "@/src/services/users/user-client";
import type { PerfilUsuario } from "@/src/types/usuario";
import { Modal } from "@/src/components/ui/Modal";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
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

  // --- Estados para el cambio de contraseña ---
  const [modalPasswordOpen, setModalPasswordOpen] = useState(false);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState<string | null>(null);
  const [exitoPassword, setExitoPassword] = useState<string | null>(null);

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

  // --- Función para guardar la contraseña ---
  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPassword(null);
    setExitoPassword(null);

    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      setErrorPassword("Todos los campos son obligatorios.");
      return;
    }

    if (passwordNueva.length < 8) {
      setErrorPassword("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (passwordNueva !== passwordConfirmar) {
      setErrorPassword("Las contraseñas nuevas no coinciden.");
      return;
    }

    setGuardandoPassword(true);

    try {
      // LLAMADA REAL AL BACKEND
      await cambiarMiContrasena({
        passwordActual,
        passwordNueva,
      });

      setExitoPassword("¡Contraseña actualizada correctamente!");
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirmar("");

      // Cerrar modal después de 2.5 segundos
      setTimeout(() => {
        setModalPasswordOpen(false);
        setExitoPassword(null);
      }, 2500);
    } catch (err) {
      setErrorPassword(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar la contraseña.",
      );
    } finally {
      setGuardandoPassword(false);
    }
  };

  return (
    <div className="anim-fade-in h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="anim-fade-up delay-1 h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col overflow-hidden">
        <div className="anim-fade-up delay-2 flex items-center justify-between shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="anim-press p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
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
                className="anim-press px-4 py-2 rounded-xl text-white text-xs font-bold transition hover:opacity-90"
                style={{ backgroundColor: palette.primary }}
              >
                Reintentar
              </button>
            </div>
          ) : perfil ? (
            <div className="anim-fade-up delay-3 h-full grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 overflow-hidden">
              <div className="flex flex-col gap-4 min-h-0">
                <div
                  className="anim-fade-up delay-4 relative overflow-hidden rounded-2xl p-5 text-white shadow-sm"
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

                <div className="anim-fade-up delay-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
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

                {/* BOTÓN DE CAMBIAR CONTRASEÑA */}
                <button
                  onClick={() => setModalPasswordOpen(true)}
                  className="anim-press w-full flex items-center justify-center gap-2 p-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition shadow-2xs group"
                >
                  <KeyRound
                    size={16}
                    className="text-slate-400 group-hover:text-slate-600 transition-colors"
                  />
                  Cambiar Contraseña
                </button>
              </div>

              <div className="flex flex-col min-h-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-3">
                  <Shield size={15} style={{ color: palette.secondary }} />
                  Información de la cuenta
                </h3>

                <div className="anim-fade-up delay-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div className="anim-fade-up delay-6 mt-auto pt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Tu información de perfil es administrada por el equipo del
                    sistema. Si necesitas actualizar tus datos de contacto,
                    ponte en contacto con un administrador.
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

      {/* MODAL DE CAMBIO DE CONTRASEÑA */}
      <Modal
        open={modalPasswordOpen}
        onClose={() => {
          setModalPasswordOpen(false);
          setErrorPassword(null);
          setExitoPassword(null);
          setPasswordActual("");
          setPasswordNueva("");
          setPasswordConfirmar("");
        }}
        title={
          <span className="flex items-center gap-2">
            <KeyRound size={18} style={{ color: palette.primary }} />
            Cambiar Contraseña
          </span>
        }
      >
        <form onSubmit={handleCambiarPassword} className="space-y-4 text-xs">
          {errorPassword && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold">
              <AlertTriangle size={14} className="shrink-0" />
              {errorPassword}
            </div>
          )}

          {exitoPassword && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 font-semibold">
              <CheckCircle2 size={14} className="shrink-0" />
              {exitoPassword}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Contraseña Actual *
            </label>
            <div className="relative">
              <KeyRound
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={mostrarActual ? "text" : "password"}
                required
                placeholder="Ingresa tu contraseña actual"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[var(--color-primary)] transition"
              />
              <button
                type="button"
                onClick={() => setMostrarActual(!mostrarActual)}
                className="anim-press absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {mostrarActual ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nueva Contraseña *
            </label>
            <div className="relative">
              <KeyRound
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={mostrarNueva ? "text" : "password"}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[var(--color-primary)] transition"
              />
              <button
                type="button"
                onClick={() => setMostrarNueva(!mostrarNueva)}
                className="anim-press absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {mostrarNueva ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Confirmar Nueva Contraseña *
            </label>
            <div className="relative">
              <KeyRound
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={mostrarConfirmar ? "text" : "password"}
                required
                minLength={8}
                placeholder="Repite tu nueva contraseña"
                value={passwordConfirmar}
                onChange={(e) => setPasswordConfirmar(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[var(--color-primary)] transition"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="anim-press absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {mostrarConfirmar ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalPasswordOpen(false)}
              className="anim-press px-4 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardandoPassword}
              className="anim-press flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold shadow-sm transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: palette.primary }}
            >
              {guardandoPassword ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <KeyRound size={15} />
              )}
              {guardandoPassword ? "Guardando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
