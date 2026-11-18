"use client";

import React from "react";
import Link from "next/link";
import {
  Stethoscope,
  Scissors,
  Activity,
  HeartPulse,
  Syringe,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useSiteTheme } from "@/src/context/ThemeContext";
import {
  leerConfiguracionSitio,
  parsearGaleriaSitio,
} from "@/src/services/config/site-config";

export default function ServiciosSection() {
  const { sitePalette, sitioConfig } = useSiteTheme();
  const leer = (clave: string) => leerConfiguracionSitio(sitioConfig, clave);
  const imagenesHero = parsearGaleriaSitio(leer("servicios_hero_imagenes"));
  const imagenesCifras = parsearGaleriaSitio(leer("servicios_cifras_imagenes"));
  const imagenesMedicos = parsearGaleriaSitio(
    leer("servicios_medicos_imagenes"),
  );

  const estadisticasServicios = [
    {
      cifra: "398,235",
      etiqueta: "Consultas realizadas",
      icono: <Stethoscope className="w-8 h-8 text-emerald-600 opacity-60" />,
    },
    {
      cifra: "106,435",
      etiqueta: "Servicios de Peluquería",
      icono: <Scissors className="w-8 h-8 text-teal-600 opacity-60" />,
    },
    {
      cifra: "222,322",
      etiqueta: "Emergencias Atendidas",
      icono: <ShieldAlert className="w-8 h-8 text-rose-500 opacity-60" />,
    },
    {
      cifra: "176,777",
      etiqueta: "Mascotas Hospitalizadas",
      icono: <Activity className="w-8 h-8 text-indigo-600 opacity-60" />,
    },
    {
      cifra: "61,759",
      etiqueta: "Cirugías realizadas",
      icono: <HeartPulse className="w-8 h-8 text-amber-600 opacity-60" />,
    },
  ];

  const serviciosMedicos = [
    {
      titulo: "Consulta Externa",
      descripcion:
        "Contamos con consultorios equipados para brindar atención médica integral a mascotas y animales rescatados.",
      imagen: imagenesMedicos[1] || null,
      href: "/servicios/consulta-externa",
    },
    {
      titulo: "Emergencia 24/7",
      descripcion:
        "Atención de urgencias veterinarias y rescates críticos con equipo de respuesta inmediata las 24 horas.",
      imagen: imagenesMedicos[2] || null,
      href: "/servicios/emergencia",
    },
    {
      titulo: "Cirugía y Esterilización",
      descripcion:
        "Quirófanos modernos con cirujanos calificados para cirugías generales, ortopédicas y campañas de castración.",
      imagen: imagenesMedicos[3] || null,
      href: "/servicios/cirugia",
    },
    {
      titulo: "Hospitalización y Recuperación",
      descripcion:
        "Áreas especializadas y monitoreadas constantemente para garantizar una recuperación segura y óptima.",
      imagen: imagenesMedicos[4] || null,
      href: "/servicios/hospitalizacion",
    },
  ];

  return (
    <div className="w-full mt-0">
      {/* 1. SECCIÓN BANNER HERO FULL-WIDTH CON OLA EN LA PARTE INFERIOR */}
      <section className="relative w-full bg-[#1e2749] text-white pt-24 md:pt-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 pb-14">
          {/* Lado Izquierdo: Titular */}
          <div className="md:col-span-7 space-y-4 anim-fade-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              {leer("servicios_hero_titulo")}
            </h1>
            <p className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed whitespace-pre-line">
              {leer("servicios_hero_descripcion")}
            </p>
          </div>

          {/* Lado Derecho: Imagen Recortada de Mascota */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 anim-zoom-img anim-fade-up delay-2">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl anim-pulse" />
              {imagenesHero[0] ? (
                <img
                  src={imagenesHero[0]}
                  alt="Mascota del refugio"
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 rounded-full border-4 border-white/10 text-emerald-400 p-6 z-10">
                  <Sparkles size={64} className="mb-2" />
                  <span className="text-sm font-bold text-slate-200">
                    Cuidado Integral
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divisor SVG en forma de Ola (con -mb-px para eliminar la línea de subpíxel) */}
        <div className="w-full overflow-hidden leading-none z-20 relative -mb-px anim-fade-in delay-6">
          <svg
            className="relative block w-full h-[55px] sm:h-[75px] text-slate-50"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* 2. SECCIÓN: NUESTRA HUELLA EN CIFRAS -> FONDO GRIS PIZARRA SUAVE (bg-slate-50) */}
      <section className="w-full bg-slate-50 py-14 md:py-16 anim-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <div className="max-w-3xl mx-auto space-y-3 anim-fade-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              {leer("servicios_cifras_titulo")}
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {leer("servicios_cifras_subtitulo")}
            </p>
          </div>

          {/* Grilla de Tarjetas de Servicios en Cifras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {estadisticasServicios.map((stat, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-2xl bg-teal-500 text-white p-6 text-left shadow-md flex flex-col justify-between h-44 group hover:-translate-y-1 transition-all anim-hover-lift anim-fade-up delay-${Math.min(idx + 1, 5)}`}
              >
                <div className="z-10">
                  <p className="text-3xl font-black">{stat.cifra}</p>
                  <p className="text-sm font-semibold mt-2 text-teal-50">
                    {stat.etiqueta}
                  </p>
                </div>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full flex items-center justify-center p-3 group-hover:scale-125 transition-transform">
                  {stat.icono}
                </div>
              </div>
            ))}
          </div>

          {/* Galería de fotos con marcos orgánicos de colores detrás */}
          <div className="flex flex-wrap justify-center items-center gap-6 pt-6">
            <div className="relative group anim-fade-up delay-1">
              <div className="absolute -inset-2 bg-amber-400 rounded-3xl -rotate-3 transition-transform group-hover:rotate-0" />
              <div className="relative w-44 h-32 md:w-56 md:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-slate-200 anim-zoom-img">
                {imagenesCifras[0] ? (
                  <img
                    src={imagenesCifras[0]}
                    alt="Consulta"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                    Consulta Médica
                  </div>
                )}
              </div>
            </div>

            <div className="relative group anim-fade-up delay-2">
              <div className="absolute -inset-2 bg-rose-500 rounded-3xl rotate-2 transition-transform group-hover:rotate-0" />
              <div className="relative w-44 h-32 md:w-56 md:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-slate-200 anim-zoom-img">
                {imagenesCifras[1] ? (
                  <img
                    src={imagenesCifras[1]}
                    alt="Emergencia"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                    Cuidado Especial
                  </div>
                )}
              </div>
            </div>

            <div className="relative group anim-fade-up delay-3">
              <div className="absolute -inset-2 bg-emerald-500 rounded-3xl -rotate-2 transition-transform group-hover:rotate-0" />
              <div className="relative w-44 h-32 md:w-56 md:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-slate-200 anim-zoom-img">
                {imagenesCifras[2] ? (
                  <img
                    src={imagenesCifras[2]}
                    alt="Cirugía"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                    Quirófano
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: SERVICIOS MÉDICOS VETERINARIOS -> FONDO BLANCO PURO (bg-white) */}
      <section className="w-full bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Lado Izquierdo: Descripción General e Ilustración con Marco Orgánico */}
          <div className="lg:col-span-5 space-y-6 anim-fade-up">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {leer("servicios_medicos_titulo")}
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {leer("servicios_medicos_descripcion")}
            </p>

            {/* Ilustración con marco lila/morado en relieve */}
            <div className="relative mt-8 pt-4 flex justify-center">
              <div className="absolute -inset-4 bg-purple-200 rounded-full blur-lg opacity-70 z-0 anim-pulse" />
              <div className="relative z-10 w-full max-w-xs h-72 rounded-3xl bg-purple-300 p-4 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden anim-zoom-img">
                  <div className="absolute top-2 right-2 text-purple-600/40 anim-scale-in delay-5">
                  <Sparkles size={48} />
                </div>
                {imagenesMedicos[0] ? (
                  <img
                    src={imagenesMedicos[0]}
                    alt="Servicio médico"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center text-purple-900 p-4 text-center">
                    <Stethoscope size={56} className="mb-2 text-purple-700" />
                    <p className="font-extrabold text-lg">Atención con Amor</p>
                    <p className="text-xs text-purple-800 mt-1">
                      Medicina preventiva, vacunación y desparasitación.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lado Derecho: Grilla de Tarjetas de Servicios con Imágenes y Enlaces */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {serviciosMedicos.map((servicio, index) => (
              <div
                key={index}
                className={`bg-slate-50 rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group anim-hover-lift anim-fade-up delay-${Math.min(index + 1, 4)}`}
              >
                <div className="space-y-3">
                  {/* Imagen de la tarjeta */}
                  <div className="h-40 rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 anim-zoom-img">
                    {servicio.imagen ? (
                      <img
                        src={servicio.imagen}
                        alt={servicio.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-teal-100 text-teal-800 p-4">
                        <Syringe size={36} className="mb-1" />
                        <span className="text-xs font-bold text-center">
                          {servicio.titulo}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {servicio.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {servicio.descripcion}
                  </p>
                </div>

                <Link
                  href={servicio.href}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 pt-2 transition-colors anim-press"
                >
                  <span>Conoce más</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
