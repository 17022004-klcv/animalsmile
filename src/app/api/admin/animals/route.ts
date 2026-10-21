import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import {
  parseAnimalInput,
} from "@/src/services/animals/animal-validation";
import { crearAnimal, listarAnimales } from "@/src/services/animals/animal-server";
import { ErrorServicio } from "@/src/services/common/errors";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const animales = await listarAnimales();
  return NextResponse.json({ animales });
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

  const parseo = parseAnimalInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const animal = await crearAnimal(parseo.valor, session.sub);
    return NextResponse.json({ animal }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error inesperado al crear animal:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el animal." },
      { status: 500 },
    );
  }
}
