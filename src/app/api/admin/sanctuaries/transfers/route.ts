import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearTraslado,
  listarTraslados,
} from "@/src/services/sanctuaries/sanctuary-server";
import { parseTrasladoInput } from "@/src/services/sanctuaries/sanctuary-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const traslados = await listarTraslados();
    return NextResponse.json({ traslados });
  } catch (error) {
    console.error("Error al obtener los traslados:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los traslados." },
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

  const parseo = parseTrasladoInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const traslado = await crearTraslado(parseo.valor, session.sub);
    return NextResponse.json({ traslado }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al registrar el traslado:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el traslado." },
      { status: 500 },
    );
  }
}
