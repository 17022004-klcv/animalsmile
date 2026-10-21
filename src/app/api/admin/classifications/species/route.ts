import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { parseEspecieInput } from "@/src/services/classifications/classification-validation";
import {
  crearEspecie,
  listarEspecies,
} from "@/src/services/classifications/classification-server";
import { ErrorServicio } from "@/src/services/common/errors";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const especies = await listarEspecies();
  return NextResponse.json({ especies });
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

  const parseo = parseEspecieInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const especie = await crearEspecie(parseo.valor);
    return NextResponse.json({ especie }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error inesperado al crear especie:", error);
    return NextResponse.json(
      { error: "No se pudo crear la especie." },
      { status: 500 },
    );
  }
}
