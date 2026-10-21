import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { parseTaxonomiaInput } from "@/src/services/classifications/classification-validation";
import {
  crearTaxonomia,
  listarTaxonomias,
} from "@/src/services/classifications/classification-server";
import { ErrorServicio } from "@/src/services/common/errors";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const taxonomias = await listarTaxonomias();
  return NextResponse.json({ taxonomias });
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

  const parseo = parseTaxonomiaInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const taxonomia = await crearTaxonomia(parseo.valor);
    return NextResponse.json({ taxonomia }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error inesperado al crear taxonomía:", error);
    return NextResponse.json(
      { error: "No se pudo crear la taxonomía." },
      { status: 500 },
    );
  }
}
