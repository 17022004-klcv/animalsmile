import {
  ESTADOS_ANIMAL,
  NIVELES_ENERGIA,
  type AnimalInput,
  type AnimalParcial,
  type NivelEnergia,
  type EstadoAnimal,
  type RescateInput,
} from "@/src/types/animal";
import type { ResultadoParseo } from "@/src/types/common";

export function parseRescateInput(
  raw: unknown,
): ResultadoParseo<RescateInput | null> {
  if (raw === null || raw === undefined) {
    return { ok: true, valor: null };
  }
  if (typeof raw !== "object") {
    return { ok: false, error: "Los datos de rescate son inválidos." };
  }
  const r = raw as Record<string, unknown>;

  const fecha =
    typeof r.fecha_rescate === "string" ? r.fecha_rescate.trim() : "";
  if (!fecha || Number.isNaN(Date.parse(fecha))) {
    return {
      ok: false,
      error: "La fecha de rescate es obligatoria y debe ser válida.",
    };
  }

  const ubicacion =
    typeof r.ubicacion_hallazgo === "string" ? r.ubicacion_hallazgo.trim() : "";
  if (!ubicacion) {
    return { ok: false, error: "La ubicación del hallazgo es obligatoria." };
  }

  const condicion =
    typeof r.condicion_inicial === "string" ? r.condicion_inicial.trim() : "";
  if (!condicion) {
    return { ok: false, error: "La condición inicial es obligatoria." };
  }

  const fuenteFotos = Array.isArray(r.fotos_ingreso)
    ? r.fotos_ingreso
    : Array.isArray((r as { fotos_ingresadas?: unknown }).fotos_ingresadas)
      ? (r as { fotos_ingresadas: unknown[] }).fotos_ingresadas
      : [];

  const fotos = fuenteFotos.filter(
    (f): f is string => typeof f === "string" && f.trim() !== "",
  );

  return {
    ok: true,
    valor: {
      fecha_rescate: fecha,
      ubicacion_hallazgo: ubicacion,
      nombre_rescatista:
        typeof r.nombre_rescatista === "string" &&
        r.nombre_rescatista.trim() !== ""
          ? r.nombre_rescatista.trim()
          : null,
      contacto_rescatista:
        typeof r.contacto_rescatista === "string" &&
        r.contacto_rescatista.trim() !== ""
          ? r.contacto_rescatista.trim()
          : null,
      condicion_inicial: condicion,
      fotos_ingreso: fotos,
    },
  };
}

export function generarCodigoEspecie(nombreComun: string): string {
  const prefijo = nombreComun
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
  const digitos = Math.floor(1000 + Math.random() * 9000);
  return `${prefijo}-${digitos}`;
}

const cadena = (valor: unknown): string =>
  typeof valor === "string" ? valor.trim() : "";

const opcionCadena = (valor: unknown): string | null => {
  const texto = cadena(valor);
  return texto !== "" ? texto : null;
};

/** Valida y normaliza el cuerpo de creación de un animal. */
export function parseAnimalInput(raw: unknown): ResultadoParseo<AnimalInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const nombre = cadena(b.nombre);
  if (!nombre) {
    return { ok: false, error: "El nombre del animal es obligatorio." };
  }

  const idEspecie = Number(b.id_especie);
  if (!Number.isInteger(idEspecie) || idEspecie <= 0) {
    return { ok: false, error: "Debes seleccionar una especie válida." };
  }

  const estadoBruto = typeof b.estado === "string" ? b.estado : "En_Cuarentena";
  if (!(ESTADOS_ANIMAL as readonly string[]).includes(estadoBruto)) {
    return { ok: false, error: "El estado de ingreso no es válido." };
  }

  const nivelEnergia = opcionCadena(b.nivel_energia);
  if (
    nivelEnergia &&
    !(NIVELES_ENERGIA as readonly string[]).includes(nivelEnergia)
  ) {
    return { ok: false, error: "El nivel de energía debe ser Bajo, Medio o Alto." };
  }

  let edad: number | null = null;
  if (
    b.edad_estimada_meses !== undefined &&
    b.edad_estimada_meses !== null &&
    b.edad_estimada_meses !== ""
  ) {
    edad = Number(b.edad_estimada_meses);
    if (!Number.isInteger(edad) || edad < 0) {
      return {
        ok: false,
        error: "La edad estimada debe ser un número entero de meses válido.",
      };
    }
  }

  const parseoRescate = parseRescateInput(b.rescate);
  if (!parseoRescate.ok) {
    return parseoRescate;
  }

  const codigo = cadena(b.codigo_identificador);

  return {
    ok: true,
    valor: {
      nombre,
      id_especie: idEspecie,
      codigo_identificador: codigo !== "" ? codigo.toUpperCase() : null,
      raza_variedad: opcionCadena(b.raza_variedad),
      edad_estimada_meses: edad,
      temperamento: opcionCadena(b.temperamento),
      nivel_energia: nivelEnergia,
      estado: estadoBruto as EstadoAnimal,
      foto_principal: opcionCadena(b.foto_principal),
      rescate: parseoRescate.valor,
    },
  };
}

/** Valida y normaliza el cuerpo de actualización parcial (PATCH) de un animal. */
export function parseAnimalParcial(
  raw: unknown,
): ResultadoParseo<AnimalParcial> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const data: AnimalParcial = {};

  if (b.nombre !== undefined) {
    const nombre = cadena(b.nombre);
    if (!nombre) {
      return { ok: false, error: "El nombre del animal es obligatorio." };
    }
    data.nombre = nombre;
  }

  if (b.id_especie !== undefined) {
    const idEspecie = Number(b.id_especie);
    if (!Number.isInteger(idEspecie) || idEspecie <= 0) {
      return { ok: false, error: "Debes seleccionar una especie válida." };
    }
    data.id_especie = idEspecie;
  }

  if (b.estado !== undefined) {
    const estado = typeof b.estado === "string" ? b.estado : "";
    if (!(ESTADOS_ANIMAL as readonly string[]).includes(estado)) {
      return { ok: false, error: "El estado de ingreso no es válido." };
    }
    data.estado = estado as EstadoAnimal;
  }

  if (b.nivel_energia !== undefined) {
    if (b.nivel_energia === null || b.nivel_energia === "") {
      data.nivel_energia = null;
    } else {
      const nivel = cadena(b.nivel_energia);
      if (!(NIVELES_ENERGIA as readonly string[]).includes(nivel)) {
        return {
          ok: false,
          error: "El nivel de energía debe ser Bajo, Medio o Alto.",
        };
      }
      data.nivel_energia = nivel as NivelEnergia;
    }
  }

  if (b.edad_estimada_meses !== undefined) {
    if (b.edad_estimada_meses === null || b.edad_estimada_meses === "") {
      data.edad_estimada_meses = null;
    } else {
      const edad = Number(b.edad_estimada_meses);
      if (!Number.isInteger(edad) || edad < 0) {
        return {
          ok: false,
          error: "La edad estimada debe ser un número entero de meses válido.",
        };
      }
      data.edad_estimada_meses = edad;
    }
  }

  if (b.raza_variedad !== undefined) {
    data.raza_variedad =
      cadena(b.raza_variedad) !== "" ? cadena(b.raza_variedad) : "Mestizo / No especificada";
  }

  if (b.temperamento !== undefined) {
    data.temperamento = opcionCadena(b.temperamento);
  }

  if (b.foto_principal !== undefined) {
    data.foto_principal = opcionCadena(b.foto_principal);
  }

  return { ok: true, valor: data };
}
