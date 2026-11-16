import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { listarAnimalesConConsultas } from "@/src/services/inquiries/inquiry-server";
import { ErrorServicio } from "@/src/services/common/errors";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const animales = await listarAnimalesConConsultas();
    return NextResponse.json({ animales });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al listar los animales con consultas:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los animales." },
      { status: 500 },
    );
  }
}
