import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { parseEspecieParcial } from "@/src/services/classifications/classification-validation";
import {
  actualizarEspecie,
  eliminarEspecie,
  parseIntId,
} from "@/src/services/classifications/classification-server";
import { ErrorServicio } from "@/src/services/common/errors";

type Params = { params: Promise<{ id: string }> };

function respuestaServicio(error: unknown, mensajeInterno: string) {
  if (error instanceof ErrorServicio) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  }
  console.error(mensajeInterno, error);
  return NextResponse.json(
    { error: "Ocurrió un error inesperado. Intenta de nuevo." },
    { status: 500 },
  );
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  let idEspecie: number;
  try {
    idEspecie = parseIntId(id);
  } catch (error) {
    return respuestaServicio(error, "Error con el ID de especie:");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parseo = parseEspecieParcial(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const especie = await actualizarEspecie(idEspecie, parseo.valor);
    return NextResponse.json({ especie });
  } catch (error) {
    return respuestaServicio(error, "Error al actualizar especie:");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  let idEspecie: number;
  try {
    idEspecie = parseIntId(id);
  } catch (error) {
    return respuestaServicio(error, "Error con el ID de especie:");
  }

  try {
    await eliminarEspecie(idEspecie);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return respuestaServicio(error, "Error al eliminar especie:");
  }
}
