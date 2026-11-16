"use client";

import React from "react";
import { PawPrint } from "lucide-react";
import { useSiteTheme } from "@/src/context/ThemeContext";
import {
  leerConfiguracionSitio,
  parsearGaleriaSitio,
} from "@/src/services/config/site-config";

export function SiteSection({ seccionId }: { seccionId: string }) {
  const { sitePalette, sitioConfig } = useSiteTheme();
  const leer = (clave: string) => leerConfiguracionSitio(sitioConfig, clave);

  const titulo = leer(`${seccionId}_titulo`);
  const subtitulo = leer(`${seccionId}_subtitulo`);
  const descripcion = leer(`${seccionId}_descripcion`);
  const imagenes = parsearGaleriaSitio(leer(`${seccionId}_imagenes`));

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-6 md:p-12 backdrop-blur-xl">
        <div
          className="absolute -inset-4 blur-3xl rounded-full -z-10 opacity-40"
          style={{
            background: `linear-gradient(90deg, ${sitePalette.primary}33, ${sitePalette.secondary}33)`,
          }}
        />

        <div className="max-w-3xl space-y-5">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold"
            style={{
              color: sitePalette.primary,
              backgroundColor: `${sitePalette.primary}1A`,
              borderColor: `${sitePalette.primary}4D`,
            }}
          >
            <PawPrint size={14} />
            <span>{subtitulo || titulo}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            {titulo}
          </h1>

          {descripcion && (
            <p className="text-sm md:text-base text-slate-100/90 max-w-2xl leading-relaxed whitespace-pre-line">
              {descripcion}
            </p>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {imagenes.length > 0 ? (
          imagenes.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl h-56"
            >
              <img
                src={url}
                alt={`${titulo} ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))
        ) : (
          <div
            className="col-span-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 shadow-2xl h-56 text-white/80"
            style={{
              background: `linear-gradient(135deg, ${sitePalette.primary}99, ${sitePalette.accent}99)`,
            }}
          >
            <PawPrint size={30} />
            <span className="text-xs font-bold">
              Aún no hay fotos en esta sección
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
