"use client";

import React from "react";
import Link from "next/link";
import {
  Heart,
  ShieldCheck,
  PawPrint,
  Sparkles,
  Calendar,
  Clock,
  Activity,
  Stethoscope,
  Home,
  Syringe,
  CheckCircle2,
} from "lucide-react";
import { useSiteTheme } from "@/src/context/ThemeContext";
import {
  leerConfiguracionSitio,
  parsearGaleriaSitio,
} from "@/src/services/config/site-config";

export default function RefugioLandingPage() {
  const { sitePalette, sitioConfig } = useSiteTheme();
  const leer = (clave: string) => leerConfiguracionSitio(sitioConfig, clave);
  const imagenes = parsearGaleriaSitio(leer("inicio_imagenes"));

  const estadisticas = [
    { valor: "398,235", etiqueta: "Consultas y Rescates", fecha: "JULIO 2025" },
    {
      valor: "222,322",
      etiqueta: "Emergencias Atendidas",
      fecha: "JULIO 2025",
    },
    { valor: "176,777", etiqueta: "Mascotas Cobijadas", fecha: "JULIO 2025" },
    {
      valor: "61,759",
      etiqueta: "Esterilizaciones Realizadas",
      fecha: "JULIO 2025",
    },
  ];

  return (
    <div className="w-full">
      {/* 1. HERO PRINCIPAL (Más compacto, ancho completo + Ola inferior) */}
      <section className="relative w-full overflow-hidden bg-[#1e293b] text-white pt-24 pb-24 md:pt-28 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado Izquierdo */}
          <div className="lg:col-span-6 space-y-4 z-10">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold"
              style={{
                color: sitePalette.primary || "#10b981",
                backgroundColor: `${sitePalette.primary || "#10b981"}1A`,
                borderColor: `${sitePalette.primary || "#10b981"}4D`,
              }}
            >
              <Sparkles size={14} />
              <span>{leer("inicio_etiqueta") || "Refugio de Animales"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {leer("inicio_titulo") || "Dales una segunda oportunidad a"}{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${sitePalette.primary || "#34d399"}, ${sitePalette.accent || "#38bdf8"})`,
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {leer("inicio_titulo_destacado") || "quien más lo necesita"}
              </span>
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
              {leer("inicio_descripcion") ||
                "Dedicados a rescatar, rehabilitar y encontrar un hogar amoroso para animales en situación de calle o vulnerabilidad."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/adopciones"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm bg-emerald-500 hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:scale-105"
              >
                <Heart size={16} className="fill-white" />
                <span>{leer("inicio_cta_primario") || "Adopta Hoy"}</span>
              </Link>
            </div>
          </div>

          {/* Lado Derecho: Imagen más compacta */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="absolute -top-6 -right-6 w-56 h-56 md:w-72 md:h-72 bg-emerald-400 rounded-full blur-sm opacity-90 z-0" />
            <div className="absolute -bottom-4 left-6 w-36 h-36 bg-teal-300 rounded-full z-0 opacity-80" />

            <div className="relative z-10 overflow-hidden rounded-3xl border-4 border-white/20 shadow-2xl max-w-sm w-full bg-slate-800">
              {imagenes[0] ? (
                <img
                  src={imagenes[0]}
                  alt="Instalaciones del Refugio"
                  className="w-full h-64 md:h-72 object-cover object-center"
                />
              ) : (
                <div className="w-full h-64 md:h-72 flex flex-col items-center justify-center bg-gradient-to-tr from-emerald-600 to-teal-800 text-white p-6">
                  <Home size={52} className="mb-3 opacity-80" />
                  <p className="text-lg font-bold">Nuestro Santuario</p>
                  <p className="text-xs text-emerald-100 text-center mt-1.5">
                    Espacios adecuados y seguros para el bienestar animal.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OLA INFERIOR MÁS DELGADA */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative block w-full h-12 sm:h-16 md:h-20"
            preserveAspectRatio="none"
          >
            <path
              d="M0,48 C360,120 720,10 1080,64 C1260,90 1380,60 1440,48 L1440,120 L0,120 Z"
              className="fill-white"
            />
          </svg>
        </div>
      </section>

      {/* 2. SECCIÓN: CARDS DE SERVICIOS -> FONDO BLANCO PURO (bg-white) */}
      <section className="w-full bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-center">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              Cuidamos con amor la salud de tu futura mascota
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              Nuestro refugio ofrece atención veterinaria integral, alimentación
              de calidad y programas de socialización. Trabajamos para
              transformar la vida de los animales rescatados y promover la
              adopción responsable.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {/* Card 1 */}
            <div className="relative overflow-hidden rounded-3xl bg-teal-500 text-white p-6 text-left shadow-lg flex flex-col justify-between min-h-[220px] group">
              <div className="z-10 space-y-1">
                <h3 className="text-3xl font-black">+4.5</h3>
                <p className="text-xs text-teal-100 font-semibold uppercase tracking-wider">
                  Millones
                </p>
                <p className="text-sm font-bold pt-4">Servicios Atendidos</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-400 rounded-full transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute bottom-0 right-2 z-10 w-24 h-24 flex items-center justify-center">
                <PawPrint
                  size={64}
                  className="text-slate-900 drop-shadow-md rotate-12"
                />
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative overflow-hidden rounded-3xl bg-teal-500 text-white p-6 text-left shadow-lg flex flex-col justify-between min-h-[220px] group">
              <div className="z-10 space-y-1">
                <h3 className="text-3xl font-black">24/7</h3>
                <p className="text-sm font-bold pt-6">
                  Atención en Emergencias
                </p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-rose-500 rounded-full transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute bottom-2 right-4 z-10 w-24 h-24 flex items-center justify-center">
                <ShieldCheck
                  size={64}
                  className="text-white drop-shadow-md -rotate-6"
                />
              </div>
            </div>

            {/* Card 3 */}
            <div className="relative overflow-hidden rounded-3xl bg-teal-500 text-white p-6 text-left shadow-lg flex flex-col justify-between min-h-[220px] group">
              <div className="z-10 space-y-1">
                <h3 className="text-3xl font-black">$0.00</h3>
                <p className="text-xs text-teal-100 font-medium">
                  Costo por Adopción Directa
                </p>
                <p className="text-sm font-bold pt-4">Adopción Responsable</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-600 rounded-full transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute bottom-2 right-2 z-10 w-24 h-24 flex items-center justify-center">
                <Heart
                  size={60}
                  className="text-white fill-white drop-shadow-md"
                />
              </div>
            </div>

            {/* Card 4 */}
            <div className="relative overflow-hidden rounded-3xl bg-teal-500 text-white p-6 text-left shadow-lg flex flex-col justify-between min-h-[220px] group">
              <div className="z-10 space-y-1">
                <h3 className="text-3xl font-black">+110</h3>
                <p className="text-xs text-teal-100 font-semibold uppercase tracking-wider">
                  Voluntarios
                </p>
                <p className="text-sm font-bold pt-4">Cuidando de ellos</p>
              </div>
              <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-indigo-900 rounded-full transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute bottom-2 right-2 z-10 w-24 h-24 flex items-center justify-center">
                <Stethoscope
                  size={60}
                  className="text-indigo-200 drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: BANNER PROMOCIONAL -> FONDO TURQUESA SUAVE (bg-teal-100/70) */}
      <section className="relative w-full overflow-hidden bg-teal-100/70 border-y border-teal-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left z-10 max-w-xl">
            <h3 className="text-3xl md:text-4xl font-extrabold text-teal-950">
              Cuida su salud, protege su futuro.
            </h3>
            <p className="text-2xl md:text-3xl font-black text-teal-700">
              ¡Esteriliza a tus mascotas!
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-center">
            <div className="relative w-48 h-48 bg-white/70 rounded-full p-4 border-4 border-white shadow-xl flex items-center justify-center">
              <Syringe className="w-24 h-24 text-teal-700 rotate-45" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN: ESTADÍSTICAS -> FONDO GRIS CLARO / PIZARRA (bg-slate-50) */}
      <section className="w-full bg-slate-50 py-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 opacity-75">
            {[
              Home,
              PawPrint,
              Activity,
              Stethoscope,
              Syringe,
              Heart,
              ShieldCheck,
            ].map((Icon, idx) => (
              <div
                key={idx}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"
              >
                <Icon size={24} />
              </div>
            ))}
          </div>

          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Nuestros logros en cifras
            </h2>
            <p className="text-xs md:text-sm text-slate-500">
              Cada rescate representa una historia, una vida salvada y una
              familia acompañada.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {estadisticas.map((item, index) => (
              <div
                key={index}
                className="bg-white border-2 border-emerald-500/20 shadow-sm rounded-2xl p-6 text-center space-y-2 transition-transform hover:-translate-y-1"
              >
                <p className="text-3xl md:text-4xl font-black text-emerald-600">
                  {item.valor}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {item.etiqueta}
                </p>
                <span className="inline-block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  ACTUALIZADO: {item.fecha}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN: HORARIOS -> FONDO CELESTE MUY SUAVE (bg-sky-50/70) */}
      <section className="w-full bg-sky-50/70 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center">
            Horarios de atención
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-8 space-y-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xl">
                <Calendar className="w-6 h-6" />
                <h3>Consulta Externa y Adopciones</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Atendemos todos los días únicamente con cita previa. Agenda tu
                visita o llámanos si necesitas orientación sobre los procesos de
                adopción o donación.
              </p>
              <div className="pt-2 text-slate-800 font-bold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Horario de atención: 7:00 a.m. a 8:30 p.m.</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 space-y-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="inline-flex items-center gap-2 text-rose-600 font-bold text-xl">
                <Activity className="w-6 h-6" />
                <h3>Emergencias Rescates</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                Atención todos los días, las 24 horas del día para reporte de
                rescates o urgencias médicas veterinarias. La atención se brinda
                según el nivel de urgencia.
              </p>
              <div className="pt-2 text-slate-800 font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-600" />
                <span>Disponible las 24 horas</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
