import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearSolicitud,
  listarSolicitudes,
} from "@/src/services/adoptions/adoption-server";
import { parseSolicitudInput } from "@/src/services/adoptions/adoption-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const solicitudes = await listarSolicitudes();
    return NextResponse.json({ solicitudes });
  } catch (error) {
    console.error("Error al obtener las solicitudes:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las solicitudes de adopción." },
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

  const parseo = parseSolicitudInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const solicitud = await crearSolicitud(parseo.valor);
    return NextResponse.json({ solicitud }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al crear la solicitud:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la solicitud." },
      { status: 500 },
    );
  }
}
