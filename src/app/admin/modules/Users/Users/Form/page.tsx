"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";
import { Button } from "@/src/components/ui/Button";
import {
  actualizarUsuario,
  crearUsuario,
  obtenerUsuario,
} from "@/src/services/users/user-client";
import type {
  ActualizarUsuarioParcial,
  CrearUsuarioInput,
} from "@/src/services/users/user-validation";
import { DESCRIPCIONES_ROL } from "@/src/types/usuario";
import { ROLES_USUARIO, RolUsuario } from "@/src/types/enums";
import { Validaciones } from "@/src/utils/validaciones";
import {
  AlertTriangle,
  ArrowLeft,
  KeyRound,
  Loader2,
  Mail,
  Phone,
  Save,
  Shield,
  User,
  ChevronRight,
  ChevronLeft,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

function FormularioUsuario() {
  const { palette } = useTheme();
  const { mostrarToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idUsuario = searchParams.get("id");
  const modoEdicion = idUsuario !== null;

  const [cargandoUsuario, setCargandoUsuario] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState<RolUsuario>(RolUsuario.Voluntario);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (!idUsuario) return;
    let cancelado = false;

    obtenerUsuario(idUsuario)
      .then((u) => {
        if (cancelado) return;
        setNombre(u.nombre);
        setApellido(u.apellido);
        setEmail(u.email);
        setTelefono(u.telefono ?? "");
        setRol(u.rol);
        setActivo(u.activo ?? true);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el usuario.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoUsuario(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idUsuario]);

  const PASOS = [
    {
      id: "datos",
      titulo: "Datos Personales",
      descripcion: "Nombre y apellido del usuario",
      icono: User,
    },
    {
      id: "contacto",
      titulo: "Contacto",
      descripcion: "Correo electrónico y teléfono",
      icono: Mail,
    },
    {
      id: "acceso",
      titulo: "Acceso y Rol",
      descripcion: "Rol, contraseña y estado de la cuenta",
      icono: Shield,
    },
  ] as const;

  const [paso, setPaso] = useState(0);

  const validarPasoActual = (): boolean => {
    setError(null);

    if (paso === 0) {
      const errNombre = Validaciones.validarSoloLetras(nombre, "Nombre", {
        requerido: true,
        maxLength: 100,
      });
      if (errNombre) {
        setError(errNombre);
        mostrarToast(errNombre, "error");
        return false;
      }

      const errApellido = Validaciones.validarSoloLetras(apellido, "Apellido", {
        requerido: true,
        maxLength: 100,
      });
      if (errApellido) {
        setError(errApellido);
        mostrarToast(errApellido, "error");
        return false;
      }
    }

    if (paso === 1) {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        const mensaje = "Ingresa un correo electrónico válido.";
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return false;
      }

      const errTelefono = Validaciones.validarTelefono(telefono, false);
      if (errTelefono) {
        setError(errTelefono);
        mostrarToast(errTelefono, "error");
        return false;
      }
    }

    if (paso === 2) {
      // En creación la contraseña es obligatoria; en edición es opcional
      if (!modoEdicion && !password) {
        const mensaje = "La contraseña es obligatoria para crear el usuario.";
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return false;
      }

      if (password && password.length < 8) {
        const mensaje = "La contraseña debe tener al menos 8 caracteres.";
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return false;
      }

      if (password !== confirmPassword) {
        const mensaje = "Las contraseñas no coinciden.";
        setError(mensaje);
        mostrarToast(mensaje, "error");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const telefonoLimpio = telefono.trim() || null;

    try {
      if (modoEdicion && idUsuario) {
        const payload: ActualizarUsuarioParcial = {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          telefono: telefonoLimpio,
          rol,
          activo,
          ...(password ? { password } : {}),
        };
        await actualizarUsuario(idUsuario, payload);
        mostrarToast("Usuario actualizado correctamente.", "success");
      } else {
        const payload: CrearUsuarioInput = {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.trim(),
          telefono: telefonoLimpio,
          rol,
          password,
        };
        await crearUsuario(payload);
        mostrarToast("Usuario registrado correctamente.", "success");
      }
      router.push("/admin/modules/Users/Users");
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo guardar el usuario.";
      setError(mensaje);
      mostrarToast(mensaje, "error");
    } finally {
      setGuardando(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    if (paso < PASOS.length - 1) {
      e.preventDefault();
      if (validarPasoActual()) {
        setPaso((prev) => prev + 1);
      }
      return;
    }

    if (!validarPasoActual()) {
      e.preventDefault();
      return;
    }

    handleSubmit(e);
  };

  const irAPaso = (indice: number) => {
    if (indice <= paso || modoEdicion) {
      setError(null);
      setPaso(indice);
    }
  };

  const retrocederPaso = () => {
    setError(null);
    setPaso((prev) => Math.max(0, prev - 1));
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition";

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <form
        onSubmit={handleFormSubmit}
        className="anim-fade-in h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between gap-4 shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/modules/Users/Users"
              className="anim-press p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition shrink-0"
              title="Volver al listado"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-800 truncate">
                {modoEdicion ? (
                  <>
                    Edición de{" "}
                    <span style={{ color: palette.primary }}>Usuario</span>
                  </>
                ) : (
                  <>
                    Registro de{" "}
                    <span style={{ color: palette.primary }}>
                      Nuevo Usuario
                    </span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {modoEdicion
                  ? "Actualiza los datos, el rol, la contraseña y el estado de la cuenta."
                  : "Completa los pasos para registrar al usuario."}
              </p>
            </div>
          </div>

          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
            style={{
              color: palette.primary,
              backgroundColor: `${palette.primary}10`,
              border: `1px solid ${palette.primary}30`,
            }}
          >
            Paso {paso + 1} de {PASOS.length}
          </span>
        </div>

        {/* Stepper horizontal */}
        <div className="anim-fade-up delay-1 shrink-0 pt-5">
          <ol className="flex items-center gap-2 sm:gap-3">
            {PASOS.map((p, indice) => {
              const activo = indice === paso;
              const completado = indice < paso;
              const habilitado = indice <= paso || modoEdicion;
              const Icono = p.icono;

              return (
                <li
                  key={p.id}
                  className="flex items-center gap-2 sm:gap-3 flex-1 last:flex-none min-w-0"
                >
                  <button
                    type="button"
                    onClick={() => irAPaso(indice)}
                    disabled={!habilitado}
                    aria-current={activo ? "step" : undefined}
                    className={`anim-press flex items-center gap-2.5 rounded-2xl px-1.5 py-1.5 transition text-left min-w-0 ${
                      habilitado
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center border text-xs font-black shrink-0 transition"
                      style={{
                        backgroundColor:
                          completado || activo ? palette.primary : "#ffffff",
                        borderColor:
                          completado || activo ? palette.primary : "#e2e8f0",
                        color: completado || activo ? "#ffffff" : "#94a3b8",
                      }}
                    >
                      {completado ? <Check size={15} /> : <Icono size={15} />}
                    </span>
                    <span className="hidden sm:block min-w-0">
                      <span
                        className="block text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: activo ? palette.primary : "#94a3b8",
                        }}
                      >
                        Paso {indice + 1}
                      </span>
                      <span
                        className={`block text-xs font-bold truncate ${
                          activo ? "text-slate-800" : "text-slate-500"
                        }`}
                      >
                        {p.titulo}
                      </span>
                    </span>
                  </button>

                  {indice < PASOS.length - 1 && (
                    <span
                      className="flex-1 h-0.5 rounded-full transition-colors"
                      style={{
                        backgroundColor: completado
                          ? palette.primary
                          : "#e2e8f0",
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mt-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Contenedor central con scroll interno */}
        <div className="flex-1 min-h-0 my-4 overflow-y-auto pr-1">
          {cargandoUsuario ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando usuario...</span>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-5 py-1">
              {/* PASO 1: DATOS PERSONALES */}
              {paso === 0 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.secondary}12`,
                        color: palette.secondary,
                      }}
                    >
                      <User size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Datos personales
                      </h2>
                      <p className="text-xs text-slate-500">
                        Registra el nombre y apellido del usuario del sistema.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre *
                      </label>
                      <div className="relative">
                        <User
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Ej. Ana"
                          value={nombre}
                          onChange={(e) =>
                            setNombre(
                              Validaciones.formatearSoloLetras(
                                e.target.value,
                                100,
                              ),
                            )
                          }
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Martínez"
                        value={apellido}
                        onChange={(e) =>
                          setApellido(
                            Validaciones.formatearSoloLetras(
                              e.target.value,
                              100,
                            ),
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="anim-fade-up delay-4 sm:col-span-2 p-3 bg-white rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        El correo electrónico debe ser único y se usará para
                        iniciar sesión en el sistema.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* PASO 2: CONTACTO */}
              {paso === 1 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.primary}12`,
                        color: palette.primary,
                      }}
                    >
                      <Mail size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Datos de contacto
                      </h2>
                      <p className="text-xs text-slate-500">
                        Correo electrónico y teléfono del usuario.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo Electrónico *
                      </label>
                      <div className="relative">
                        <Mail
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="email"
                          required
                          placeholder="usuario@animalsmile.org"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="tel"
                          placeholder="+503 7000-0000"
                          value={telefono}
                          onChange={(e) =>
                            setTelefono(
                              Validaciones.formatearTelefono(e.target.value),
                            )
                          }
                          className={`${inputClass} pl-8`}
                        />
                      </div>
                    </div>

                    <div className="anim-fade-up delay-4 sm:col-span-2 p-3 bg-white rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        El correo electrónico debe ser único en el sistema y se
                        usa como credencial de acceso.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* PASO 3: ACCESO Y ROL */}
              {paso === 2 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.dark}12`,
                        color: palette.dark,
                      }}
                    >
                      <Shield size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Acceso y rol
                      </h2>
                      <p className="text-xs text-slate-500">
                        Define el rol, la contraseña y el estado de la cuenta.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
                    {/* Rol */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Rol *
                      </label>
                      <select
                        value={rol}
                        onChange={(e) => setRol(e.target.value as RolUsuario)}
                        className={inputClass}
                        required
                      >
                        {ROLES_USUARIO.map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                      </select>
                      <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                        {DESCRIPCIONES_ROL[rol]}
                      </p>
                    </div>

                    {/* Contraseña */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {modoEdicion ? "Nueva Contraseña" : "Contraseña *"}
                        </label>
                        <div className="relative">
                          <KeyRound
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type={mostrarPassword ? "text" : "password"}
                            required={!modoEdicion}
                            minLength={8}
                            placeholder={
                              modoEdicion
                                ? "Dejar vacío para conservarla"
                                : "Mínimo 8 caracteres"
                            }
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${inputClass} pl-8 pr-9`}
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarPassword((v) => !v)}
                            className="anim-press absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
                            title={
                              mostrarPassword
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                            }
                          >
                            {mostrarPassword ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Confirmar Contraseña
                        </label>
                        <div className="relative">
                          <KeyRound
                            size={13}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type={mostrarConfirmPassword ? "text" : "password"}
                            required={!modoEdicion || password.length > 0}
                            minLength={8}
                            placeholder="Repite la contraseña"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`${inputClass} pl-8 pr-9`}
                          />
                          <button
                            type="button"
                            onClick={() => setMostrarConfirmPassword((v) => !v)}
                            className="anim-press absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
                            title={
                              mostrarConfirmPassword
                                ? "Ocultar contraseña"
                                : "Mostrar contraseña"
                            }
                          >
                            {mostrarConfirmPassword ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="anim-fade-up delay-4 p-3 bg-white rounded-xl border border-slate-200">
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {modoEdicion
                          ? "Si dejas la contraseña vacía, se conservará la actual. Si la cambias, debe tener al menos 8 caracteres."
                          : "La cuenta se creará activa con la contraseña indicada (mínimo 8 caracteres)."}
                      </p>
                    </div>

                    {/* Estado de cuenta (solo en edición) */}
                    {modoEdicion ? (
                      <div className="anim-fade-up delay-4 p-4 bg-white rounded-xl border border-slate-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activo}
                            onChange={(e) => setActivo(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 accent-[var(--color-primary)] cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-700">
                            Cuenta activa
                          </span>
                        </label>
                        <p className="mt-2 text-[11px] text-slate-400 leading-relaxed">
                          Los usuarios inactivos no pueden iniciar sesión.
                        </p>
                      </div>
                    ) : (
                      <div className="anim-fade-up delay-4 p-4 bg-white rounded-xl border border-slate-200">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          La cuenta se creará con estado{" "}
                          <span className="font-bold text-emerald-600">
                            activo
                          </span>{" "}
                          por defecto.
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer de Navegación */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:block">
            {paso === 0
              ? "Los campos marcados con (*) son obligatorios."
              : `Paso ${paso + 1} de ${PASOS.length} · ${PASOS[paso].descripcion}`}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {paso > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={retrocederPaso}
                disabled={guardando}
                icon={<ChevronLeft size={15} />}
              >
                Anterior
              </Button>
            )}

            {paso < PASOS.length - 1 ? (
              <Button
                type="submit"
                disabled={cargandoUsuario}
                icon={<ChevronRight size={15} />}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={guardando || cargandoUsuario}
                icon={
                  guardando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )
                }
              >
                {modoEdicion ? "Guardar Cambios" : "Guardar Registro"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function UsuarioFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando formulario...</span>
        </div>
      }
    >
      <FormularioUsuario />
    </Suspense>
  );
}
