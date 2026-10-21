import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { parseExpedienteInput } from "@/src/services/medical/medical-validation";
import {
  guardarExpediente,
  obtenerExpedientePorAnimal,
} from "@/src/services/medical/medical-server";
import { ErrorServicio } from "@/src/services/common/errors";

type Params = { params: Promise<{ id: string }> };

function respuestaServicio(error: unknown, mensajeInterno: string) {
  if (error instanceof ErrorServicio) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(mensajeInterno, error);
  return NextResponse.json(
    { error: "Ocurrió un error inesperado. Intenta de nuevo." },
    { status: 500 },
  );
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const expediente = await obtenerExpedientePorAnimal(id);
    return NextResponse.json({ expediente });
  } catch (error) {
    return respuestaServicio(error, "Error al obtener expediente:");
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parseo = parseExpedienteInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const expediente = await guardarExpediente(id, parseo.valor);
    return NextResponse.json({ expediente });
  } catch (error) {
    return respuestaServicio(error, "Error al guardar expediente:");
  }
}
