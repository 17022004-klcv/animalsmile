import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearSeguimiento,
  listarSeguimientos,
  listarSeguimientosPorAdopcion,
} from "@/src/services/adoptions/adoption-server";
import {
  parseSeguimientoInput,
} from "@/src/services/adoptions/adoption-validation";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const idAdopcion = request.nextUrl.searchParams.get("id_adopcion");
  if (idAdopcion && !UUID_RE.test(idAdopcion)) {
    return NextResponse.json(
      { error: "La adopción indicada no es válida." },
      { status: 400 },
    );
  }

  try {
    const seguimientos = idAdopcion
      ? await listarSeguimientosPorAdopcion(idAdopcion)
      : await listarSeguimientos();
    return NextResponse.json({ seguimientos });
  } catch (error) {
    console.error("Error al obtener los seguimientos:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los seguimientos." },
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

  const parseo = parseSeguimientoInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const seguimiento = await crearSeguimiento(parseo.valor);
    return NextResponse.json({ seguimiento }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al programar el seguimiento:", error);
    return NextResponse.json(
      { error: "No se pudo programar el seguimiento." },
      { status: 500 },
    );
  }
}
