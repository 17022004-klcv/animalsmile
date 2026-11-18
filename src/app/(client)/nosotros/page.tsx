"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  ShieldCheck,
  PawPrint,
  Users,
  Target,
  Eye,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useSiteTheme } from "@/src/context/ThemeContext";
import {
  leerConfiguracionSitio,
  parsearGaleriaSitio,
} from "@/src/services/config/site-config";

export default function SobreNosotrosSection() {
  const { sitePalette, sitioConfig } = useSiteTheme();
  const leer = (clave: string) => leerConfiguracionSitio(sitioConfig, clave);
  const imagenes = parsearGaleriaSitio(leer("nosotros_hero_imagenes"));

  const valores = [
    {
      titulo: "Compasión y Respeto",
      descripcion:
        "Tratamos a cada animal con amor incondicional, dignidad y el respeto que merecen tras situaciones difíciles.",
      icono: <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />,
      colorFondo: "bg-white border-rose-200/80",
    },
    {
      titulo: "Compromiso 24/7",
      descripcion:
        "Nuestros rescatistas y veterinarios están disponibles de forma continua para emergencias y cuidados intensivos.",
      icono: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      colorFondo: "bg-white border-emerald-200/80",
    },
    {
      titulo: "Adopción Responsable",
      descripcion:
        "Garantizamos un riguroso proceso de emparejamiento para asegurar que cada mascota encuentre el hogar ideal para toda la vida.",
      icono: <PawPrint className="w-6 h-6 text-teal-600" />,
      colorFondo: "bg-white border-teal-200/80",
    },
    {
      titulo: "Comunidad y Educación",
      descripcion:
        "Fomentamos la esterilización, el cuidado preventivo y la concientización contra el maltrato animal.",
      icono: <Users className="w-6 h-6 text-blue-600" />,
      colorFondo: "bg-white border-blue-200/80",
    },
  ];

  return (
    <div className="w-full">
      {/* 1. HERO / ENCABEZADO (Ancho completo + Compacto + Ola blanca abajo) */}
      <section className="relative w-full overflow-hidden bg-[#1e293b] text-white pt-24 pb-24 md:pt-28 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado Izquierdo: Textos */}
          <div className="lg:col-span-7 space-y-4 z-10 anim-fade-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold anim-fade-in delay-1"
              style={{
                color: sitePalette.primary || "#10b981",
                backgroundColor: `${sitePalette.primary || "#10b981"}1A`,
                borderColor: `${sitePalette.primary || "#10b981"}4D`,
              }}
            >
              <Sparkles size={14} />
              <span>{leer("nosotros_hero_etiqueta")}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight anim-scale-in delay-5">
              {leer("nosotros_hero_titulo")}{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${sitePalette.primary || "#34d399"}, ${sitePalette.accent || "#38bdf8"})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {leer("nosotros_hero_titulo_destacado")}
              </span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl whitespace-pre-line">
              {leer("nosotros_hero_descripcion")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-lg">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-xs md:text-sm font-semibold text-slate-200">
                  Rescate y Rehabilitación
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-xs md:text-sm font-semibold text-slate-200">
                  Asistencia Veterinaria
                </span>
              </div>
            </div>
          </div>

          {/* Lado Derecho: Imagen con Marco de Relieve */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            <div className="absolute -top-6 -right-6 w-56 h-56 md:w-64 md:h-64 bg-emerald-500 rounded-full blur-sm opacity-90 z-0 anim-float" />
            <div className="absolute -bottom-4 left-4 w-36 h-36 bg-teal-400 rounded-full z-0 opacity-80 anim-float" />

            <div className="relative z-10 overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl max-w-sm w-full bg-slate-800 anim-zoom-img anim-fade-up delay-2">
              {imagenes[0] ? (
                <img
                  src={imagenes[0]}
                  alt="Equipo del refugio cuidando animales"
                  className="w-full h-64 md:h-72 object-cover"
                />
              ) : (
                <div className="w-full h-64 md:h-72 flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-800 text-white p-6">
                  <PawPrint size={52} className="mb-3 opacity-80" />
                  <p className="text-lg font-bold">Amor en Acción</p>
                  <p className="text-xs text-emerald-100 text-center mt-1.5">
                    Voluntarios y rescatistas dedicados al bienestar animal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OLA INFERIOR (Conecta con el bg-white de Misión y Visión) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            viewBox="0 0 1440 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative block w-full h-10 sm:h-14 md:h-16"
            preserveAspectRatio="none"
          >
            <path
              d="M0,36 C360,90 720,8 1080,48 C1260,68 1380,45 1440,36 L1440,90 L0,90 Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      {/* 2. MISIÓN Y VISIÓN -> FONDO BLANCO (bg-white) */}
      <section className="w-full bg-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Misión */}
          <div className="relative overflow-hidden rounded-3xl bg-teal-500 text-white p-7 md:p-8 shadow-lg flex flex-col justify-between group min-h-[220px] anim-hover-lift anim-slide-left">
            <div className="z-10 space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Target size={22} />
              </div>
              <h3 className="text-xl md:text-2xl font-black">
                {leer("nosotros_mision_titulo")}
              </h3>
              <p className="text-teal-50 text-sm leading-relaxed whitespace-pre-line">
                {leer("nosotros_mision_descripcion")}
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600 rounded-full transition-transform group-hover:scale-110 duration-300 z-0" />
          </div>

          {/* Visión */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-800 text-white p-7 md:p-8 shadow-lg flex flex-col justify-between group min-h-[220px] anim-hover-lift anim-slide-right delay-1">
            <div className="z-10 space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 anim-scale-in delay-6">
                <Eye size={22} />
              </div>
              <h3 className="text-xl md:text-2xl font-black">
                {leer("nosotros_vision_titulo")}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {leer("nosotros_vision_descripcion")}
              </p>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-teal-700/50 rounded-full transition-transform group-hover:scale-110 duration-300 z-0" />
          </div>
        </div>
      </section>

      {/* 3. VALORES CLAVE -> FONDO GRIS PIZARRA SUAVE (bg-slate-50) */}
      <section className="w-full bg-slate-50 border-y border-slate-200/60 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 anim-fade-up">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {leer("nosotros_valores_titulo")}
            </h2>
            <p className="text-slate-600 text-sm md:text-base whitespace-pre-line">
              {leer("nosotros_valores_subtitulo")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {valores.map((val, index) => (
              <div
                key={index}
                className={`rounded-3xl p-5 border ${val.colorFondo} shadow-sm space-y-3 transition-transform hover:-translate-y-1 anim-hover-lift anim-fade-up delay-${index + 1}`}
              >
                <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center">
                  {val.icono}
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                  {val.titulo}
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  {val.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LLAMADO A LA ACCIÓN -> FRANJA DE ANCHO COMPLETO DEGRADADA */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 text-white py-12 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 z-10 max-w-xl text-center md:text-left anim-fade-up">
            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              <Award size={14} />
              <span>Suma tu talento</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold">
              {leer("nosotros_cta_titulo")}
            </h3>
            <p className="text-emerald-100 text-sm md:text-base whitespace-pre-line">
              {leer("nosotros_cta_descripcion")}
            </p>
          </div>

          <div className="z-10 flex flex-wrap justify-center items-center gap-3 anim-fade-up delay-2">
            <Link
              href="/voluntariado"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-emerald-950 font-bold text-sm bg-white hover:bg-emerald-50 transition-all shadow-lg hover:scale-105 anim-press"
            >
              <span>Quiero ser voluntario</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/donar"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-sm bg-emerald-800/60 hover:bg-emerald-800 border border-white/20 transition-all anim-press"
            >
              <Heart size={16} className="fill-white" />
              <span>Hacer una donación</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
