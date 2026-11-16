import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { parseConsultaInput } from "@/src/services/inquiries/inquiry-validation";
import { crearConsulta } from "@/src/services/inquiries/inquiry-server";
import { ErrorServicio } from "@/src/services/common/errors";

type Params = { params: Promise<{ idAnimal: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { idAnimal } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const parseo = parseConsultaInput({ ...b, id_animal: idAnimal });
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const consulta = await crearConsulta(idAnimal, parseo.valor, session.sub);
    return NextResponse.json({ consulta }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al registrar la consulta:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la consulta." },
      { status: 500 },
    );
  }
}
