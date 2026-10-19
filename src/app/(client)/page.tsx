"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  ShieldCheck,
  PawPrint,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HeroSection() {
  return (
    <div className="space-y-12">
      {/* SECCIÓN HERO PRINCIPAL */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-6 md:p-12 backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado Izquierdo: Textos y Llamados a la Acción */}
          <div className="lg:col-span-7 space-y-6 text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ED019F]/10 border border-[#ED019F]/30 text-[#ED019F] text-xs font-bold">
              <Sparkles size={14} />
              <span>Transformando vidas todos los días</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Dales una segunda oportunidad a quien{" "}
              <span className="bg-gradient-to-r from-[#ED019F] via-[#FA5780] to-[#ea7644] bg-clip-text text-transparent">
                más lo necesita
              </span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
              En <strong>AnimalSmile</strong> rescatamos, rehabilitamos y
              cuidamos a perros, gatos y especies en situación de riesgo. Con tu
              apoyo, cada huella encuentra un hogar lleno de amor.
            </p>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/adopciones"
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-95"
                style={{
                  background:
                    "linear-gradient(135deg, #ED019F 0%, #FA5780 100%)",
                }}
              >
                <Heart size={18} className="fill-white" />
                <span>Quiero Adoptar</span>
              </Link>

              <Link
                href="/donar"
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-white font-bold text-sm bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-200"
              >
                <span>Apoyar un Rescate</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Métricas destacadas */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-slate-300">
              <div>
                <p className="text-2xl font-black text-white">+1,200</p>
                <p className="text-xs text-slate-400 font-medium">
                  Rescates Exitosos
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">98%</p>
                <p className="text-xs text-slate-400 font-medium">
                  Adopciones Felices
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">24/7</p>
                <p className="text-xs text-slate-400 font-medium">
                  Atención y Cuidado
                </p>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Collage de Imágenes con Cuidadores y Rescates */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Resplandor decorativo de fondo */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#ED019F]/20 to-[#727EFF]/20 blur-3xl rounded-full -z-10" />

            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {/* Foto 1: Cuidadora abrazando a perro rescatado */}
              <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl h-48 md:h-56">
                <img
                  src="https://www.campustraining.es/wp-content/uploads/2023/05/sueldo-cuidador-animales-zoologico.jpg.webp"
                  alt="Cuidadora con perro rescatado"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-3 flex items-end">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <PawPrint size={12} className="text-[#ED019F]" /> Amor y
                    Rehabilitación
                  </span>
                </div>
              </div>

              {/* Foto 2: Voluntario rescatando a un cachorro */}
              <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl h-48 md:h-56 translate-y-4">
                <img
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
                  alt="Rescate y juego en el santuario"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-3 flex items-end">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <ShieldCheck size={12} className="text-[#727EFF]" /> Refugio
                    Seguro
                  </span>
                </div>
              </div>

              {/* Foto 3: Perrito en consulta médica / cuidados */}
              <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl h-44 md:h-48 col-span-2">
                <img
                  src="https://www.avanzaentucarrera.com/orientacion/comp/uploads/2014/02/cuidador-zoo-1024x543.jpg"
                  alt="Atención médica y cuidador"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-3 flex items-end">
                  <span className="text-[11px] font-bold text-white flex items-center gap-1">
                    <Heart size={12} className="text-[#FA5780]" /> Equipo
                    veterinario comprometido
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
