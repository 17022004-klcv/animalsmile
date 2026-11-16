import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  actualizarUsuario,
  eliminarUsuario,
  obtenerUsuario,
} from "@/src/services/users/user-server";
import { parseActualizarUsuario } from "@/src/services/users/user-validation";

type Params = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validarId(id: string) {
  return UUID_RE.test(id)
    ? null
    : NextResponse.json({ error: "El identificador no es válido." }, { status: 400 });
}

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const respuestaId = validarId(id);
  if (respuestaId) return respuestaId;

  try {
    const usuario = await obtenerUsuario(id);
    return NextResponse.json({ usuario });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al obtener el usuario:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el usuario." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const respuestaId = validarId(id);
  if (respuestaId) return respuestaId;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parseo = parseActualizarUsuario(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const usuario = await actualizarUsuario(id, parseo.valor);
    return NextResponse.json({ usuario });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al actualizar el usuario:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el usuario." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const respuestaId = validarId(id);
  if (respuestaId) return respuestaId;

  try {
    await eliminarUsuario(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al eliminar el usuario:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el usuario." },
      { status: 500 },
    );
  }
}
