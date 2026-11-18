"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  CreditCard,
  Utensils,
  Pill,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  X,
  Package,
  Bath,
  Truck,
  Check,
  Receipt,
  AlertCircle,
  Loader2,
  DollarSign,
  Stethoscope,
  BadgeCheck,
} from "lucide-react";
import { useSiteTheme } from "@/src/context/ThemeContext";
import {
  leerConfiguracionSitio,
  parsearGaleriaSitio,
} from "@/src/services/config/site-config";
import { Validaciones } from "@/src/utils/validaciones";

interface DonacionResultado {
  id_donacion: string;
  monto: number;
  donante_nombre: string;
  fecha_donacion: string;
  terminacion_tarjeta: string;
  frecuencia: string;
  destino: string;
}

export default function DonarPage() {
  const { sitePalette, sitioConfig } = useSiteTheme();
  const leer = (clave: string) => leerConfiguracionSitio(sitioConfig, clave);
  const imagenes = parsearGaleriaSitio(leer("donar_hero_imagenes"));

  // Estados del Modal de Donación
  const [modalAbierto, setModalAbierto] = useState(false);
  const [montoSeleccionado, setMontoSeleccionado] = useState<number>(25);
  const [montoPersonalizado, setMontoPersonalizado] = useState<string>("");
  const [frecuencia, setFrecuencia] = useState<"Única" | "Mensual">("Única");
  const [destino, setDestino] = useState<string>("Fondo General y Emergencias");

  // Formulario de Tarjeta
  const [nombreTitular, setNombreTitular] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [codigoSeguridad, setCodigoSeguridad] = useState("");
  const [emailDonante, setEmailDonante] = useState("");

  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [donacionExitosa, setDonacionExitosa] =
    useState<DonacionResultado | null>(null);

  // Formateadores automáticos de tarjeta
  const handleNumeroTarjetaChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setNumeroTarjeta(Validaciones.formatearTarjeta(e.target.value));
  };

  const handleVencimientoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 4) valor = valor.slice(0, 4);
    if (valor.length >= 2) {
      valor = `${valor.slice(0, 2)}/${valor.slice(2)}`;
    }
    setVencimiento(valor);
  };

  const handleCodigoSeguridadChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setCodigoSeguridad(Validaciones.formatearCVV(e.target.value));
  };

  const abrirModalDonacion = (montoInicial?: number) => {
    if (montoInicial) {
      setMontoSeleccionado(montoInicial);
      setMontoPersonalizado("");
    }
    setErrorEnvio(null);
    setDonacionExitosa(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setErrorEnvio(null);
    setDonacionExitosa(null);
  };

  const montoFinal = montoPersonalizado
    ? Number(montoPersonalizado)
    : montoSeleccionado;

  const handleSubmitDonacion = async (e: React.FormEvent) => {
    e.preventDefault();

    const errNombre = Validaciones.validarSoloLetras(
      nombreTitular,
      "Nombre del dueño de la tarjeta",
      { requerido: true, maxLength: 60 },
    );
    if (errNombre) {
      setErrorEnvio(errNombre);
      return;
    }
    const errTarjeta = Validaciones.validarTarjeta(numeroTarjeta, true);
    if (errTarjeta) {
      setErrorEnvio(errTarjeta);
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(vencimiento)) {
      setErrorEnvio("La fecha de vencimiento debe tener formato MM/AA.");
      return;
    }
    const errCVV = Validaciones.validarCVV(codigoSeguridad, true);
    if (errCVV) {
      setErrorEnvio(errCVV);
      return;
    }
    const errEmail = Validaciones.validarEmail(emailDonante, false);
    if (errEmail) {
      setErrorEnvio(errEmail);
      return;
    }
    if (isNaN(montoFinal) || montoFinal <= 0) {
      setErrorEnvio("Por favor selecciona o ingresa un monto válido a donar.");
      return;
    }

    setEnviando(true);
    setErrorEnvio(null);

    try {
      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_titular: nombreTitular,
          numero_tarjeta: numeroTarjeta,
          vencimiento,
          codigo_seguridad: codigoSeguridad,
          email: emailDonante,
          monto: montoFinal,
          destino,
          frecuencia,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.error || "No se pudo procesar la donación.");
      }

      setDonacionExitosa(data.donacion);
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al procesar la donación.";
      setErrorEnvio(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="w-full mt-0">
      {/* 1. HERO BANNER FULL-WIDTH CON OLA INFERIOR EN BLANCO PURO */}
      <section className="relative w-full bg-[#1e2749] text-white pt-24 md:pt-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 pb-14">
          {/* Lado Izquierdo: Titular */}
          <div className="md:col-span-7 space-y-5 anim-fade-up">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold anim-fade-in delay-1"
              style={{
                color: sitePalette.primary || "#f43f5e",
                backgroundColor: `${sitePalette.primary || "#f43f5e"}1A`,
                borderColor: `${sitePalette.primary || "#f43f5e"}4D`,
              }}
            >
              <Heart size={15} className="fill-current animate-pulse" />
              <span>{leer("donar_hero_subtitulo")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              {leer("donar_hero_titulo")}{" "}
              <span className="text-emerald-400">
                {leer("sitio_nombre") || "AnimalSmile"}
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed whitespace-pre-line">
              {leer("donar_hero_descripcion")}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => abrirModalDonacion(25)}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30 transition-all hover:-translate-y-0.5 anim-press"
              >
                <CreditCard size={18} />
                <span>Donar con Tarjeta Ahora</span>
              </button>
              <a
                href="#donaciones-especie"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5 anim-press"
              >
                <Package size={18} />
                <span>Donaciones en Especie</span>
              </a>
            </div>
          </div>

          {/* Lado Derecho: Avatar Ilustrado / Mascota */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 anim-zoom-img anim-fade-up delay-2">
              <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl anim-pulse" />
              {imagenes[0] ? (
                <img
                  src={imagenes[0]}
                  alt="Donaciones AnimalSmile"
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 rounded-full border-4 border-white/10 text-rose-400 p-6 z-10 shadow-2xl">
                  <div className="relative mb-3">
                    <Heart size={68} className="fill-rose-500 text-rose-500" />
                    <Sparkles
                      size={24}
                      className="text-amber-400 absolute -top-1 -right-2 animate-bounce"
                    />
                  </div>
                  <span className="text-base font-extrabold text-slate-100 text-center">
                    Solidaridad Real
                  </span>
                  <span className="text-xs text-rose-300 font-semibold text-center mt-1">
                    Cada dólar salva vidas
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divisor SVG en forma de Ola (text-white + -mb-px para eliminar la línea inferior) */}
        <div className="w-full overflow-hidden leading-none z-20 relative -mb-px">
          <svg
            className="relative block w-full h-[55px] sm:h-[75px] text-white"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,40 L1200,120 L0,120 Z" />
          </svg>
        </div>
      </section>

      {/* CONTENEDOR PRINCIPAL EN BLANCO PURO */}
      <section className="w-full bg-white pt-6 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* BARRA DE IMPACTO DE LAS DONACIONES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 anim-hover-lift anim-fade-up delay-1">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Utensils size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  +3,500 Platos
                </p>
                <p className="text-[11px] text-slate-500">
                  Alimentación al mes
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 anim-hover-lift anim-fade-up delay-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Pill size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  100% Medicina
                </p>
                <p className="text-[11px] text-slate-500">
                  Tratamiento asegurado
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 anim-hover-lift anim-fade-up delay-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Stethoscope size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Urgencias 24/7
                </p>
                <p className="text-[11px] text-slate-500">
                  Cirugías de rescate
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 anim-hover-lift anim-fade-up delay-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Transparencia
                </p>
                <p className="text-[11px] text-slate-500">Auditoría continua</p>
              </div>
            </div>
          </div>

          {/* 2. SECCIÓN: DONACIÓN FINANCIERA DESTACADA */}
          <section className="bg-gradient-to-br from-slate-900 to-[#1e2749] text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden anim-fade-up">
            <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none anim-float" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
                  <CreditCard size={14} />
                  <span>Donaciones Financieras Directas</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {leer("donar_financiera_titulo")}
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xl whitespace-pre-line">
                  {leer("donar_financiera_descripcion")}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <Lock size={13} className="text-emerald-400" />
                    Transacción protegida SSL
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <Receipt size={13} className="text-amber-400" />
                    Recibo de donación digital
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <BadgeCheck size={13} className="text-teal-400" />
                    Tarjetas Visa / Mastercard / AMEX
                  </span>
                </div>
              </div>

              {/* Tarjeta de Donación Rápida con botón que abre el modal */}
              <div className="lg:col-span-5 bg-white text-slate-800 rounded-3xl p-6 shadow-xl space-y-5 anim-fade-up delay-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Selecciona tu aporte:
                  </h3>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                    $ USD
                  </span>
                </div>

                {/* Botones de montos predeterminados */}
                <div className="grid grid-cols-4 gap-2">
                  {[10, 25, 50, 100].map((monto) => (
                    <button
                      key={monto}
                      type="button"
                      onClick={() => {
                        setMontoSeleccionado(monto);
                        setMontoPersonalizado("");
                      }}
                      className={`py-2.5 rounded-xl text-xs font-black transition-all anim-press ${
                        montoSeleccionado === monto && !montoPersonalizado
                          ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      ${monto}
                    </button>
                  ))}
                </div>

                {/* Explicación de impacto del monto seleccionado */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs text-slate-600">
                  <p className="font-bold text-slate-800 mb-0.5">
                    Impacto estimado de ${montoFinal}:
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    {montoFinal <= 15
                      ? "Vacunas completas y desparasitación para un cachorro rescatado."
                      : montoFinal <= 35
                        ? "Alimento nutritivo de alta gama para 1 perro mediano durante 1 mes."
                        : montoFinal <= 75
                          ? "Cirugía menor, castración y tratamiento antibiótico integral."
                          : "Cobertura de cirugía de emergencia, rayos X y hospitalización intensiva."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => abrirModalDonacion(montoFinal)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/30 transition-all hover:-translate-y-0.5 anim-press"
                >
                  <CreditCard size={18} />
                  <span>Donar ${montoFinal} con Tarjeta</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </section>

          {/* 3. SECCIÓN INFORMATIVA: DONACIONES EN ESPECIE (Alimentos, Medicina, Higiene y Equipo) */}
          <section id="donaciones-especie" className="space-y-10 pt-4">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                <Package size={14} />
                <span>Ayuda Material e Insumos</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                {leer("donar_especie_titulo")}
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {leer("donar_especie_descripcion")}
              </p>
            </div>

            {/* Grilla Informativa de las 4 Categorías en Especie */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Alimentos */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group anim-hover-lift anim-fade-up delay-1">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Utensils size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                      Nutrición Diaria
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                      Alimentos
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Para alimentar a decenas de rescatados con dietas
                    balanceadas según su edad y estado de salud.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-amber-500 shrink-0" />
                      <span>Croquetas (cachorros y adultos)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-amber-500 shrink-0" />
                      <span>Comida húmeda (latas y sobres)</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-amber-500 shrink-0" />
                      <span>Fórmula láctea para cachorros</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-amber-500 shrink-0" />
                      <span>Dietas gastrointestinales/renales</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 text-[11px] font-semibold text-slate-400">
                  Preferiblemente empaques sellados
                </div>
              </div>

              {/* Card 2: Medicina */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group anim-hover-lift anim-fade-up delay-2">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Pill size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
                      Salud Veterinaria
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                      Medicina
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Tratamientos para animales rescatados en estado crítico, con
                    fracturas, desnutrición o infecciones.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>Antiparasitarios internos y pipetas</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>Antibióticos y antiinflamatorios</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>Gasas, vendas, jeringas y sueros</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      <span>Vitaminas y protectores hepáticos</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 text-[11px] font-semibold text-slate-400">
                  Uso veterinario o humano vigente
                </div>
              </div>

              {/* Card 3: Productos de Higiene */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group anim-hover-lift anim-fade-up delay-3">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bath size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-600">
                      Limpieza y Sanitización
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                      Higiene
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Para mantener las áreas de cuarentena y corrales
                    completamente desinfectados y libres de virus.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-teal-500 shrink-0" />
                      <span>Champús medicados y de baño seco</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-teal-500 shrink-0" />
                      <span>Cloro, desinfectantes y detergente</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-teal-500 shrink-0" />
                      <span>Arena aglomerante para gatos</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-teal-500 shrink-0" />
                      <span>Toallas de papel y bolsas grandes</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 text-[11px] font-semibold text-slate-400">
                  Uso diario continuo en el refugio
                </div>
              </div>

              {/* Card 4: Equipamiento */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl transition-all space-y-4 flex flex-col justify-between group anim-hover-lift anim-fade-up delay-4">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Package size={28} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">
                      Accesorios e Instalaciones
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                      Equipamiento
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Herramientas indispensables para el traslado seguro y
                    confort de los animales cobijados.
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-700 border-t border-slate-100 pt-3">
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-indigo-500 shrink-0" />
                      <span>Transportadoras (kennels) de todo tamaño</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-indigo-500 shrink-0" />
                      <span>Correas resistentes, arneses y collares</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-indigo-500 shrink-0" />
                      <span>Mantas, toallas limpias y camas</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Check size={14} className="text-indigo-500 shrink-0" />
                      <span>Platos de acero inoxidable y comederos</span>
                    </li>
                  </ul>
                </div>
                <div className="pt-2 text-[11px] font-semibold text-slate-400">
                  Nuevos o usados en buen estado
                </div>
              </div>
            </div>
          </section>

          {/* 4. SECCIÓN: CÓMO ENTREGAR DONACIONES EN ESPECIE */}
          <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 md:p-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                  <Truck size={16} />
                  <span>Logística y Puntos de Acopio</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {leer("donar_entrega_titulo")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed whitespace-pre-line">
                  {leer("donar_entrega_descripcion")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => abrirModalDonacion(50)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-2xl shadow-md transition whitespace-nowrap self-start md:self-auto anim-press"
              >
                <CreditCard size={16} />
                <span>Prefiero Donar Dinero</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 anim-hover-lift anim-fade-up delay-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <MapPin size={18} className="text-rose-500" />
                  <h4>Sede Central del Refugio</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Recepción directa en nuestras instalaciones. Nuestro equipo te
                  entregará un recibo de donación en especie.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Clock size={13} className="text-emerald-600" />
                  <span>Lunes a Domingo: 8:00 AM - 6:00 PM</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 anim-hover-lift anim-fade-up delay-5">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Phone size={18} className="text-emerald-600" />
                  <h4>Coordinación de Recolección</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Si cuentas con bolsas grandes de alimento o kennels
                  voluminosos, nuestra brigada móvil puede pasar a retirarlos.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Phone size={13} className="text-indigo-600" />
                  <span>WhatsApp: +503 2222-7387</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2 anim-hover-lift anim-fade-up delay-6">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Mail size={18} className="text-indigo-600" />
                  <h4>Alianzas y Empresas</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Si representas a una veterinaria, distribuidora o empresa que
                  desee realizar donaciones corporativas periódicas.
                </p>
                <div className="pt-2 text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                  <Mail size={13} className="text-rose-500" />
                  <span>donaciones@animalsmile.org</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL DE DONACIÓN FINANCIERA CON TARJETA */}
      {/* ========================================================================= */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 anim-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 anim-scale-in delay-1">
            {/* Cabecera del Modal */}
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-6 relative">
              <button
                type="button"
                onClick={cerrarModal}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition anim-press"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0">
                  <CreditCard size={24} className="text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-200 uppercase tracking-wider">
                    <Heart size={12} className="fill-current" />
                    <span>Donación Segura con Tarjeta</span>
                  </div>
                  <h3 className="text-2xl font-black">
                    Aporte Solidario a AnimalSmile
                  </h3>
                </div>
              </div>
            </div>

            {/* Contenido del Modal: Formulario O Recibo Exitoso */}
            <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {donacionExitosa ? (
                /* PANTALLA DE ÉXITO Y RECIBO DIGITAL */
                <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 border-4 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={42} />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black shadow-sm">
                      <Sparkles size={14} />
                      <span>¡DONACIÓN PROCESADA CON ÉXITO!</span>
                    </div>

                    <h4 className="text-2xl font-black text-slate-900 pt-1">
                      ¡Gracias de corazón, {donacionExitosa.donante_nombre}!
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Tu generoso aporte de{" "}
                      <strong className="text-emerald-700 text-base">
                        ${donacionExitosa.monto.toFixed(2)} USD
                      </strong>{" "}
                      ha sido recibido y se destinará de inmediato a la atención
                      y cuidado de los animales rescatados.
                    </p>
                  </div>

                  {/* Recibo digital detallado */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 max-w-md mx-auto text-left space-y-2.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">ID de Comprobante:</span>
                      <strong className="text-slate-800 font-mono">
                        {donacionExitosa.id_donacion}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">
                        Titular de Tarjeta:
                      </span>
                      <strong className="text-slate-800">
                        {donacionExitosa.donante_nombre}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Tarjeta utilizada:</span>
                      <strong className="text-slate-800 font-mono">
                        •••• •••• •••• {donacionExitosa.terminacion_tarjeta}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Destino del fondo:</span>
                      <strong className="text-slate-800">
                        {donacionExitosa.destino}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Frecuencia:</span>
                      <span className="text-emerald-700 font-bold">
                        {donacionExitosa.frecuencia}
                      </span>
                    </div>
                  </div>

                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800 text-center space-y-1">
                    <p className="font-bold text-rose-900">
                      🐾 Cada huella que sanamos lleva tu nombre
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      Te mantendremos al tanto de nuestros rescates y del
                      impacto directo que tu aporte ha generado.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition anim-press"
                  >
                    Cerrar Comprobante
                  </button>
                </div>
              ) : (
                /* FORMULARIO DE DONACIÓN CON TARJETA */
                <form onSubmit={handleSubmitDonacion} className="space-y-6">
                  {/* Frecuencia: Única o Mensual */}
                  <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setFrecuencia("Única")}
                      className={`flex-1 py-2 rounded-xl transition anim-press ${
                        frecuencia === "Única"
                          ? "bg-white text-rose-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Donación Única
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrecuencia("Mensual")}
                      className={`flex-1 py-2 rounded-xl transition anim-press ${
                        frecuencia === "Mensual"
                          ? "bg-white text-rose-600 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Aporte Mensual Solidario 💖
                    </button>
                  </div>

                  {/* Selección de Montos */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Selecciona el monto en dólares (USD) *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 25, 50, 100].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setMontoSeleccionado(m);
                            setMontoPersonalizado("");
                          }}
                          className={`py-2.5 rounded-xl text-xs font-black transition anim-press ${
                            montoSeleccionado === m && !montoPersonalizado
                              ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          ${m}
                        </button>
                      ))}
                    </div>

                    <div className="pt-1">
                      <div className="relative">
                        <DollarSign
                          size={15}
                          className="absolute left-3 top-2.5 text-slate-400"
                        />
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={montoPersonalizado}
                          onChange={(e) => {
                            setMontoPersonalizado(e.target.value);
                          }}
                          placeholder="U otro monto personalizado..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* CAMPOS DE TARJETA */}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard size={15} className="text-rose-500" />
                        <span>Datos de la Tarjeta</span>
                      </h5>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Lock size={12} className="text-emerald-500" />
                        Cifrado 256-bit
                      </span>
                    </div>

                    {/* 1. Nombre del dueño de la tarjeta */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Nombre del dueño de la tarjeta *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={60}
                        value={nombreTitular}
                        onChange={(e) =>
                          setNombreTitular(
                            Validaciones.formatearSoloLetras(e.target.value, 60),
                          )
                        }
                        placeholder="Tal como figura en el plástico"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 uppercase focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      />
                    </div>

                    {/* 2. Número de tarjeta */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Número de tarjeta *
                      </label>
                      <div className="relative">
                        <CreditCard
                          size={16}
                          className="absolute left-3.5 top-3 text-slate-400"
                        />
                        <input
                          type="text"
                          required
                          value={numeroTarjeta}
                          onChange={handleNumeroTarjetaChange}
                          maxLength={19}
                          placeholder="0000-0000-0000-0000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    </div>

                    {/* 3. Vencimiento y 4. Número de seguridad */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Vencimiento (MM/AA) *
                        </label>
                        <input
                          type="text"
                          required
                          value={vencimiento}
                          onChange={handleVencimientoChange}
                          placeholder="MM/AA"
                          maxLength={5}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 text-center focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Número de seguridad (CVV) *
                        </label>
                        <input
                          type="password"
                          required
                          value={codigoSeguridad}
                          onChange={handleCodigoSeguridadChange}
                          placeholder="123"
                          maxLength={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 text-center focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        />
                      </div>
                    </div>

                    {/* Correo y Destino */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Correo para recibo (opcional)
                        </label>
                        <input
                          type="email"
                          value={emailDonante}
                          onChange={(e) => setEmailDonante(e.target.value)}
                          placeholder="tu-correo@ejemplo.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Destinar mi aporte a:
                        </label>
                        <select
                          value={destino}
                          onChange={(e) => setDestino(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-rose-500"
                        >
                          <option value="Fondo General y Emergencias">
                            Fondo General y Emergencias
                          </option>
                          <option value="Alimentación de rescatados">
                            Alimentación de rescatados
                          </option>
                          <option value="Medicinas y cirugías">
                            Medicinas y cirugías
                          </option>
                          <option value="Cuidado de cachorros">
                            Cuidado de cachorros
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {errorEnvio && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorEnvio}</span>
                    </div>
                  )}

                  {/* Botones de Acción */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={cerrarModal}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition anim-press"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={enviando}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs shadow-md transition disabled:opacity-50 anim-press"
                    >
                      {enviando ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Procesando donación...</span>
                        </>
                      ) : (
                        <>
                          <Heart size={15} className="fill-white" />
                          <span>Confirmar Donación de ${montoFinal}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
