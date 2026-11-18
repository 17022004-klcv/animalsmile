"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  Siren,
  ShieldAlert,
  HeartPulse,
  Activity,
  PawPrint,
  Sparkles,
  ArrowRight,
  PhoneCall,
  MapPin,
  Clock,
  AlertTriangle,
  Heart,
  CheckCircle2,
  Ambulance,
  Send,
} from "lucide-react";
import { useSiteTheme } from "@/src/context/ThemeContext";
import {
  leerConfiguracionSitio,
  parsearGaleriaSitio,
} from "@/src/services/config/site-config";

export default function RescatesPage() {
  const { sitePalette, sitioConfig } = useSiteTheme();
  const leer = (clave: string) => leerConfiguracionSitio(sitioConfig, clave);
  const imagenesHero = parsearGaleriaSitio(leer("rescates_hero_imagenes"));
  const imagenesCifras = parsearGaleriaSitio(leer("rescates_cifras_imagenes"));
  const imagenesProtocolo = parsearGaleriaSitio(
    leer("rescates_protocolo_imagenes"),
  );

  // Formulario rápido de reporte de emergencia
  const [reporteEnviado, setReporteEnviado] = useState(false);
  const [ubicacionReporte, setUbicacionReporte] = useState("");
  const [descripcionReporte, setDescripcionReporte] = useState("");
  const [contactoReporte, setContactoReporte] = useState("");

  const handleEnviarReporte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ubicacionReporte.trim()) return;
    setReporteEnviado(true);
  };

  const estadisticasRescates = [
    {
      cifra: "+1,450",
      etiqueta: "Rescates Realizados",
      icono: <LifeBuoy className="w-8 h-8 text-rose-500 opacity-60" />,
      colorFondo: "bg-rose-500",
    },
    {
      cifra: "890+",
      etiqueta: "Emergencias 24/7 Atendidas",
      icono: <ShieldAlert className="w-8 h-8 text-amber-500 opacity-60" />,
      colorFondo: "bg-amber-500",
    },
    {
      cifra: "1,280+",
      etiqueta: "Vidas Rehabilitadas",
      icono: <HeartPulse className="w-8 h-8 text-emerald-600 opacity-60" />,
      colorFondo: "bg-emerald-600",
    },
    {
      cifra: "94%",
      etiqueta: "Tasa de Recuperación",
      icono: <Activity className="w-8 h-8 text-teal-600 opacity-60" />,
      colorFondo: "bg-teal-500",
    },
    {
      cifra: "+1,150",
      etiqueta: "Hogares Definitivos",
      icono: <PawPrint className="w-8 h-8 text-indigo-600 opacity-60" />,
      colorFondo: "bg-indigo-600",
    },
  ];

  const etapasProtocolo = [
    {
      numero: "01",
      titulo: "Alerta y Respuesta Inmediata",
      descripcion:
        "Recepción de reportes comunitarios y despliegue de patrullas equipadas para rescates en zonas urbanas o de difícil acceso.",
      imagen:
        imagenesProtocolo[1] ||
        "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=700&q=80",
      etiqueta: "Brigada 24 Horas",
    },
    {
      numero: "02",
      titulo: "Primeros Auxilios y Traslado Seguro",
      descripcion:
        "Estabilización médica in situ, control de hipotermia, oxigenoterapia de urgencia y traslado en nuestra unidad móvil especializada.",
      imagen:
        imagenesProtocolo[2] ||
        "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=700&q=80",
      etiqueta: "Unidad Móvil",
    },
    {
      numero: "03",
      titulo: "Evaluación Médica y Cuarentena",
      descripcion:
        "Exámenes clínicos, laboratorio, desparasitación, vacunación y alojamiento en áreas de aislamiento para prevenir contagios.",
      imagen:
        imagenesProtocolo[3] ||
        "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=700&q=80",
      etiqueta: "Área Clínica",
    },
    {
      numero: "04",
      titulo: "Rehabilitación y Socialización",
      descripcion:
        "Terapia física, nutrición personalizada, apoyo etológico para sanar traumas y adaptación para su posterior adopción responsable.",
      imagen:
        imagenesProtocolo[4] ||
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=700&q=80",
      etiqueta: "Segunda Oportunidad",
    },
  ];

  const casosTransformacion = [
    {
      nombre: "Rocky",
      historia:
        "Rescatado de una alcantarilla con heridas graves y desnutrición. Tras 3 meses de cirugía y cuidados intensivos, hoy corre feliz con su nueva familia.",
      antes: "Atropellamiento & shock",
      despues: "Totalmente recuperado",
      foto: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
      estado: "Adoptado",
    },
    {
      nombre: "Luna",
      historia:
        "Encontrada en estado de abandono extremo con sarna severa. Con baños terapéuticos y medicación continua, recuperó su pelaje brillante y vitalidad.",
      antes: "Desnutrición y sarna",
      despues: "Sana y llena de amor",
      foto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
      estado: "Adoptada",
    },
    {
      nombre: "Simón",
      historia:
        "Sobreviviente a tormentas en un descampado. Llegó temeroso y desconfiado; hoy es uno de los perros más cariñosos y sociables de nuestro refugio.",
      antes: "Hipotermia y miedo",
      despues: "Sociable y juguetón",
      foto: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80",
      estado: "Listo para adopción",
    },
  ];

  const pasosCiudadanos = [
    {
      paso: "1",
      titulo: "Prioriza tu seguridad",
      descripcion:
        "Nunca te expongas a vías de alta velocidad o zonas de derrumbe. Mantén una distancia prudente si el animal luce agresivo por el dolor.",
      icono: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    },
    {
      paso: "2",
      titulo: "Gana su confianza con calma",
      descripcion:
        "Háblale con un tono suave y pausado. Evita movimientos bruscos y, si es seguro, ofrécele un poco de agua o comida para mantenerlo en el lugar.",
      icono: <Heart className="w-5 h-5 text-rose-500" />,
    },
    {
      paso: "3",
      titulo: "Registra ubicación y fotos",
      descripcion:
        "Toma una foto clara del animal y su entorno. Copia las coordenadas GPS o anota calles y referencias exactas para facilitar la llegada.",
      icono: <MapPin className="w-5 h-5 text-emerald-600" />,
    },
    {
      paso: "4",
      titulo: "Comunícate de inmediato",
      descripcion:
        "Llama a nuestra línea de emergencia o llena el reporte en línea. Nuestro equipo de rescate clasificará la gravedad del caso.",
      icono: <PhoneCall className="w-5 h-5 text-indigo-600" />,
    },
  ];

  return (
    <div className="w-full">
      {/* 1. SECCIÓN BANNER HERO FULL-WIDTH CON OLA EN LA PARTE INFERIOR */}
      <section className="relative w-full bg-[#1e2749] text-white pt-24 md:pt-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 pb-14">
          {/* Lado Izquierdo: Titular */}
          <div className="md:col-span-7 space-y-5 anim-fade-up">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold anim-scale-in delay-5"
              style={{
                color: sitePalette.primary || "#f59e0b",
                backgroundColor: `${sitePalette.primary || "#f59e0b"}1A`,
                borderColor: `${sitePalette.primary || "#f59e0b"}4D`,
              }}
            >
              <Siren size={15} className="animate-pulse" />
              <span>{leer("rescates_hero_subtitulo")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              {leer("rescates_hero_titulo")}{" "}
              <span className="text-emerald-400">
                {leer("sitio_nombre") || "AnimalSmile"}
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed whitespace-pre-line">
              {leer("rescates_hero_descripcion")}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#reportar-emergencia"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 anim-press"
              >
                <Siren size={18} />
                <span>Reportar un Rescate</span>
              </a>
              <a
                href="#protocolo-rescate"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5 anim-press"
              >
                <LifeBuoy size={18} />
                <span>Cómo Actuamos</span>
              </a>
            </div>
          </div>

          {/* Lado Derecho: Imagen Recortada / Ilustración de Mascota Rescatada */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 anim-zoom-img anim-fade-up delay-2">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl anim-pulse" />
              {imagenesHero[0] ? (
                <img
                  src={imagenesHero[0]}
                  alt="Rescate animal"
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 rounded-full border-4 border-white/10 text-emerald-400 p-6 z-10 shadow-2xl">
                  <div className="relative mb-3">
                    <LifeBuoy size={68} className="text-rose-400" />
                    <Sparkles
                      size={24}
                      className="text-amber-400 absolute -top-1 -right-2 animate-bounce"
                    />
                  </div>
                  <span className="text-base font-extrabold text-slate-100 text-center">
                    Auxilio Inmediato
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold text-center mt-1">
                    Cada Vida Importa
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divisor SVG en forma de Ola (text-slate-50 conecta con sección 2 + -mb-px) */}
        <div className="w-full overflow-hidden leading-none z-20 relative -mb-px">
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
      <section className="w-full bg-[#F8FAFC]  py-14 md:py-16 border-b border-slate-200/60 anim-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <div className="max-w-3xl mx-auto space-y-3 anim-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <Activity size={14} />
              <span>Impacto Real</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              {leer("rescates_cifras_titulo")}
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {leer("rescates_cifras_subtitulo")}
            </p>
          </div>

          {/* Grilla de Tarjetas de Rescates en Cifras */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {estadisticasRescates.map((stat, idx) => (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-2xl ${stat.colorFondo} text-white p-6 text-left shadow-md flex flex-col justify-between h-44 group hover:-translate-y-1 transition-all anim-hover-lift anim-fade-up delay-${Math.min(idx + 1, 5)}`}
              >
                <div className="z-10">
                  <p className="text-3xl font-black">{stat.cifra}</p>
                  <p className="text-sm font-semibold mt-2 text-white/95">
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
                <img
                  src={
                    imagenesCifras[0] ||
                    "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=600&q=80"
                  }
                  alt="Brigada de rescate"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="relative group anim-fade-up delay-2">
              <div className="absolute -inset-2 bg-rose-500 rounded-3xl rotate-2 transition-transform group-hover:rotate-0" />
              <div className="relative w-44 h-32 md:w-56 md:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-slate-200 anim-zoom-img">
                <img
                  src={
                    imagenesCifras[1] ||
                    "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80"
                  }
                  alt="Atención médica urgente"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="relative group anim-fade-up delay-3">
              <div className="absolute -inset-2 bg-emerald-500 rounded-3xl -rotate-2 transition-transform group-hover:rotate-0" />
              <div className="relative w-44 h-32 md:w-56 md:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-slate-200 anim-zoom-img">
                <img
                  src={
                    imagenesCifras[2] ||
                    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
                  }
                  alt="Segunda oportunidad"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: PROTOCOLO Y ETAPAS DEL RESCATE -> FONDO BLANCO PURO (bg-white) */}
      <section
        id="protocolo-rescate"
        className="w-full bg-white py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Lado Izquierdo: Descripción e Ilustración con Marco Orgánico */}
          <div className="lg:col-span-5 space-y-6 anim-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              <Ambulance size={14} />
              <span>Protocolo de Salvamento</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
              {leer("rescates_protocolo_titulo")}
            </h2>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {leer("rescates_protocolo_descripcion")}
            </p>

            <div className="relative mt-8 pt-4 flex justify-center">
              <div className="absolute -inset-4 bg-teal-200 rounded-full blur-lg opacity-70 z-0 anim-pulse" />
              <div className="relative z-10 w-full max-w-xs h-76 rounded-3xl bg-teal-400 p-5 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden anim-zoom-img">
                <div className="absolute top-2 right-2 text-teal-700/40">
                  <Sparkles size={48} />
                </div>
                {imagenesProtocolo[0] ? (
                  <img
                    src={imagenesProtocolo[0]}
                    alt="Protocolo de rescate"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center text-teal-950 p-4 text-center">
                    <LifeBuoy size={56} className="mb-2 text-teal-900" />
                    <p className="font-extrabold text-lg text-teal-950">
                      Rescate Ético y Responsable
                    </p>
                    <p className="text-xs text-teal-900/90 mt-2 font-medium">
                      Atención veterinaria integral, esterilización y
                      acompañamiento psicológico para animales en trauma.
                    </p>
                    <div className="mt-4 px-3 py-1 bg-white/30 rounded-full text-[11px] font-bold text-teal-950">
                      Disponibilidad Continua
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lado Derecho: Grilla de Tarjetas de Etapas del Rescate */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {etapasProtocolo.map((etapa, index) => (
              <div
                key={index}
                className={`bg-slate-50 rounded-3xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group anim-hover-lift anim-fade-up delay-${Math.min(index + 1, 4)}`}
              >
                <div className="space-y-3">
                  <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-200 border border-slate-100 anim-zoom-img">
                    <img
                      src={etapa.imagen}
                      alt={etapa.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg">
                      Fase {etapa.numero}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    {etapa.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {etapa.descripcion}
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:text-emerald-700 pt-2 transition-colors">
                  <span>{etapa.etiqueta}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN: HISTORIAS DE RESCATE -> FONDO ROSA/CÁLIDO MUY SUAVE (bg-rose-50/60) */}
      <section className="w-full bg-rose-50/60 border-y border-rose-100 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 anim-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <Heart size={14} className="fill-rose-500 text-rose-500" />
              <span>Vidas Transformadas</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              {leer("rescates_historias_titulo")}
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {leer("rescates_historias_subtitulo")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {casosTransformacion.map((caso, index) => (
              <div
                key={index}
                className={`bg-white rounded-3xl p-5 border border-rose-100 shadow-sm hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group anim-hover-lift anim-fade-up delay-${index + 1}`}
              >
                <div className="space-y-3">
                  <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-200 anim-zoom-img">
                    <img
                      src={caso.foto}
                      alt={caso.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {caso.estado}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {caso.nombre}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {caso.historia}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold">Al llegar:</span>
                    <span className="text-rose-600 font-bold">
                      {caso.antes}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold">Resultado:</span>
                    <span className="text-emerald-600 font-bold">
                      {caso.despues}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN: GUÍA CIUDADANA -> FRANJA DE ANCHO COMPLETO OSCURA (bg-slate-900) */}
      <section className="w-full bg-slate-900 text-white py-16 md:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          <div className="max-w-2xl space-y-3 anim-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold anim-fade-in delay-6">
              <AlertTriangle size={14} />
              <span>Protocolo para la Comunidad</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              {leer("rescates_guia_titulo")}
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {leer("rescates_guia_descripcion")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pasosCiudadanos.map((paso, idx) => (
              <div
                key={idx}
                className={`bg-slate-800/80 border border-white/10 rounded-2xl p-5 space-y-3 backdrop-blur-sm hover:border-emerald-400/50 transition-colors anim-hover-lift anim-fade-up delay-${idx + 1}`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                    {paso.paso}
                  </span>
                  <div className="p-2 rounded-xl bg-white/5">{paso.icono}</div>
                </div>
                <h3 className="font-bold text-white text-base">
                  {paso.titulo}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {paso.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SECCIÓN: REPORTE DE EMERGENCIA & LÍNEA DIRECTA -> FONDO GRIS CLARO (bg-slate-100) */}
      <section
        id="reportar-emergencia"
        className="w-full bg-slate-100 py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Tarjeta de Líneas de Atención Directa */}
          <div className="lg:col-span-5 bg-gradient-to-br from-rose-600 to-rose-700 text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl space-y-6 anim-slide-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-md">
                <Siren size={15} />
                <span>Línea Directa de Urgencias</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black">
                {leer("rescates_reporte_titulo")}
              </h3>
              <p className="text-rose-100 text-sm leading-relaxed whitespace-pre-line">
                {leer("rescates_reporte_descripcion")}
              </p>

              <div className="space-y-3 pt-4 text-sm font-semibold">
                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                  <PhoneCall size={20} className="text-rose-200 shrink-0" />
                  <div>
                    <p className="text-[11px] text-rose-200">Teléfono SOS</p>
                    <p className="text-base font-black">+503 2222-7387</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                  <Clock size={20} className="text-rose-200 shrink-0" />
                  <div>
                    <p className="text-[11px] text-rose-200">Disponibilidad</p>
                    <p className="text-xs font-bold">
                      24 horas / 7 días al año
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                  <MapPin size={20} className="text-rose-200 shrink-0" />
                  <div>
                    <p className="text-[11px] text-rose-200">Base Central</p>
                    <p className="text-xs font-bold">
                      {leer("sitio_nombre") || "Refugio AnimalSmile"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/20 flex flex-wrap gap-3">
              <Link
                href="/adopciones"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors shadow-sm anim-press"
              >
                <PawPrint size={14} />
                <span>Adoptar un Rescatado</span>
              </Link>
              <Link
                href="/donar"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-800/60 hover:bg-rose-800 text-white font-bold text-xs transition-colors border border-white/20 anim-press"
              >
                <Heart size={14} />
                <span>Fondo Médico de Rescate</span>
              </Link>
            </div>
          </div>

          {/* Formulario Rápido de Reporte de Caso */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/80 shadow-md flex flex-col justify-between anim-slide-right delay-1">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-slate-800 font-bold text-lg">
                <Send size={18} className="text-emerald-600" />
                <h3>Formulario de Reporte Rápido</h3>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Envíanos los datos del animal para que nuestro equipo de guardia
                pueda evaluar la prioridad de intervención y acudir a la zona.
              </p>

              {reporteEnviado ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                    <CheckCircle2 size={28} />
                  </div>
                  <h4 className="font-bold text-emerald-900 text-base">
                    ¡Reporte recibido con éxito!
                  </h4>
                  <p className="text-emerald-800 text-xs leading-relaxed max-w-md mx-auto">
                    Gracias por tu empatía. Nuestro equipo de rescates revisará
                    la ubicación y los datos para coordinar la atención
                    oportuna. Si la emergencia es crítica, por favor llámanos
                    directamente.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setReporteEnviado(false);
                      setUbicacionReporte("");
                      setDescripcionReporte("");
                      setContactoReporte("");
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition anim-press"
                  >
                    Reportar otro caso
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEnviarReporte} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Ubicación exacta o punto de referencia *
                    </label>
                    <div className="relative">
                      <MapPin
                        size={16}
                        className="absolute left-3.5 top-3 text-slate-400"
                      />
                      <input
                        type="text"
                        required
                        value={ubicacionReporte}
                        onChange={(e) => setUbicacionReporte(e.target.value)}
                        placeholder="Ej. Frente al parque central, junto a la farmacia..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Condición del animal y descripción
                    </label>
                    <textarea
                      rows={3}
                      value={descripcionReporte}
                      onChange={(e) => setDescripcionReporte(e.target.value)}
                      placeholder="Describa raza aproximada, tamaño, si presenta heridas, sangrado o dificultad para caminar..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Tu teléfono o contacto de seguimiento (opcional)
                    </label>
                    <input
                      type="text"
                      value={contactoReporte}
                      onChange={(e) => setContactoReporte(e.target.value)}
                      placeholder="Para confirmar datos si el equipo no localiza al animal"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all hover:-translate-y-0.5 anim-press"
                    >
                      <Send size={14} />
                      <span>Enviar Reporte a Rescates</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
