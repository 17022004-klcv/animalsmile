import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearSolicitante,
  listarSolicitantes,
} from "@/src/services/adoptions/adoption-server";
import { parseSolicitanteInput } from "@/src/services/adoptions/adoption-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const solicitantes = await listarSolicitantes();
    return NextResponse.json({ solicitantes });
  } catch (error) {
    console.error("Error al obtener los solicitantes:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los solicitantes." },
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

  const parseo = parseSolicitanteInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const solicitante = await crearSolicitante(parseo.valor);
    return NextResponse.json({ solicitante }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al crear el solicitante:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el solicitante." },
      { status: 500 },
    );
  }
}
