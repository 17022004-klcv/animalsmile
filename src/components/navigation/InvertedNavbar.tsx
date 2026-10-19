"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";

type UsuarioSesion = {
  email: string;
  rol: string;
};

export default function Navbar() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUsuario(
          data?.usuario
            ? { email: data.usuario.email, rol: data.usuario.rol }
            : null,
        );
      })
      .catch(() => setUsuario(null));
  }, []);

  useEffect(() => {
    if (!menuAbierto) return;

    const handleClickFuera = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, [menuAbierto]);

  const cerrarSesion = async () => {
    setMenuAbierto(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setUsuario(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="relative w-full flex justify-center z-30">
      {/* Contenedor pegado al TOP con bordes redondeados SOLO abajo */}
      <nav className="relative bg-white px-8 py-3.5 rounded-b-3xl shadow-md flex items-center justify-between gap-8 md:gap-12 curve-corner-left curve-corner-right">
        {/* Lado Izquierdo: Inicio, Sobre Nosotros, Servicios */}
        <div className="flex items-center gap-6 text-xs md:text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-[#ED019F] transition">
            Inicio
          </Link>
          <Link href="/nosotros" className="hover:text-[#ED019F] transition">
            Sobre Nosotros
          </Link>
          <Link href="/servicios" className="hover:text-[#ED019F] transition">
            Servicios
          </Link>
        </div>

        {/* Centro: Logo AnimalSmile */}
        <Link
          href="/"
          className="relative z-10 flex items-center gap-2 px-2 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img
            src="/img/logo_animalsmile.png"
            alt="AnimalSmile Logo"
            className="w-8 h-8 object-contain pointer-events-none"
          />
          <span className="font-bold text-base md:text-lg tracking-tight text-slate-800 hidden sm:inline pointer-events-none">
            Animal<span style={{ color: "#ED019F" }}>Smile</span>
          </span>
        </Link>

        {/* Lado Derecho: Rescates, Adopciones, Donar */}
        <div className="flex items-center gap-6 text-xs md:text-sm font-semibold text-slate-700">
          <Link href="/rescates" className="hover:text-[#ED019F] transition">
            Rescates
          </Link>
          <Link href="/adopciones" className="hover:text-[#ED019F] transition">
            Adopciones
          </Link>

          {usuario ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuAbierto((abierto) => !abierto)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl font-bold text-xs md:text-sm bg-white/90 text-slate-700 border border-slate-200 transition hover:border-[#ED019F] hover:text-[#ED019F] max-w-[200px]"
                title={usuario.email}
              >
                <span className="truncate">{usuario.email}</span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition-transform ${menuAbierto ? "rotate-180" : ""}`}
                />
              </button>

              {menuAbierto && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      Sesión activa
                    </p>
                    <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                      {usuario.email}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {usuario.rol.replace(/_/g, " ")}
                    </p>
                  </div>

                  {usuario.rol === "Administrador" && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuAbierto(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#FDF2F8] hover:text-[#ED019F] transition"
                    >
                      <LayoutDashboard size={14} />
                      Panel administrativo
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={cerrarSesion}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition border-2 border-[#ED019F] text-[#ED019F] hover:bg-[#ED019F] hover:text-white"
            >
              Iniciar Sesión
            </Link>
          )}

          {/* Botón Donar destacado */}
          <Link
            href="/donar"
            className="px-5 py-2 rounded-xl text-white font-bold text-xs md:text-sm transition shadow-sm hover:opacity-95"
            style={{
              background: "linear-gradient(135deg, #ED019F 0%, #FA5780 100%)",
            }}
          >
            Donar
          </Link>
        </div>
      </nav>
    </header>
  );
}
