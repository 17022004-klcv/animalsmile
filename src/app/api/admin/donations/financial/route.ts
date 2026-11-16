import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearDonacionFinanciera,
  listarDonacionesFinancieras,
} from "@/src/services/donations/donation-server";
import { parseDonacionFinancieraInput } from "@/src/services/donations/donation-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const donaciones = await listarDonacionesFinancieras();
    return NextResponse.json({ donaciones });
  } catch (error) {
    console.error("Error al obtener las donaciones financieras:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las donaciones financieras." },
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

  const parseo = parseDonacionFinancieraInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const donacion = await crearDonacionFinanciera(parseo.valor, session.sub);
    return NextResponse.json({ donacion }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al registrar la donación financiera:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la donación financiera." },
      { status: 500 },
    );
  }
}
