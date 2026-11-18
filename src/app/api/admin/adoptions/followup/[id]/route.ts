import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  eliminarSeguimiento,
  obtenerSeguimiento,
  registrarResultadoSeguimiento,
} from "@/src/services/adoptions/adoption-server";
import { parseSeguimientoResultado } from "@/src/services/adoptions/adoption-validation";

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
    const seguimiento = await obtenerSeguimiento(id);
    return NextResponse.json({ seguimiento });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al obtener el seguimiento:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el seguimiento." },
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

  const parseo = parseSeguimientoResultado(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const seguimiento = await registrarResultadoSeguimiento(
      id,
      parseo.valor,
      session.sub,
    );
    return NextResponse.json({ seguimiento });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al registrar el seguimiento:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el seguimiento." },
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
    await eliminarSeguimiento(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al eliminar el seguimiento:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el seguimiento." },
      { status: 500 },
    );
  }
}
