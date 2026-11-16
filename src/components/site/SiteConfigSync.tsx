"use client";

import { useEffect } from "react";
import {
  paletaSitioDesdeConfig,
  useSiteTheme,
} from "@/src/context/ThemeContext";
import { obtenerConfiguracionSitioPublica } from "@/src/services/config/config-client";
import { CONFIGURACION_SITIO_DEFECTO } from "@/src/services/config/site-config";

export function SiteConfigSync() {
  const { actualizarPaletaSitio, setSitioConfig } = useSiteTheme();

  useEffect(() => {
    let cancelado = false;

    obtenerConfiguracionSitioPublica()
      .then((configuracion) => {
        if (cancelado) return;
        setSitioConfig({ ...CONFIGURACION_SITIO_DEFECTO, ...configuracion });
        if (Object.keys(configuracion).some((clave) => clave.startsWith("color_"))) {
          actualizarPaletaSitio(paletaSitioDesdeConfig(configuracion));
        }
      })
      .catch(() => {
        if (cancelado) return;
        setSitioConfig(CONFIGURACION_SITIO_DEFECTO);
      });

    return () => {
      cancelado = true;
    };
  }, [actualizarPaletaSitio, setSitioConfig]);

  return null;
}
