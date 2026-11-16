import type { ResultadoParseo } from "@/src/types/common";

export type ConfiguracionSistemaInput = {
  clave: string;
  valor: string;
  tipo_dato: string;
  descripcion: string | null;
  modulo: string | null;
  editable: boolean;
};

export type ConfiguracionSitioInput = {
  clave: string;
  valor: string | null;
  tipo_dato: string | null;
  seccion: string | null;
  descripcion: string | null;
};

export type ConfiguracionSitioLoteInput = {
  configuraciones: ConfiguracionSitioInput[];
};

const HEX_RE = /^#[0-9a-f]{6}$/i;
const MAX_VALOR_SITIO = 100_000;

function textoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

/** Valida y normaliza la creación de una configuración de sistema. */
export function parseConfigSistemaInput(
  raw: unknown,
): ResultadoParseo<ConfiguracionSistemaInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const clave = typeof b.clave === "string" ? b.clave.trim() : "";
  if (!clave) return { ok: false, error: "La clave es obligatoria." };

  const valor = typeof b.valor === "string" ? b.valor : "";
  if (!valor) return { ok: false, error: "El valor es obligatorio." };

  return {
    ok: true,
    valor: {
      clave,
      valor,
      tipo_dato: textoOpcional(b.tipo_dato) ?? "string",
      descripcion: textoOpcional(b.descripcion),
      modulo: textoOpcional(b.modulo),
      editable: b.editable !== false,
    },
  };
}

/** Valida la actualización de una configuración de sistema. */
export function parseConfigSistemaParcial(
  raw: unknown,
): ResultadoParseo<Partial<ConfiguracionSistemaInput>> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const data: Partial<ConfiguracionSistemaInput> = {};

  if (b.valor !== undefined) {
    if (typeof b.valor !== "string" || !b.valor) {
      return { ok: false, error: "El valor es obligatorio." };
    }
    data.valor = b.valor;
  }
  if (b.tipo_dato !== undefined) {
    data.tipo_dato = textoOpcional(b.tipo_dato) ?? "string";
  }
  if (b.descripcion !== undefined) data.descripcion = textoOpcional(b.descripcion);
  if (b.modulo !== undefined) data.modulo = textoOpcional(b.modulo);
  if (b.editable !== undefined) data.editable = b.editable !== false;

  return { ok: true, valor: data };
}

/** Valida y normaliza la creación de una configuración de sitio. */
export function parseConfigSitioInput(
  raw: unknown,
): ResultadoParseo<ConfiguracionSitioInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const clave = typeof b.clave === "string" ? b.clave.trim() : "";
  if (!clave) return { ok: false, error: "La clave es obligatoria." };

  return {
    ok: true,
    valor: {
      clave,
      valor: typeof b.valor === "string" ? b.valor : null,
      tipo_dato: textoOpcional(b.tipo_dato) ?? "string",
      seccion: textoOpcional(b.seccion),
      descripcion: textoOpcional(b.descripcion),
    },
  };
}

/** Valida la actualización de una configuración de sitio. */
export function parseConfigSitioParcial(
  raw: unknown,
): ResultadoParseo<Partial<ConfiguracionSitioInput>> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const data: Partial<ConfiguracionSitioInput> = {};

  if (b.valor !== undefined) {
    data.valor = typeof b.valor === "string" ? b.valor : null;
  }
  if (b.tipo_dato !== undefined) {
    data.tipo_dato = textoOpcional(b.tipo_dato) ?? "string";
  }
  if (b.seccion !== undefined) data.seccion = textoOpcional(b.seccion);
  if (b.descripcion !== undefined) data.descripcion = textoOpcional(b.descripcion);

  return { ok: true, valor: data };
}

/** Valida y normaliza el guardado masivo de la configuración del sitio. */
export function parseConfiguracionSitioLote(
  raw: unknown,
): ResultadoParseo<ConfiguracionSitioLoteInput> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const lista = Array.isArray(b.configuraciones)
    ? b.configuraciones
    : Array.isArray(raw)
      ? raw
      : null;

  if (!lista) {
    return { ok: false, error: "No se recibieron configuraciones." };
  }

  if (!lista.length) {
    return { ok: false, error: "Debes enviar al menos una configuración." };
  }

  const vistos = new Set<string>();
  const configuraciones: ConfiguracionSitioInput[] = [];

  for (const item of lista) {
    const entrada = (item ?? {}) as Record<string, unknown>;
    const clave = typeof entrada.clave === "string" ? entrada.clave.trim() : "";

    if (!clave) {
      return { ok: false, error: "Todas las configuraciones deben tener clave." };
    }
    if (clave.length > 100) {
      return {
        ok: false,
        error: `La clave "${clave}" supera el máximo de 100 caracteres.`,
      };
    }
    if (vistos.has(clave)) {
      return { ok: false, error: `La clave "${clave}" está duplicada.` };
    }
    vistos.add(clave);

    if (entrada.valor !== undefined && entrada.valor !== null && typeof entrada.valor !== "string") {
      return {
        ok: false,
        error: `El valor de "${clave}" debe ser texto.`,
      };
    }

    const valor =
      typeof entrada.valor === "string" ? entrada.valor : entrada.valor === null ? null : "";

    if (valor && valor.length > MAX_VALOR_SITIO) {
      return {
        ok: false,
        error: `El contenido de "${clave}" es demasiado largo.`,
      };
    }

    if (clave.startsWith("color_") && valor && !HEX_RE.test(valor)) {
      return {
        ok: false,
        error: `El color de "${clave}" debe tener formato hexadecimal (#RRGGBB).`,
      };
    }

    configuraciones.push({
      clave,
      valor,
      tipo_dato: textoOpcional(entrada.tipo_dato) ?? "string",
      seccion: textoOpcional(entrada.seccion),
      descripcion: textoOpcional(entrada.descripcion),
    });
  }

  return { ok: true, valor: { configuraciones } };
}
