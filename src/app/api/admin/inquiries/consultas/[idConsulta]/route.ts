import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import {
  parseConsultaActualizacion,
} from "@/src/services/inquiries/inquiry-validation";
import {
  actualizarConsulta,
  eliminarConsulta,
  obtenerConsulta,
} from "@/src/services/inquiries/inquiry-server";
import { ErrorServicio } from "@/src/services/common/errors";

type Params = { params: Promise<{ idConsulta: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { idConsulta } = await params;

  try {
    const consulta = await obtenerConsulta(idConsulta);
    return NextResponse.json({ consulta });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al obtener la consulta:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la consulta." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { idConsulta } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parseo = parseConsultaActualizacion(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const consulta = await actualizarConsulta(idConsulta, parseo.valor);
    return NextResponse.json({ consulta });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al actualizar la consulta:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la consulta." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { idConsulta } = await params;

  try {
    await eliminarConsulta(idConsulta);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al eliminar la consulta:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la consulta." },
      { status: 500 },
    );
  }
}
