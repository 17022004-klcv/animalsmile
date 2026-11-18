import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import {
  obtenerEstadisticasDashboard,
  parseFiltroDashboard,
} from "@/src/services/dashboard/dashboard-server";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const filtro = parseFiltroDashboard(request.url);
    const dashboard = await obtenerEstadisticasDashboard(filtro);
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error("Error al obtener las estadísticas del dashboard:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las estadísticas del dashboard." },
      { status: 500 },
    );
  }
}
