import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearConfigSistema,
  listarConfigSistema,
} from "@/src/services/config/config-server";
import { parseConfigSistemaInput } from "@/src/services/config/config-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const configuraciones = await listarConfigSistema();
    return NextResponse.json({ configuraciones });
  } catch (error) {
    console.error("Error al obtener la configuración del sistema:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la configuración del sistema." },
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

  const parseo = parseConfigSistemaInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const configuracion = await crearConfigSistema(parseo.valor, session.sub);
    return NextResponse.json({ configuracion }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error al crear la configuración del sistema:", error);
    return NextResponse.json(
      { error: "No se pudo crear la configuración del sistema." },
      { status: 500 },
    );
  }
}
