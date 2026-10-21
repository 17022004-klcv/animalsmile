import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { listarExpedientes } from "@/src/services/medical/medical-server";
import { ErrorServicio } from "@/src/services/common/errors";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const expedientes = await listarExpedientes();
    return NextResponse.json({ expedientes });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al listar expedientes:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los expedientes." },
      { status: 500 },
    );
  }
}
