import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { parseHistorialInput } from "@/src/services/medical/medical-validation";
import { agregarHistorial } from "@/src/services/medical/medical-server";
import { ErrorServicio } from "@/src/services/common/errors";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Params) {
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

  const parseo = parseHistorialInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const historial = await agregarHistorial(id, parseo.valor, session.sub);
    return NextResponse.json({ historial }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al agregar historial:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la entrada clínica." },
      { status: 500 },
    );
  }
}
