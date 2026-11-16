"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
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
} from "lucide-react";

function FormularioUsuario() {
  const { palette } = useTheme();
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
      }
      router.push("/admin/modules/Users/Users");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el usuario.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition";

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <form
        onSubmit={handleSubmit}
        className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden"
      >
        <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/modules/Users/Users"
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              title="Volver al listado"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800">
                {modoEdicion ? (
                  <>
                    Edición de{" "}
                    <span style={{ color: palette.primary }}>Usuario</span>
                  </>
                ) : (
                  <>
                    Registro de{" "}
                    <span style={{ color: palette.primary }}>Nuevo Usuario</span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-500">
                {modoEdicion
                  ? "Actualiza los datos de contacto, el rol y el estado de la cuenta."
                  : "Ingresa los datos personales y las credenciales de acceso del usuario."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mt-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 my-4 overflow-hidden">
          {cargandoUsuario ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando usuario...</span>
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <User size={15} style={{ color: palette.secondary }} />
                  <span>1. Datos Personales</span>
                </h2>

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
                      onChange={(e) => setNombre(e.target.value)}
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
                    onChange={(e) => setApellido(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    El correo electrónico debe ser único y se usará para iniciar
                    sesión en el sistema.
                  </p>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Mail size={15} style={{ color: palette.secondary }} />
                  <span>2. Contacto</span>
                </h2>

                <div>
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

                <div>
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
                      onChange={(e) => setTelefono(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Shield size={15} style={{ color: palette.primary }} />
                  <span>3. Acceso y Rol</span>
                </h2>

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
                      type="password"
                      required={!modoEdicion}
                      minLength={8}
                      placeholder={
                        modoEdicion
                          ? "Dejar vacío para conservarla"
                          : "Mínimo 8 caracteres"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${inputClass} pl-8`}
                    />
                  </div>
                </div>

                {modoEdicion ? (
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
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
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      La cuenta se creará activa con la contraseña indicada.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Campos marcados con (*) son obligatorios</span>
          <span className="font-semibold text-slate-600">
            Sistema AnimalSmile
          </span>
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
