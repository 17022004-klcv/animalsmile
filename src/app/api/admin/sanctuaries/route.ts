import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearSantuario,
  listarSantuarios,
} from "@/src/services/sanctuaries/sanctuary-server";
import { parseSantuarioInput } from "@/src/services/sanctuaries/sanctuary-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const santuarios = await listarSantuarios();
    return NextResponse.json({ santuarios });
  } catch (error) {
    console.error("Error al obtener los santuarios:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los santuarios." },
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

  const parseo = parseSantuarioInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const santuario = await crearSantuario(parseo.valor);
    return NextResponse.json({ santuario }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al crear el santuario:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el santuario." },
      { status: 500 },
    );
  }
}
