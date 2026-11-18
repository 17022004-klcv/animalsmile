import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { listarSolicitudesAprobadasDisponibles } from "@/src/services/adoptions/adoption-server";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const solicitudes = await listarSolicitudesAprobadasDisponibles();
    return NextResponse.json({ solicitudes });
  } catch (error) {
    console.error("Error al obtener las solicitudes aprobadas:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar las solicitudes aprobadas." },
      { status: 500 },
    );
  }
}
