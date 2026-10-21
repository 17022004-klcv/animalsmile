/** Modelo `ConfiguracionSistema` (tabla `configuracion_sistema`). */
export interface ConfiguracionSistema {
  id_config: string;
  clave: string;
  valor: string;
  tipo_dato: string;
  descripcion: string | null;
  modulo: string | null;
  editable: boolean | null;
  actualizado_por: string | null;
  actualizado_en: string | null;
}

/** Modelo `ConfiguracionSitio` (tabla `configuracion_sitio`). */
export interface ConfiguracionSitio {
  id_config_sitio: string;
  clave: string;
  valor: string | null;
  tipo_dato: string | null;
  seccion: string | null;
  descripcion: string | null;
  actualizado_por: string | null;
  actualizado_en: string | null;
}
