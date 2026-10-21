import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import {
  parseAnimalParcial,
  parseRescateInput,
} from "@/src/services/animals/animal-validation";
import type { RescateInput } from "@/src/types/animal";
import {
  actualizarAnimal,
  eliminarAnimal,
  obtenerAnimal,
} from "@/src/services/animals/animal-server";
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

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const animal = await obtenerAnimal(id);
    return NextResponse.json({ animal });
  } catch (error) {
    return respuestaServicio(error, "Error al obtener animal:");
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
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

  const b = (body ?? {}) as Record<string, unknown>;

  const parseo = parseAnimalParcial(b);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  let rescate: RescateInput | null | undefined;
  if ("rescate" in b) {
    const parseoRescate = parseRescateInput(b.rescate);
    if (!parseoRescate.ok) {
      return NextResponse.json(
        { error: parseoRescate.error },
        { status: 400 },
      );
    }
    rescate = parseoRescate.valor;
  }

  try {
    const animal = await actualizarAnimal(
      id,
      parseo.valor,
      rescate,
      session.sub,
    );
    return NextResponse.json({ animal });
  } catch (error) {
    return respuestaServicio(error, "Error al actualizar animal:");
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await eliminarAnimal(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return respuestaServicio(error, "Error al eliminar animal:");
  }
}
