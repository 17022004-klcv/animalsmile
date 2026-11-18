"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Heart,
  PawPrint,
  CheckCircle2,
  Sparkles,
  Clock,
  ShieldCheck,
  AlertCircle,
  Search,
  FileText,
  ArrowRight,
  X,
  BadgeCheck,
  Check,
  Send,
  Loader2,
  Zap,
} from "lucide-react";
import { useSiteTheme } from "@/src/context/ThemeContext";
import {
  leerConfiguracionSitio,
  parsearGaleriaSitio,
} from "@/src/services/config/site-config";
import { Validaciones } from "@/src/utils/validaciones";
import type { AnimalDisponibleDTO } from "@/src/app/api/adoptions/route";

interface SolicitudResultado {
  id_solicitud: string;
  estado: string;
  fecha_solicitud: string;
  animal: {
    nombre: string;
    foto_principal?: string | null;
  };
  solicitante: {
    nombre: string;
    apellido: string;
    email: string;
  };
}

export default function AdopcionesPage() {
  const { sitePalette, sitioConfig } = useSiteTheme();
  const leer = (clave: string) => leerConfiguracionSitio(sitioConfig, clave);
  const imagenes = parsearGaleriaSitio(leer("adopciones_hero_imagenes"));

  // Estados de animales y filtros
  const [animales, setAnimales] = useState<AnimalDisponibleDTO[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState<string>("todos");
  const [filtroEnergia, setFiltroEnergia] = useState<string>("todos");
  const [filtroEdad, setFiltroEdad] = useState<string>("todos");

  // Estado para el modal de adopción
  const [animalSeleccionado, setAnimalSeleccionado] =
    useState<AnimalDisponibleDTO | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [solicitudExitosa, setSolicitudExitosa] =
    useState<SolicitudResultado | null>(null);

  // Formulario del solicitante
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento_identidad: "",
    email: "",
    telefono: "",
    direccion: "",
    tipo_vivienda: "Casa propia con patio cerrado",
    tiene_mascotas: false,
    motivo_adopcion: "",
    acepta_requisitos: false,
  });

  // Cargar animales disponibles
  useEffect(() => {
    fetch("/api/adoptions")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.animales && Array.isArray(data.animales)) {
          setAnimales(data.animales);
        }
      })
      .catch((err) => {
        console.error("Error al cargar animales:", err);
      })
      .finally(() => {
        setCargando(false);
      });
  }, []);

  // Filtrado de animales
  const animalesFiltrados = useMemo(() => {
    return animales.filter((a) => {
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase();
        const coincideNombre = a.nombre.toLowerCase().includes(query);
        const coincideRaza = a.raza_variedad?.toLowerCase().includes(query);
        const coincideEspecie = a.especie.toLowerCase().includes(query);
        if (!coincideNombre && !coincideRaza && !coincideEspecie) return false;
      }

      if (filtroEspecie !== "todos") {
        if (
          filtroEspecie === "perros" &&
          !a.especie.toLowerCase().includes("perro")
        ) {
          return false;
        }
        if (
          filtroEspecie === "gatos" &&
          !a.especie.toLowerCase().includes("gato")
        ) {
          return false;
        }
        if (
          filtroEspecie === "otros" &&
          (a.especie.toLowerCase().includes("perro") ||
            a.especie.toLowerCase().includes("gato"))
        ) {
          return false;
        }
      }

      if (filtroEnergia !== "todos") {
        if (
          (a.nivel_energia || "Medio").toLowerCase() !==
          filtroEnergia.toLowerCase()
        ) {
          return false;
        }
      }

      if (filtroEdad !== "todos") {
        const meses = a.edad_estimada_meses ?? 12;
        if (filtroEdad === "cachorro" && meses > 12) return false;
        if (filtroEdad === "joven" && (meses <= 12 || meses > 36)) return false;
        if (filtroEdad === "adulto" && meses <= 36) return false;
      }

      return true;
    });
  }, [animales, busqueda, filtroEspecie, filtroEnergia, filtroEdad]);

  const abrirModalAdopcion = (animal: AnimalDisponibleDTO) => {
    setAnimalSeleccionado(animal);
    setErrorEnvio(null);
    setSolicitudExitosa(null);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setAnimalSeleccionado(null);
    setErrorEnvio(null);
    setSolicitudExitosa(null);
    setFormData({
      nombre: "",
      apellido: "",
      documento_identidad: "",
      email: "",
      telefono: "",
      direccion: "",
      tipo_vivienda: "Casa propia con patio cerrado",
      tiene_mascotas: false,
      motivo_adopcion: "",
      acepta_requisitos: false,
    });
  };

  const handleSubmitAdopcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalSeleccionado) return;

    if (!formData.acepta_requisitos) {
      setErrorEnvio(
        "Debes aceptar los requisitos y compromisos de adopción responsable.",
      );
      return;
    }

    const errNombre = Validaciones.validarSoloLetras(formData.nombre, "Nombre", {
      requerido: true,
      maxLength: 50,
    });
    if (errNombre) {
      setErrorEnvio(errNombre);
      return;
    }

    const errApellido = Validaciones.validarSoloLetras(
      formData.apellido,
      "Apellido",
      { requerido: true, maxLength: 50 },
    );
    if (errApellido) {
      setErrorEnvio(errApellido);
      return;
    }

    const errEmail = Validaciones.validarEmail(formData.email, true);
    if (errEmail) {
      setErrorEnvio(errEmail);
      return;
    }

    const errTelefono = Validaciones.validarTelefono(formData.telefono, true);
    if (errTelefono) {
      setErrorEnvio(errTelefono);
      return;
    }

    setEnviando(true);
    setErrorEnvio(null);

    try {
      const response = await fetch("/api/adoptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_animal: animalSeleccionado.id_animal,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "No se pudo procesar la solicitud.");
      }

      setSolicitudExitosa(data.solicitud);
    } catch (err: unknown) {
      const mensaje =
        err instanceof Error ? err.message : "Error al enviar la solicitud.";
      setErrorEnvio(mensaje);
    } finally {
      setEnviando(false);
    }
  };

  const calcularEdadTexto = (meses: number | null) => {
    if (!meses) return "Edad aproximada no registrada";
    if (meses < 12) {
      return `${meses} ${meses === 1 ? "mes" : "meses"}`;
    }
    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    if (mesesRestantes === 0) {
      return `${anos} ${anos === 1 ? "año" : "años"}`;
    }
    return `${anos} a ${mesesRestantes} m`;
  };

  return (
    <div className="w-full">
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
              <span>{leer("adopciones_hero_subtitulo")}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              {leer("adopciones_hero_titulo")}{" "}
              <span className="text-emerald-400">
                {leer("sitio_nombre") || "AnimalSmile"}
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed whitespace-pre-line">
              {leer("adopciones_hero_descripcion")}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#catalogo-animales"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 anim-press"
              >
                <PawPrint size={18} />
                <span>Ver Mascotas Disponibles</span>
              </a>
              <a
                href="#proceso-adopcion"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all hover:-translate-y-0.5 anim-press"
              >
                <FileText size={18} />
                <span>Requisitos de Adopción</span>
              </a>
            </div>
          </div>

          {/* Lado Derecho: Avatar Ilustrado / Imagen de Mascota */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 anim-zoom-img anim-fade-up delay-2">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl anim-pulse" />
              {imagenes[0] ? (
                <img
                  src={imagenes[0]}
                  alt="Mascota en adopción"
                  className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 rounded-full border-4 border-white/10 text-emerald-400 p-6 z-10 shadow-2xl">
                  <div className="relative mb-3">
                    <PawPrint size={68} className="text-emerald-400" />
                    <Sparkles
                      size={24}
                      className="text-amber-400 absolute -top-1 -right-2 animate-bounce"
                    />
                  </div>
                  <span className="text-base font-extrabold text-slate-100 text-center">
                    Adopta con Amor
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold text-center mt-1">
                    Cuidado Veterinario Completo
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divisor SVG en forma de Ola (text-white + -mb-px para blanco puro sin línea) */}
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

      {/* 2. SECCIÓN: BENEFICIOS Y CATÁLOGO DE MASCOTAS -> FONDO BLANCO PURO (bg-white) */}
      <section className="w-full bg-white pt-6 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* BARRA DE BENEFICIOS Y COMPROMISOS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 anim-hover-lift anim-fade-up delay-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Costo Solidario
                </p>
                <p className="text-[11px] text-slate-500">$0.00 en Adopción</p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 anim-hover-lift anim-fade-up delay-2">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  100% Vacunados
                </p>
                <p className="text-[11px] text-slate-500">Esquema al día</p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 anim-hover-lift anim-fade-up delay-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Heart size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Esterilización
                </p>
                <p className="text-[11px] text-slate-500">
                  Garantizada y segura
                </p>
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3 anim-hover-lift anim-fade-up delay-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Seguimiento Ético
                </p>
                <p className="text-[11px] text-slate-500">
                  Apoyo post-adopción
                </p>
              </div>
            </div>
          </div>

          {/* CATÁLOGO DE ANIMALES DISPONIBLES */}
          <div id="catalogo-animales" className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 anim-fade-up">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                  <Sparkles size={14} />
                  <span>Nuestros Huéspedes</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                  {leer("adopciones_catalogo_titulo")}
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm max-w-xl whitespace-pre-line">
                  {leer("adopciones_catalogo_descripcion")}
                </p>
              </div>

              <div className="text-xs font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 self-start md:self-auto shadow-sm anim-fade-in delay-5">
                Mostrando{" "}
                <span className="text-emerald-600 font-extrabold">
                  {animalesFiltrados.length}
                </span>{" "}
                amigos peludos
              </div>
            </div>

            {/* BARRA DE FILTROS Y BÚSQUEDA */}
            <div className="bg-slate-50/70 rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 anim-fade-up delay-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Buscador */}
                <div className="md:col-span-5 relative">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-3 text-slate-400"
                  />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, raza o especie..."
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda("")}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 anim-press"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Filtro Especie */}
                <div className="md:col-span-7 flex flex-wrap gap-2 items-center justify-start md:justify-end">
                  <div className="flex bg-white border border-slate-200/80 p-1 rounded-2xl">
                    {[
                      { id: "todos", label: "Todos" },
                      { id: "perros", label: "🐶 Perros" },
                      { id: "gatos", label: "🐱 Gatos" },
                      { id: "otros", label: "🐾 Otros" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFiltroEspecie(tab.id)}
                         className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all anim-press ${
                          filtroEspecie === tab.id
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Filtro Energía */}
                  <select
                    value={filtroEnergia}
                    onChange={(e) => setFiltroEnergia(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="todos">⚡ Energía: Todos</option>
                    <option value="Bajo">Tranquilo / Baja</option>
                    <option value="Medio">Moderada / Media</option>
                    <option value="Alto">Enérgico / Alta</option>
                  </select>

                  {/* Filtro Edad */}
                  <select
                    value={filtroEdad}
                    onChange={(e) => setFiltroEdad(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="todos">🎂 Edad: Todas</option>
                    <option value="cachorro">Cachorro (0 - 1 año)</option>
                    <option value="joven">Joven (1 - 3 años)</option>
                    <option value="adulto">Adulto (3+ años)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* GRID DE CARDS */}
            {cargando ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                <p className="text-sm font-semibold">
                  Buscando mascotas listas para adopción...
                </p>
              </div>
            ) : animalesFiltrados.length === 0 ? (
              <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4 anim-hover-lift anim-scale-in delay-6">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                  <Search size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  No encontramos mascotas con esos filtros
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Prueba restableciendo los filtros o buscando con otros
                  términos.
                </p>
                <button
                  onClick={() => {
                    setBusqueda("");
                    setFiltroEspecie("todos");
                    setFiltroEnergia("todos");
                    setFiltroEdad("todos");
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition anim-press"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {animalesFiltrados.map((animal) => (
                  <div
                    key={animal.id_animal}
                    className="group relative bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden anim-hover-lift anim-fade-up"
                  >
                    {/* IMAGEN DE LA TARJETA */}
                    <div className="relative h-64 overflow-hidden bg-slate-100 anim-zoom-img">
                      <img
                        src={
                          animal.foto_principal ||
                          "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={animal.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold shadow-md">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Disponible</span>
                      </div>

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-black shadow-md">
                        {animal.especie}
                      </div>

                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-black tracking-tight drop-shadow-md">
                            {animal.nombre}
                          </h3>
                          <span className="text-xs bg-emerald-500/90 backdrop-blur-sm px-2.5 py-0.5 rounded-lg font-bold">
                            {calcularEdadTexto(animal.edad_estimada_meses)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 font-medium truncate mt-0.5">
                          {animal.raza_variedad || "Mestizo"}
                        </p>
                      </div>
                    </div>

                    {/* CONTENIDO DE LA TARJETA */}
                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-3">
                        {animal.temperamento && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                            “{animal.temperamento}”
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-xl text-slate-700">
                            <Zap
                              size={14}
                              className="text-amber-500 shrink-0"
                            />
                            <span className="truncate">
                              Energía:{" "}
                              <strong className="text-slate-900">
                                {animal.nivel_energia || "Media"}
                              </strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-xl text-slate-700">
                            <BadgeCheck
                              size={14}
                              className="text-emerald-500 shrink-0"
                            />
                            <span className="truncate">
                              Esterilizado:{" "}
                              <strong className="text-emerald-700">Sí</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                            Apto con:
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              animal.compatibilidad?.ninos !== false
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            👶 Niños
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              animal.compatibilidad?.perros !== false
                                ? "bg-teal-50 text-teal-700 border border-teal-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            🐶 Perros
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              animal.compatibilidad?.gatos === true
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            🐱 Gatos
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => abrirModalAdopcion(animal)}
                          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all active:scale-[0.98] group-hover:shadow-emerald-500/30 anim-press"
                        >
                          <Heart size={16} className="fill-white" />
                          <span>Adoptar a {animal.nombre}</span>
                          <ArrowRight size={14} className="ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN: CÓMO FUNCIONA EL PROCESO DE ADOPCIÓN -> FRANJA OSCURA DE ANCHO COMPLETO (bg-slate-900) */}
      <section
        id="proceso-adopcion"
        className="w-full bg-slate-900 text-white py-16 md:py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-3 anim-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles size={14} />
              <span>Transparente y Solidario</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {leer("adopciones_proceso_titulo")}
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line">
              {leer("adopciones_proceso_descripcion")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 space-y-3 backdrop-blur-sm anim-hover-lift anim-fade-up delay-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="font-bold text-white text-base">
                Selección de Mascota
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Elige el animal que mejor se adapte a tu estilo de vida, espacio
                disponible y nivel de actividad.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 space-y-3 backdrop-blur-sm anim-hover-lift anim-fade-up delay-2">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="font-bold text-white text-base">
                Solicitud en Línea
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Llena el formulario con tus datos y aceptación de requisitos. Tu
                solicitud quedará registrada en estado{" "}
                <strong className="text-amber-300">Pendiente</strong>.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 space-y-3 backdrop-blur-sm anim-hover-lift anim-fade-up delay-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="font-bold text-white text-base">
                Entrevista y Evaluación
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Te contactamos vía telefónica para resolver dudas y coordinar la
                visita domiciliaria previa con nuestro comité.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-6 space-y-3 backdrop-blur-sm anim-hover-lift anim-fade-up delay-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-sm">
                04
              </div>
              <h3 className="font-bold text-white text-base">
                Bienvenida a Casa
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Firma del acta de adopción responsable y entrega de tu nuevo
                compañero con cartilla médica completa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MODAL DE ADOPCIÓN CON REQUISITOS Y FORMULARIO (Estado PENDIENTE) */}
      {/* ========================================================================= */}
      {modalAbierto && animalSeleccionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 anim-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 anim-scale-in delay-1">
            {/* Cabecera del Modal */}
            <div className="bg-gradient-to-r from-[#1e2749] to-slate-800 text-white p-6 relative">
              <button
                type="button"
                onClick={cerrarModal}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition anim-press"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/20 shrink-0 bg-slate-700 anim-zoom-img">
                  <img
                    src={
                      animalSeleccionado.foto_principal ||
                      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={animalSeleccionado.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    <Heart size={12} className="fill-current" />
                    <span>Solicitud de Adopción Responsable</span>
                  </div>
                  <h3 className="text-2xl font-black">
                    Adoptar a {animalSeleccionado.nombre}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {animalSeleccionado.especie} •{" "}
                    {animalSeleccionado.raza_variedad || "Mestizo"} (
                    {animalSeleccionado.codigo_identificador})
                  </p>
                </div>
              </div>
            </div>

            {/* Contenido del Modal: Confirmación Exitosa O Formulario */}
            <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {solicitudExitosa ? (
                <div className="text-center space-y-6 py-4 animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 rounded-full bg-amber-100 border-4 border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                    <Clock size={40} className="animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500 text-white text-xs font-black tracking-wide shadow-sm">
                      <Clock size={14} />
                      <span>ESTADO: PENDIENTE (En Proceso de Aceptación)</span>
                    </div>

                    <h4 className="text-2xl font-black text-slate-900 pt-1">
                      ¡Tu solicitud para {animalSeleccionado.nombre} ha sido
                      enviada!
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                      Muchas gracias,{" "}
                      <strong className="text-slate-900">
                        {solicitudExitosa.solicitante.nombre}
                      </strong>
                      . Hemos registrado tu postulación con éxito. Nuestro
                      comité de bienestar animal revisará tus datos y evaluará
                      los requisitos de adopción.
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">
                        Número de Solicitud:
                      </span>
                      <strong className="text-slate-800 font-mono">
                        {solicitudExitosa.id_solicitud.slice(0, 13)}...
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Mascota elegida:</span>
                      <strong className="text-slate-800">
                        {animalSeleccionado.nombre}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Correo registrado:</span>
                      <strong className="text-slate-800 truncate max-w-[200px]">
                        {solicitudExitosa.solicitante.email}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Próximo paso:</span>
                      <span className="text-emerald-700 font-bold">
                        Entrevista telefónica (24 a 48 hrs)
                      </span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-800 text-left space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 size={16} />
                      ¿Qué ocurrirá ahora?
                    </p>
                    <p className="leading-relaxed">
                      1. Mantén tu teléfono atento; un voluntario o evaluador se
                      comunicará para conocer a tu familia.
                    </p>
                    <p className="leading-relaxed">
                      2. Coordinaremos una videollamada o visita domiciliaria
                      para verificar las condiciones del espacio.
                    </p>
                    <p className="leading-relaxed">
                      3. Una vez aprobada, programaremos la entrega oficial y
                      firma del contrato de adopción.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition anim-press"
                  >
                    Entendido y Regresar al Catálogo
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitAdopcion} className="space-y-6">
                  {/* REQUISITOS OBLIGATORIOS DE ADOPCIÓN */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3 text-xs">
                    <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                      <AlertCircle size={18} className="text-amber-600" />
                      <h4>Requisitos de Adopción Responsable</h4>
                    </div>

                    <ul className="space-y-2 text-slate-700 leading-relaxed">
                      <li className="flex items-start gap-2">
                        <Check
                          size={14}
                          className="text-emerald-600 shrink-0 mt-0.5"
                        />
                        <span>
                          <strong>Edad mínima:</strong> Ser mayor de 21 años y
                          presentar documento de identidad vigente (DUI o
                          pasaporte).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check
                          size={14}
                          className="text-emerald-600 shrink-0 mt-0.5"
                        />
                        <span>
                          <strong>Consenso familiar:</strong> Todos los miembros
                          del hogar deben estar de acuerdo con la adopción.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check
                          size={14}
                          className="text-emerald-600 shrink-0 mt-0.5"
                        />
                        <span>
                          <strong>Espacio seguro:</strong> Contar con vivienda
                          propia o autorización por escrito del arrendador (sin
                          encadenamientos ni azoteas).
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check
                          size={14}
                          className="text-emerald-600 shrink-0 mt-0.5"
                        />
                        <span>
                          <strong>Compromiso económico y de salud:</strong>{" "}
                          Capacidad para alimentación de calidad, vacunas
                          anuales y atención veterinaria oportuna.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check
                          size={14}
                          className="text-emerald-600 shrink-0 mt-0.5"
                        />
                        <span>
                          <strong>Seguimiento:</strong> Aceptar entrevista
                          domiciliaria y seguimiento post-adopción a los 1, 3 y
                          6 meses.
                        </span>
                      </li>
                    </ul>

                    <div className="pt-2 border-t border-amber-200/80">
                      <label className="flex items-start gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          required
                          checked={formData.acepta_requisitos}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              acepta_requisitos: e.target.checked,
                            }))
                          }
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-bold text-amber-950">
                          He leído y me comprometo a cumplir con todos los
                          requisitos de adopción responsable. *
                        </span>
                      </label>
                    </div>
                  </div>

                  {errorEnvio && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorEnvio}</span>
                    </div>
                  )}

                  {/* CAMPOS DEL FORMULARIO */}
                  <div className="space-y-4">
                    <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                      Datos del Solicitante
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.nombre}
                          onChange={(e) =>
                            setFormData({ ...formData, nombre: e.target.value })
                          }
                          placeholder="Tu nombre"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.apellido}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              apellido: e.target.value,
                            })
                          }
                          placeholder="Tus apellidos"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Documento de Identidad (DUI / Cédula) *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.documento_identidad}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              documento_identidad: e.target.value,
                            })
                          }
                          placeholder="01234567-8"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Teléfono o WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.telefono}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              telefono: e.target.value,
                            })
                          }
                          placeholder="+503 7000-0000"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Correo electrónico *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="tu-correo@ejemplo.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Dirección completa y Municipio *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.direccion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            direccion: e.target.value,
                          })
                        }
                        placeholder="Colonia, calle, polígono, municipio..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          Tipo de Vivienda *
                        </label>
                        <select
                          value={formData.tipo_vivienda}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tipo_vivienda: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Casa propia con patio cerrado">
                            Casa propia con patio cerrado
                          </option>
                          <option value="Casa propia sin patio">
                            Casa propia sin patio
                          </option>
                          <option value="Casa alquilada con permiso de mascotas">
                            Casa alquilada con permiso
                          </option>
                          <option value="Apartamento pet-friendly">
                            Apartamento pet-friendly
                          </option>
                          <option value="Finca o casa de campo">
                            Finca o casa de campo
                          </option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          ¿Tienes otras mascotas actualmente?
                        </label>
                        <select
                          value={formData.tiene_mascotas ? "si" : "no"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              tiene_mascotas: e.target.value === "si",
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="no">No, sería mi única mascota</option>
                          <option value="si">Sí, conviviría con otras</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        ¿Por qué deseas adoptar a {animalSeleccionado.nombre}?
                      </label>
                      <textarea
                        rows={2}
                        value={formData.motivo_adopcion}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            motivo_adopcion: e.target.value,
                          })
                        }
                        placeholder="Cuéntanos un poco sobre tu estilo de vida y el amor que le brindarás..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* BOTÓN DE ENVÍO */}
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
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 anim-press"
                      >
                        {enviando ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Enviando solicitud...</span>
                          </>
                        ) : (
                          <>
                            <Send size={15} />
                            <span>Confirmar y Enviar Solicitud</span>
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
