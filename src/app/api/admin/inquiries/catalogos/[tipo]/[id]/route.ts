import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import {
  actualizarCatalogo,
  eliminarCatalogo,
  type TipoCatalogo,
} from "@/src/services/inquiries/inquiry-server";
import { ErrorServicio } from "@/src/services/common/errors";

type Params = { params: Promise<{ tipo: string; id: string }> };

const TIPOS: TipoCatalogo[] = ["vacuna", "medicamento", "enfermedad"];

function tipoValido(tipo: string): tipo is TipoCatalogo {
  return TIPOS.includes(tipo as TipoCatalogo);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { tipo, id } = await params;

  if (!tipoValido(tipo)) {
    return NextResponse.json(
      { error: "El tipo de catálogo no es válido." },
      { status: 400 },
    );
  }

  const idNumero = Number(id);
  if (!Number.isInteger(idNumero)) {
    return NextResponse.json(
      { error: "El identificador no es válido." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  if ("nombre" in b) {
    const nombre = typeof b.nombre === "string" ? b.nombre.trim() : "";
    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es obligatorio." },
        { status: 400 },
      );
    }
    b.nombre = nombre;
  }

  try {
    const item = await actualizarCatalogo(tipo, idNumero, b);
    return NextResponse.json({ item });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al actualizar el catálogo:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el elemento del catálogo." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { tipo, id } = await params;

  if (!tipoValido(tipo)) {
    return NextResponse.json(
      { error: "El tipo de catálogo no es válido." },
      { status: 400 },
    );
  }

  const idNumero = Number(id);
  if (!Number.isInteger(idNumero)) {
    return NextResponse.json(
      { error: "El identificador no es válido." },
      { status: 400 },
    );
  }

  try {
    await eliminarCatalogo(tipo, idNumero);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al eliminar el catálogo:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el elemento del catálogo." },
      { status: 500 },
    );
  }
}
