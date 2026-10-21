import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { parseTaxonomiaInput } from "@/src/services/classifications/classification-validation";
import {
  actualizarTaxonomia,
  eliminarTaxonomia,
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

  let idTaxonomia: number;
  try {
    idTaxonomia = parseIntId(id);
  } catch (error) {
    return respuestaServicio(error, "Error con el ID de taxonomía:");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parseo = parseTaxonomiaInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const taxonomia = await actualizarTaxonomia(idTaxonomia, parseo.valor.nombre_clase);
    return NextResponse.json({ taxonomia });
  } catch (error) {
    return respuestaServicio(error, "Error al actualizar taxonomía:");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  let idTaxonomia: number;
  try {
    idTaxonomia = parseIntId(id);
  } catch (error) {
    return respuestaServicio(error, "Error con el ID de taxonomía:");
  }

  try {
    await eliminarTaxonomia(idTaxonomia);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return respuestaServicio(error, "Error al eliminar taxonomía:");
  }
}
