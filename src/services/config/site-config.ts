export type TipoCampoSitio = "text" | "textarea" | "image" | "gallery" | "color";

export interface CampoSitio {
  key: string;
  label: string;
  type: TipoCampoSitio;
  placeholder?: string;
  help?: string;
  max?: number;
}

export interface SeccionSitio {
  id: string;
  label: string;
  description: string;
  fields: CampoSitio[];
}

const CAMPOS_CONTENIDO = (id: string): CampoSitio[] => [
  {
    key: `${id}_titulo`,
    label: "Título",
    type: "text",
    placeholder: "Título principal de la sección",
  },
  {
    key: `${id}_subtitulo`,
    label: "Subtítulo",
    type: "text",
    placeholder: "Frase corta que acompaña al título",
  },
  {
    key: `${id}_descripcion`,
    label: "Descripción",
    type: "textarea",
    placeholder: "Describe esta sección para los visitantes del sitio",
  },
  {
    key: `${id}_imagenes`,
    label: "Fotos de la sección",
    type: "gallery",
    help: "Puedes subir hasta 6 imágenes. La primera se usa como portada.",
  },
];

export const SECCIONES_SITIO: SeccionSitio[] = [
  {
    id: "general",
    label: "General",
    description: "Identidad del sitio y colores del tema público.",
    fields: [
      {
        key: "sitio_nombre",
        label: "Nombre del sitio",
        type: "text",
        placeholder: "AnimalSmile",
      },
      {
        key: "sitio_lema",
        label: "Lema",
        type: "text",
        placeholder: "Refugio de Animales",
      },
      {
        key: "sitio_logo",
        label: "Logo",
        type: "image",
        help: "Se usa en el navbar del sitio público.",
      },
      { key: "color_primary", label: "Color principal", type: "color" },
      { key: "color_secondary", label: "Color secundario", type: "color" },
      { key: "color_accent", label: "Color de acento", type: "color" },
      { key: "color_dark", label: "Color oscuro", type: "color" },
      { key: "color_muted", label: "Color de fondo", type: "color" },
    ],
  },
  {
    id: "inicio",
    label: "Inicio",
    description: "Portada principal del sitio.",
    fields: [
      {
        key: "inicio_etiqueta",
        label: "Etiqueta",
        type: "text",
        placeholder: "Transformando vidas todos los días",
      },
      {
        key: "inicio_titulo",
        label: "Título",
        type: "text",
        placeholder: "Dales una segunda oportunidad a quien",
      },
      {
        key: "inicio_titulo_destacado",
        label: "Título destacado",
        type: "text",
        placeholder: "más lo necesita",
      },
      {
        key: "inicio_descripcion",
        label: "Descripción",
        type: "textarea",
        placeholder: "Describe la labor del refugio",
      },
      {
        key: "inicio_cta_primario",
        label: "Botón principal",
        type: "text",
        placeholder: "Quiero Adoptar",
      },
      {
        key: "inicio_cta_secundario",
        label: "Botón secundario",
        type: "text",
        placeholder: "Apoyar un Rescate",
      },
      {
        key: "inicio_imagenes",
        label: "Fotos de la portada",
        type: "gallery",
        help: "Puedes subir hasta 6 imágenes. La primera se usa como portada.",
      },
    ],
  },
  {
    id: "nosotros",
    label: "Sobre Nosotros",
    description: "Historia, misión y presentación del refugio.",
    fields: CAMPOS_CONTENIDO("nosotros"),
  },
  {
    id: "servicios",
    label: "Servicios",
    description: "Servicios y atención que ofrece el refugio.",
    fields: CAMPOS_CONTENIDO("servicios"),
  },
  {
    id: "rescates",
    label: "Rescates",
    description: "Información sobre los rescates y el proceso de recuperación.",
    fields: CAMPOS_CONTENIDO("rescates"),
  },
  {
    id: "adopciones",
    label: "Adopciones",
    description: "Información para adoptar y encontrar un nuevo hogar.",
    fields: CAMPOS_CONTENIDO("adopciones"),
  },
  {
    id: "donar",
    label: "Donar",
    description: "Mensaje para invitar a apoyar económicamente al refugio.",
    fields: CAMPOS_CONTENIDO("donar"),
  },
];

const IMAGENES_INICIO = [
  "https://www.campustraining.es/wp-content/uploads/2023/05/sueldo-cuidador-animales-zoologico.jpg.webp",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80",
  "https://www.avanzaentucarrera.com/orientacion/comp/uploads/2014/02/cuidador-zoo-1024x543.jpg",
];

export const CONFIGURACION_SITIO_DEFECTO: Record<string, string> = {
  sitio_nombre: "AnimalSmile",
  sitio_lema: "Refugio de Animales",
  sitio_logo: "/img/logo_animalsmile.png",
  color_primary: "#ED019F",
  color_secondary: "#727EFF",
  color_accent: "#FA5780",
  color_dark: "#666DF3",
  color_muted: "#7CA6C2",
  inicio_etiqueta: "Transformando vidas todos los días",
  inicio_titulo: "Dales una segunda oportunidad a quien",
  inicio_titulo_destacado: "más lo necesita",
  inicio_descripcion:
    "En AnimalSmile rescatamos, rehabilitamos y cuidamos a perros, gatos y especies en situación de riesgo. Con tu apoyo, cada huella encuentra un hogar lleno de amor.",
  inicio_cta_primario: "Quiero Adoptar",
  inicio_cta_secundario: "Apoyar un Rescate",
  inicio_imagenes: JSON.stringify(IMAGENES_INICIO),
  nosotros_titulo: "Sobre Nosotros",
  nosotros_subtitulo: "Conoce nuestra historia",
  nosotros_descripcion:
    "Somos un refugio dedicado al rescate, rehabilitación y adopción responsable de animales en situación de riesgo.",
  nosotros_imagenes: "[]",
  servicios_titulo: "Servicios",
  servicios_subtitulo: "Cómo cuidamos a los animales",
  servicios_descripcion:
    "Ofrecemos atención veterinaria, alimentación, rehabilitación y acompañamiento durante todo el proceso de adopción.",
  servicios_imagenes: "[]",
  rescates_titulo: "Rescates",
  rescates_subtitulo: "Cada rescate cuenta",
  rescates_descripcion:
    "Atendemos casos de abandono y maltrato, brindando un espacio seguro mientras nuestros animales esperan un nuevo hogar.",
  rescates_imagenes: "[]",
  adopciones_titulo: "Adopciones",
  adopciones_subtitulo: "Encuentra a tu compañero",
  adopciones_descripcion:
    "Conoce a los animales que buscan una familia y completa el proceso de adopción responsable.",
  adopciones_imagenes: "[]",
  donar_titulo: "Donar",
  donar_subtitulo: "Tu ayuda transforma vidas",
  donar_descripcion:
    "Tu donación nos permite cubrir alimentación, tratamientos médicos y el cuidado diario de nuestros animales.",
  donar_imagenes: "[]",
};

export function mapaConfiguracionSitio(
  filas: { clave: string; valor: string | null }[],
): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (const fila of filas) {
    if (fila.valor !== null) mapa[fila.clave] = fila.valor;
  }
  return mapa;
}

export function leerConfiguracionSitio(
  configuracion: Record<string, string>,
  clave: string,
): string {
  return configuracion[clave] ?? CONFIGURACION_SITIO_DEFECTO[clave] ?? "";
}

export function parsearGaleriaSitio(valor: string | null | undefined): string[] {
  if (!valor) return [];
  try {
    const data = JSON.parse(valor);
    if (Array.isArray(data)) {
      return data.filter((item): item is string => typeof item === "string" && !!item);
    }
  } catch {
    if (valor.startsWith("/") || /^https?:\/\//i.test(valor)) return [valor];
  }
  return valor
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function serializarGaleriaSitio(urls: string[]): string {
  return JSON.stringify(urls.filter(Boolean));
}

export function camposDeSeccion(id: string): CampoSitio[] {
  return SECCIONES_SITIO.find((seccion) => seccion.id === id)?.fields ?? [];
}
