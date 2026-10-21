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
