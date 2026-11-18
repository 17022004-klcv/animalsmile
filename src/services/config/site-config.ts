export type TipoCampoSitio = "text" | "textarea" | "image" | "gallery" | "color";

export interface CampoSitio {
  key: string;
  label: string;
  type: TipoCampoSitio;
  placeholder?: string;
  help?: string;
}

export interface SubseccionSitio {
  id: string;
  label: string;
  description?: string;
  fields: CampoSitio[];
}

export interface SeccionSitio {
  id: string;
  label: string;
  description: string;
  subsections: SubseccionSitio[];
}

const AYUDA_GALERIA =
  "Puedes subir hasta 6 imágenes. La primera se usa como portada.";

const texto = (
  key: string,
  label: string,
  placeholder?: string,
): CampoSitio => ({ key, label, type: "text", placeholder });

const area = (
  key: string,
  label: string,
  placeholder?: string,
): CampoSitio => ({ key, label, type: "textarea", placeholder });

const galeria = (key: string, label: string, help = AYUDA_GALERIA): CampoSitio => ({
  key,
  label,
  type: "gallery",
  help,
});

const imagen = (key: string, label: string, help?: string): CampoSitio => ({
  key,
  label,
  type: "image",
  help,
});

const color = (key: string, label: string): CampoSitio => ({
  key,
  label,
  type: "color",
});

export const SECCIONES_SITIO: SeccionSitio[] = [
  {
    id: "general",
    label: "General",
    description: "Identidad del sitio y colores del tema público.",
    subsections: [
      {
        id: "general_identidad",
        label: "Identidad",
        description: "Nombre, lema y logo del refugio.",
        fields: [
          texto("sitio_nombre", "Nombre del sitio", "AnimalSmile"),
          texto("sitio_lema", "Lema", "Refugio de Animales"),
          imagen("sitio_logo", "Logo", "Se usa en el navbar del sitio público."),
        ],
      },
      {
        id: "general_colores",
        label: "Colores del tema",
        description: "Paleta personalizada usada en el sitio público.",
        fields: [
          color("color_primary", "Color principal"),
          color("color_secondary", "Color secundario"),
          color("color_accent", "Color de acento"),
          color("color_dark", "Color oscuro"),
          color("color_muted", "Color de fondo"),
        ],
      },
    ],
  },
  {
    id: "inicio",
    label: "Inicio",
    description: "Portada principal del sitio.",
    subsections: [
      {
        id: "inicio_hero",
        label: "Portada (Hero)",
        description: "Bloque de bienvenida con imagen principal.",
        fields: [
          texto("inicio_etiqueta", "Etiqueta", "Transformando vidas todos los días"),
          texto("inicio_titulo", "Título", "Dales una segunda oportunidad a quien"),
          texto("inicio_titulo_destacado", "Título destacado", "más lo necesita"),
          area("inicio_descripcion", "Descripción", "Describe la labor del refugio"),
          texto("inicio_cta_primario", "Botón principal", "Quiero Adoptar"),
          texto("inicio_cta_secundario", "Botón secundario", "Apoyar un Rescate"),
          galeria("inicio_imagenes", "Fotos de la portada"),
        ],
      },
      {
        id: "inicio_servicios",
        label: "Tarjetas de servicios",
        description: "Encabezado de las tarjetas de servicios del inicio.",
        fields: [
          texto(
            "inicio_servicios_titulo",
            "Título",
            "Cuidamos con amor la salud de tu futura mascota",
          ),
          area("inicio_servicios_descripcion", "Descripción"),
        ],
      },
      {
        id: "inicio_esteriliza",
        label: "Banner de esterilización",
        description: "Banner promocional de esterilización.",
        fields: [
          texto("inicio_esteriliza_titulo", "Título", "Cuida su salud, protege su futuro."),
          texto("inicio_esteriliza_subtitulo", "Subtítulo", "¡Esteriliza a tus mascotas!"),
          galeria("inicio_esteriliza_imagenes", "Imágenes del banner"),
        ],
      },
      {
        id: "inicio_cifras",
        label: "Logros en cifras",
        description: "Encabezado de la sección de estadísticas.",
        fields: [
          texto("inicio_cifras_titulo", "Título", "Nuestros logros en cifras"),
          area("inicio_cifras_subtitulo", "Subtítulo"),
        ],
      },
      {
        id: "inicio_horarios",
        label: "Horarios de atención",
        description: "Encabezado de la sección de horarios.",
        fields: [
          texto("inicio_horarios_titulo", "Título", "Horarios de atención"),
          area("inicio_horarios_subtitulo", "Subtítulo"),
          galeria("inicio_horarios_imagenes", "Imágenes de la sección"),
        ],
      },
    ],
  },
  {
    id: "nosotros",
    label: "Sobre Nosotros",
    description: "Historia, misión, visión y valores del refugio.",
    subsections: [
      {
        id: "nosotros_hero",
        label: "Portada (Hero)",
        description: "Presentación principal del refugio.",
        fields: [
          texto("nosotros_hero_etiqueta", "Etiqueta", "Conoce Nuestra Historia"),
          texto("nosotros_hero_titulo", "Título", "Más que un refugio,"),
          texto("nosotros_hero_titulo_destacado", "Título destacado", "somos una segunda oportunidad"),
          area("nosotros_hero_descripcion", "Descripción", "Nacimos de la pasión y el compromiso..."),
          galeria("nosotros_hero_imagenes", "Fotos de la portada"),
        ],
      },
      {
        id: "nosotros_mision",
        label: "Misión",
        description: "Tarjeta de la misión del refugio.",
        fields: [
          texto("nosotros_mision_titulo", "Título", "Nuestra Misión"),
          area("nosotros_mision_descripcion", "Descripción"),
        ],
      },
      {
        id: "nosotros_vision",
        label: "Visión",
        description: "Tarjeta de la visión del refugio.",
        fields: [
          texto("nosotros_vision_titulo", "Título", "Nuestra Visión"),
          area("nosotros_vision_descripcion", "Descripción"),
        ],
      },
      {
        id: "nosotros_valores",
        label: "Valores",
        description: "Encabezado de la sección de valores.",
        fields: [
          texto("nosotros_valores_titulo", "Título", "Los valores que nos guían cada día"),
          area("nosotros_valores_subtitulo", "Subtítulo"),
        ],
      },
      {
        id: "nosotros_cta",
        label: "Llamado a la acción",
        description: "Franja para invitar a ser voluntario.",
        fields: [
          texto("nosotros_cta_titulo", "Título", "¿Quieres ser parte de nuestra red de voluntarios?"),
          area("nosotros_cta_descripcion", "Descripción"),
        ],
      },
    ],
  },
  {
    id: "servicios",
    label: "Servicios",
    description: "Servicios y atención que ofrece el refugio.",
    subsections: [
      {
        id: "servicios_hero",
        label: "Portada (Hero)",
        description: "Presentación de los servicios.",
        fields: [
          texto("servicios_hero_titulo", "Título", "¿Qué hacemos en nuestro refugio?"),
          texto("servicios_hero_subtitulo", "Subtítulo", "Servicios y atención veterinaria"),
          area("servicios_hero_descripcion", "Descripción"),
          galeria("servicios_hero_imagenes", "Fotos de la portada"),
        ],
      },
      {
        id: "servicios_cifras",
        label: "Huella en cifras",
        description: "Estadísticas de atención veterinaria.",
        fields: [
          texto("servicios_cifras_titulo", "Título", "Nuestra huella en cifras"),
          area("servicios_cifras_subtitulo", "Subtítulo"),
          galeria("servicios_cifras_imagenes", "Fotos de la sección"),
        ],
      },
      {
        id: "servicios_medicos",
        label: "Servicios médicos",
        description: "Detalle de los servicios médicos veterinarios.",
        fields: [
          texto("servicios_medicos_titulo", "Título", "Servicios médicos veterinarios"),
          area("servicios_medicos_descripcion", "Descripción"),
          galeria("servicios_medicos_imagenes", "Fotos de los servicios"),
        ],
      },
    ],
  },
  {
    id: "rescates",
    label: "Rescates",
    description: "Información sobre los rescates y el proceso de recuperación.",
    subsections: [
      {
        id: "rescates_hero",
        label: "Portada (Hero)",
        description: "Presentación de la labor de rescate.",
        fields: [
          texto("rescates_hero_subtitulo", "Etiqueta", "Rescate Animal y Auxilio 24/7"),
          texto("rescates_hero_titulo", "Título", "Rescate y Esperanza en"),
          area("rescates_hero_descripcion", "Descripción"),
          galeria("rescates_hero_imagenes", "Fotos de la portada"),
        ],
      },
      {
        id: "rescates_cifras",
        label: "Huella en rescates",
        description: "Estadísticas de rescates.",
        fields: [
          texto("rescates_cifras_titulo", "Título", "Nuestra huella en rescates"),
          area("rescates_cifras_subtitulo", "Subtítulo"),
          galeria("rescates_cifras_imagenes", "Fotos de la sección"),
        ],
      },
      {
        id: "rescates_protocolo",
        label: "Protocolo de rescate",
        description: "Etapas del operativo de rescate.",
        fields: [
          texto("rescates_protocolo_titulo", "Título", "¿Cómo funciona cada operativo de rescate?"),
          area("rescates_protocolo_descripcion", "Descripción"),
          galeria("rescates_protocolo_imagenes", "Fotos del protocolo"),
        ],
      },
      {
        id: "rescates_historias",
        label: "Historias de rescate",
        description: "Encabezado de las historias de supervivencia.",
        fields: [
          texto("rescates_historias_titulo", "Título", "Historias de supervivencia y amor"),
          area("rescates_historias_subtitulo", "Subtítulo"),
        ],
      },
      {
        id: "rescates_guia",
        label: "Guía ciudadana",
        description: "Pasos para reportar un animal en peligro.",
        fields: [
          texto("rescates_guia_titulo", "Título", "¿Encontraste un animal en peligro o maltratado?"),
          area("rescates_guia_descripcion", "Descripción"),
        ],
      },
      {
        id: "rescates_reporte",
        label: "Reporte de emergencia",
        description: "Línea directa y formulario de reporte.",
        fields: [
          texto("rescates_reporte_titulo", "Título", "Central de Rescates 24 Horas"),
          area("rescates_reporte_descripcion", "Descripción"),
        ],
      },
    ],
  },
  {
    id: "adopciones",
    label: "Adopciones",
    description: "Información para adoptar y encontrar un nuevo hogar.",
    subsections: [
      {
        id: "adopciones_hero",
        label: "Portada (Hero)",
        description: "Presentación del programa de adopciones.",
        fields: [
          texto("adopciones_hero_subtitulo", "Etiqueta", "Adopción Responsable • Sin Costo"),
          texto("adopciones_hero_titulo", "Título", "Encuentra a tu compañero en"),
          area("adopciones_hero_descripcion", "Descripción"),
          galeria("adopciones_hero_imagenes", "Fotos de la portada"),
        ],
      },
      {
        id: "adopciones_catalogo",
        label: "Catálogo de animales",
        description: "Encabezado del catálogo de animales disponibles.",
        fields: [
          texto("adopciones_catalogo_titulo", "Título", "Animales disponibles para adopción"),
          area("adopciones_catalogo_descripcion", "Descripción"),
        ],
      },
      {
        id: "adopciones_proceso",
        label: "Proceso de adopción",
        description: "Pasos del proceso de adopción responsable.",
        fields: [
          texto("adopciones_proceso_titulo", "Título", "¿Cómo funciona el proceso de adopción?"),
          area("adopciones_proceso_descripcion", "Descripción"),
        ],
      },
    ],
  },
  {
    id: "donar",
    label: "Donar",
    description: "Mensaje para invitar a apoyar económicamente al refugio.",
    subsections: [
      {
        id: "donar_hero",
        label: "Portada (Hero)",
        description: "Presentación del programa de donaciones.",
        fields: [
          texto("donar_hero_subtitulo", "Etiqueta", "Tu ayuda transforma vidas"),
          texto("donar_hero_titulo", "Título", "Dales una mano solidaria en"),
          area("donar_hero_descripcion", "Descripción"),
          galeria("donar_hero_imagenes", "Fotos de la portada"),
        ],
      },
      {
        id: "donar_financiera",
        label: "Donación financiera",
        description: "Bloque de donación con tarjeta.",
        fields: [
          texto("donar_financiera_titulo", "Título", "Haz una donación en línea de forma segura"),
          area("donar_financiera_descripcion", "Descripción"),
          galeria("donar_financiera_imagenes", "Fotos de la sección"),
        ],
      },
      {
        id: "donar_especie",
        label: "Donaciones en especie",
        description: "Categorías de donaciones materiales.",
        fields: [
          texto("donar_especie_titulo", "Título", "¿Qué tipo de donaciones en especie recibimos?"),
          area("donar_especie_descripcion", "Descripción"),
          galeria("donar_especie_imagenes", "Fotos de la sección"),
        ],
      },
      {
        id: "donar_entrega",
        label: "Cómo entregar",
        description: "Puntos de acopio y logística.",
        fields: [
          texto("donar_entrega_titulo", "Título", "¿Dónde y cómo entregar tus donaciones en especie?"),
          area("donar_entrega_descripcion", "Descripción"),
        ],
      },
    ],
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
  inicio_servicios_titulo:
    "Cuidamos con amor la salud de tu futura mascota",
  inicio_servicios_descripcion:
    "Nuestro refugio ofrece atención veterinaria integral, alimentación de calidad y programas de socialización. Trabajamos para transformar la vida de los animales rescatados y promover la adopción responsable.",
  inicio_esteriliza_titulo: "Cuida su salud, protege su futuro.",
  inicio_esteriliza_subtitulo: "¡Esteriliza a tus mascotas!",
  inicio_esteriliza_imagenes: "[]",
  inicio_cifras_titulo: "Nuestros logros en cifras",
  inicio_cifras_subtitulo:
    "Cada rescate representa una historia, una vida salvada y una familia acompañada.",
  inicio_horarios_titulo: "Horarios de atención",
  inicio_horarios_subtitulo:
    "Atendemos todos los días. Revisa los horarios de cada servicio.",
  inicio_horarios_imagenes: "[]",

  nosotros_hero_etiqueta: "Conoce Nuestra Historia",
  nosotros_hero_titulo: "Más que un refugio,",
  nosotros_hero_titulo_destacado: "somos una segunda oportunidad",
  nosotros_hero_descripcion:
    "Nacimos de la pasión y el compromiso por rescatar a animales en situación de vulnerabilidad. Desde nuestro inicio, hemos transformado miles de vidas gracias al esfuerzo conjunto de nuestro equipo veterinario, voluntarios y familias adoptantes.",
  nosotros_hero_imagenes: "[]",
  nosotros_mision_titulo: "Nuestra Misión",
  nosotros_mision_descripcion:
    "Rescatar, rehabilitar y brindar atención médica integral a animales abandonados o maltratados, promoviendo activamente la adopción responsable y la educación sobre el respeto a la vida animal en nuestra sociedad.",
  nosotros_vision_titulo: "Nuestra Visión",
  nosotros_vision_descripcion:
    "Ser el refugio líder a nivel regional reconocido por la excelencia en el cuidado animal, la transparencia en nuestros procesos de rescate y por construir una comunidad donde ningún animal sufra abandono.",
  nosotros_valores_titulo: "Los valores que nos guían cada día",
  nosotros_valores_subtitulo:
    "Cada decisión que tomamos está fundamentada en el bienestar y el amor absoluto hacia nuestros amigos de cuatro patas.",
  nosotros_cta_titulo:
    "¿Quieres ser parte de nuestra red de voluntarios?",
  nosotros_cta_descripcion:
    "Siempre necesitamos manos amorosas para paseos, cuidados, difusión en redes y apoyo en jornadas de adopción.",

  servicios_hero_titulo: "¿Qué hacemos en nuestro refugio?",
  servicios_hero_subtitulo: "Servicios y atención veterinaria",
  servicios_hero_descripcion:
    "Brindamos servicios veterinarios de alta calidad, rescate, atención médica especializada y programas comunitarios para el bienestar animal.",
  servicios_hero_imagenes: "[]",
  servicios_cifras_titulo: "Nuestra huella en cifras",
  servicios_cifras_subtitulo:
    "Visualiza nuestros registros de atención. Este tablero muestra el alcance de los servicios que hemos brindado, reafirmando nuestro compromiso con la salud animal.",
  servicios_cifras_imagenes: "[]",
  servicios_medicos_titulo: "Servicios médicos veterinarios",
  servicios_medicos_descripcion:
    "Ofrecemos una atención veterinaria integral para garantizar la salud y el bienestar de las mascotas y animales rescatados. Contamos con infraestructura idónea y un equipo de profesionales comprometidos.",
  servicios_medicos_imagenes: "[]",

  rescates_hero_subtitulo: "Rescate Animal y Auxilio 24/7",
  rescates_hero_titulo: "Rescate y Esperanza en",
  rescates_hero_descripcion:
    "Atendemos llamados de emergencia, casos de abandono y animales en peligro extremo. Brindamos auxilio médico inmediato, rehabilitación integral y el camino hacia un hogar lleno de amor.",
  rescates_hero_imagenes: "[]",
  rescates_cifras_titulo: "Nuestra huella en rescates",
  rescates_cifras_subtitulo:
    "Detrás de cada cifra hay un latido salvado, una historia de dolor superada y una familia transformada. Este tablero refleja la labor incansable de nuestro equipo de auxilio y rescate.",
  rescates_cifras_imagenes: "[]",
  rescates_protocolo_titulo: "¿Cómo funciona cada operativo de rescate?",
  rescates_protocolo_descripcion:
    "No se trata solo de retirar a un animal de la calle; ejecutamos un proceso médico, ético y emocional riguroso para devolverles la dignidad y la salud antes de entregarlos en adopción.",
  rescates_protocolo_imagenes: "[]",
  rescates_historias_titulo: "Historias de supervivencia y amor",
  rescates_historias_subtitulo:
    "Cada rescate comienza con dolor e incertidumbre, pero con paciencia médica y cariño culmina en una segunda oportunidad de vida.",
  rescates_guia_titulo:
    "¿Encontraste un animal en peligro o maltratado?",
  rescates_guia_descripcion:
    "Tus acciones en los primeros minutos pueden salvarle la vida. Sigue estos cuatro pasos antes de la llegada de los rescatistas.",
  rescates_reporte_titulo: "Central de Rescates 24 Horas",
  rescates_reporte_descripcion:
    "Si la vida del animal corre riesgo inminente, no esperes. Comunícate por teléfono o WhatsApp de inmediato para despachar nuestra brigada móvil más cercana.",

  adopciones_hero_subtitulo: "Adopción Responsable • Sin Costo",
  adopciones_hero_titulo: "Encuentra a tu compañero en",
  adopciones_hero_descripcion:
    "Cada animal rescatado sueña con una familia para siempre. Explora nuestros rescatados disponibles, inicia tu solicitud y dales la segunda oportunidad que tanto merecen.",
  adopciones_hero_imagenes: "[]",
  adopciones_catalogo_titulo: "Animales disponibles para adopción",
  adopciones_catalogo_descripcion:
    "Haz clic en el botón de adoptar de la mascota que toque tu corazón para iniciar el formulario con los requisitos necesarios.",
  adopciones_proceso_titulo: "¿Cómo funciona el proceso de adopción?",
  adopciones_proceso_descripcion:
    "Nuestro objetivo es asegurar que cada rescate encuentre un hogar definitivo y amoroso. El trámite se completa en 4 sencillos pasos.",

  donar_hero_subtitulo: "Tu ayuda transforma vidas",
  donar_hero_titulo: "Dales una mano solidaria en",
  donar_hero_descripcion:
    "Gracias a tu apoyo podemos alimentar a cientos de animales rescatados, cubrir cirugías de emergencia, tratamientos médicos y asegurar instalaciones dignas mientras esperan ser adoptados.",
  donar_hero_imagenes: "[]",
  donar_financiera_titulo: "Haz una donación en línea de forma segura",
  donar_financiera_descripcion:
    "Tus aportes monetarios nos permiten adquirir insumos de urgencia, financiar cirugías de traumatología, costear pruebas de laboratorio y mantener al día las instalaciones de nuestros santuarios.",
  donar_financiera_imagenes: "[]",
  donar_especie_titulo: "¿Qué tipo de donaciones en especie recibimos?",
  donar_especie_descripcion:
    "Además de las donaciones monetarias, recibimos continuamente insumos esenciales para el mantenimiento y recuperación de nuestros animales. Todo aporte, nuevo o en buen estado, es recibido con gratitud.",
  donar_especie_imagenes: "[]",
  donar_entrega_titulo:
    "¿Dónde y cómo entregar tus donaciones en especie?",
  donar_entrega_descripcion:
    "Puedes acercarte a nuestra sede central, a nuestros centros de acopio autorizados o coordinar una recolección directa si se trata de un lote grande de alimentos o equipamiento.",
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

/** Devuelve todas las subsecciones de una sección. */
export function subseccionesDeSeccion(id: string): SubseccionSitio[] {
  return SECCIONES_SITIO.find((seccion) => seccion.id === id)?.subsections ?? [];
}

/** Devuelve todos los campos de una sección (aplanados por subsección). */
export function camposDeSeccion(id: string): CampoSitio[] {
  return subseccionesDeSeccion(id).flatMap((sub) => sub.fields);
}

/** Devuelve la clave de la primera galería de una sección (para la portada). */
export function clavePortadaSeccion(id: string): string | null {
  for (const sub of subseccionesDeSeccion(id)) {
    const galeria = sub.fields.find((campo) => campo.type === "gallery");
    if (galeria) return galeria.key;
  }
  return null;
}
