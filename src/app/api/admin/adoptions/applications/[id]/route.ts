import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  actualizarSolicitud,
  eliminarSolicitud,
  evaluarSolicitud,
  obtenerSolicitud,
} from "@/src/services/adoptions/adoption-server";
import {
  parseEvaluacionSolicitud,
  parseSolicitudInput,
} from "@/src/services/adoptions/adoption-validation";

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
    const solicitud = await obtenerSolicitud(id);
    return NextResponse.json({ solicitud });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al obtener la solicitud:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la solicitud." },
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

  const b = (body ?? {}) as Record<string, unknown>;
  const esEdicionCompleta = "id_solicitante" in b || "id_animal" in b;

  if (!esEdicionCompleta) {
    const parseo = parseEvaluacionSolicitud(body);
    if (!parseo.ok) {
      return NextResponse.json({ error: parseo.error }, { status: 400 });
    }

    try {
      const solicitud = await evaluarSolicitud(id, parseo.valor, session.sub);
      return NextResponse.json({ solicitud });
    } catch (error) {
      if (error instanceof ErrorServicio) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status },
        );
      }
      console.error("Error al evaluar la solicitud:", error);
      return NextResponse.json(
        { error: "No se pudo actualizar la solicitud." },
        { status: 500 },
      );
    }
  }

  const parseo = parseSolicitudInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const solicitud = await actualizarSolicitud(id, parseo.valor);
    return NextResponse.json({ solicitud });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al actualizar la solicitud:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la solicitud." },
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
    await eliminarSolicitud(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al eliminar la solicitud:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la solicitud." },
      { status: 500 },
    );
  }
}
