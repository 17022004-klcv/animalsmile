"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PawPrint, Phone, Mail, MapPin, Clock, Heart } from "lucide-react";
import { useSiteTheme } from "@/src/context/ThemeContext";
import { leerConfiguracionSitio } from "@/src/services/config/site-config";

const ENLACES = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Sobre Nosotros" },
  { href: "/servicios", label: "Servicios" },
  { href: "/rescates", label: "Rescates" },
  { href: "/adopciones", label: "Adopciones" },
  { href: "/donar", label: "Donar" },
];

export default function Footer() {
  const { sitePalette, sitioConfig } = useSiteTheme();
  const leer = (clave: string) => leerConfiguracionSitio(sitioConfig, clave);

  const nombreSitio = leer("sitio_nombre") || "AnimalSmile";
  const lemaSitio = leer("sitio_lema") || "Refugio de Animales";
  const logoSitio = leer("sitio_logo");
  const [anio, setAnio] = useState<number>(2026);

  useEffect(() => {
    setAnio(new Date().getFullYear());
  }, []);

  return (
    <footer className="relative w-full bg-[#1e2749] text-slate-300">
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${sitePalette.primary} 0%, ${sitePalette.accent} 50%, ${sitePalette.secondary} 100%)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Identidad */}
        <div className="space-y-4 lg:col-span-1">
          <Link href="/" className="flex items-center gap-2.5 group">
            {logoSitio ? (
              <img
                src={logoSitio}
                alt={`${nombreSitio} Logo`}
                className="w-10 h-10 object-contain"
              />
            ) : (
              <PawPrint size={32} style={{ color: sitePalette.primary }} />
            )}
            <span className="font-extrabold text-lg text-white tracking-tight">
              {nombreSitio}
            </span>
          </Link>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {lemaSitio}
          </p>
          <p className="text-sm leading-relaxed text-slate-400">
            Rescatamos, rehabilitamos y buscamos hogar para animales en
            situación de riesgo. Cada huella cuenta y tu apoyo lo hace posible.
          </p>
        </div>

        {/* Enlaces rápidos */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <PawPrint size={16} style={{ color: sitePalette.primary }} />
            <span>Secciones</span>
          </h3>
          <ul className="space-y-2.5 text-sm">
            {ENLACES.map((enlace) => (
              <li key={enlace.href}>
                <Link
                  href={enlace.href}
                  className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sitePalette.primary }}
                  />
                  {enlace.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Phone size={16} style={{ color: sitePalette.primary }} />
            <span>Contacto</span>
          </h3>
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-start gap-3">
              <Phone
                size={17}
                className="shrink-0 mt-0.5"
                style={{ color: sitePalette.accent }}
              />
              <div>
                <p className="text-white font-semibold">Teléfono / WhatsApp</p>
                <a
                  href="tel:+50322227387"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  +503 2222-7387
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail
                size={17}
                className="shrink-0 mt-0.5"
                style={{ color: sitePalette.accent }}
              />
              <div>
                <p className="text-white font-semibold">Correo electrónico</p>
                <a
                  href="mailto:contacto@animalsmile.org"
                  className="text-slate-400 hover:text-white transition-colors break-all"
                >
                  contacto@animalsmile.org
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <MapPin
                size={17}
                className="shrink-0 mt-0.5"
                style={{ color: sitePalette.accent }}
              />
              <div>
                <p className="text-white font-semibold">Ubicación</p>
                <p className="text-slate-400">San Salvador, El Salvador</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Horario y donación */}
        <div className="space-y-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
            <Clock size={16} style={{ color: sitePalette.primary }} />
            <span>Horario de atención</span>
          </h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center justify-between gap-4">
              <span>Lunes a Viernes</span>
              <span className="text-white font-semibold">8:00 - 18:00</span>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span>Sábado</span>
              <span className="text-white font-semibold">8:00 - 14:00</span>
            </li>
            <li className="flex items-center justify-between gap-4">
              <span>Domingo</span>
              <span className="text-white font-semibold">Cerrado</span>
            </li>
          </ul>

          <Link
            href="/donar"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-2xl font-black text-sm text-white shadow-lg transition-all hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${sitePalette.primary} 0%, ${sitePalette.accent} 100%)`,
            }}
          >
            <Heart size={16} className="fill-white" />
            <span>Donar ahora</span>
          </Link>
        </div>
      </div>

      {/* Barra inferior de derechos */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            © {anio}{" "}
            <span className="text-white font-bold">Karla Carranza</span>. Todos
            los derechos reservados.
          </p>
          <p className="flex items-center gap-1.5">
            <PawPrint size={13} style={{ color: sitePalette.primary }} />
            <span>Hecho con amor por los animales</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
