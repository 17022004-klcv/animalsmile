import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearAdopcion,
  listarAdopciones,
} from "@/src/services/adoptions/adoption-server";
import { parseAdopcionInput } from "@/src/services/adoptions/adoption-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const adopciones = await listarAdopciones();
    return NextResponse.json({ adopciones });
  } catch (error) {
    console.error("Error al obtener las adopciones:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las adopciones." },
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

  const parseo = parseAdopcionInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const adopcion = await crearAdopcion(parseo.valor, session.sub);
    return NextResponse.json({ adopcion }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al registrar la adopción:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la adopción." },
      { status: 500 },
    );
  }
}
