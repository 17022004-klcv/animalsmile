import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearDonacionEspecie,
  listarDonacionesEspecie,
} from "@/src/services/donations/donation-spec-server";
import { parseDonacionEspecieInput } from "@/src/services/donations/donation-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const donaciones = await listarDonacionesEspecie();
    return NextResponse.json({ donaciones });
  } catch (error) {
    console.error("Error al obtener las donaciones en especie:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las donaciones en especie." },
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

  const parseo = parseDonacionEspecieInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const donacion = await crearDonacionEspecie(parseo.valor, session.sub);
    return NextResponse.json({ donacion }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error al registrar la donación en especie:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la donación en especie." },
      { status: 500 },
    );
  }
}
