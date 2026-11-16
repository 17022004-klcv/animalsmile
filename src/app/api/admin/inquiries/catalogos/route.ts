import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import {
  crearCatalogo,
  obtenerCatalogos,
  type TipoCatalogo,
} from "@/src/services/inquiries/inquiry-server";
import { ErrorServicio } from "@/src/services/common/errors";

const TIPOS: TipoCatalogo[] = ["vacuna", "medicamento", "enfermedad"];

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const catalogos = await obtenerCatalogos();
    return NextResponse.json(catalogos);
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al obtener los catálogos médicos:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los catálogos." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const tipo = b.tipo;
  if (typeof tipo !== "string" || !TIPOS.includes(tipo as TipoCatalogo)) {
    return NextResponse.json(
      { error: "El tipo de catálogo no es válido." },
      { status: 400 },
    );
  }

  const nombre = typeof b.nombre === "string" ? b.nombre.trim() : "";
  if (!nombre) {
    return NextResponse.json(
      { error: "El nombre es obligatorio." },
      { status: 400 },
    );
  }

  try {
    const item = await crearCatalogo(tipo as TipoCatalogo, { ...b, nombre });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al crear el elemento del catálogo:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el elemento del catálogo." },
      { status: 500 },
    );
  }
}
