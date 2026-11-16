import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearUsuario,
  listarUsuarios,
} from "@/src/services/users/user-server";
import { parseCrearUsuario } from "@/src/services/users/user-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const usuarios = await listarUsuarios();
    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los usuarios." },
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

  const parseo = parseCrearUsuario(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const usuario = await crearUsuario(parseo.valor);
    return NextResponse.json({ usuario }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al crear el usuario:", error);
    return NextResponse.json(
      { error: "No se pudo crear el usuario." },
      { status: 500 },
    );
  }
}
