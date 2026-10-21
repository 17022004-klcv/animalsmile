import type { ResultadoParseo } from "@/src/types/common";
import type { ExpedienteMedico, HistorialClinico } from "@/src/types/animal";

export type ExpedienteInput = {
  esterilizado: boolean;
  fecha_esterilizacion: string | null;
  observaciones_generales: string | null;
};

export type HistorialInput = {
  tipo_registro: string;
  descripcion: string;
  diagnostico: string | null;
  tratamiento: string | null;
  proxima_cita: string | null;
};

function textoOpcional(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

/** Valida y normaliza la creación/actualización de un expediente médico. */
export function parseExpedienteInput(
  raw: unknown,
): ResultadoParseo<ExpedienteInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const esterilizado = b.esterilizado === true || b.esterilizado === "true";
  const fecha = textoOpcional(b.fecha_esterilizacion);

  return {
    ok: true,
    valor: {
      esterilizado,
      fecha_esterilizacion: esterilizado ? fecha : null,
      observaciones_generales: textoOpcional(b.observaciones_generales),
    },
  };
}

/** Valida y normaliza el registro de una entrada de historial clínico. */
export function parseHistorialInput(raw: unknown): ResultadoParseo<HistorialInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const tipo = typeof b.tipo_registro === "string" ? b.tipo_registro.trim() : "";
  if (!tipo) return { ok: false, error: "El tipo de registro es obligatorio." };

  const descripcion =
    typeof b.descripcion === "string" ? b.descripcion.trim() : "";
  if (!descripcion) {
    return { ok: false, error: "La descripción es obligatoria." };
  }

  return {
    ok: true,
    valor: {
      tipo_registro: tipo,
      descripcion,
      diagnostico: textoOpcional(b.diagnostico),
      tratamiento: textoOpcional(b.tratamiento),
      proxima_cita: textoOpcional(b.proxima_cita),
    },
  };
}

/** Expediente con su historial clínico completo. */
export interface ExpedienteConRelaciones extends ExpedienteMedico {
  historiales_clinicos: HistorialClinico[];
}

/** Fila del listado de expedientes (animal + estado del expediente). */
export interface ExpedienteListado {
  id_animal: string;
  codigo_identificador: string;
  nombre: string;
  estado: string;
  foto_principal: string | null;
  especie: { id_especie: number; nombre_comun: string };
  expediente_medico:
    | (ExpedienteMedico & {
        historiales_clinicos: Pick<
          HistorialClinico,
          "fecha_consulta" | "proxima_cita"
        >[];
        _count: { historiales_clinicos: number };
      })
    | null;
}

export type { ExpedienteMedico, HistorialClinico };
