import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import {
  listarAccesos,
  parseFiltroDesdeUrl,
} from "@/src/services/security/security-server";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const filtro = parseFiltroDesdeUrl(request.url);
    const accesos = await listarAccesos(filtro);
    return NextResponse.json({ accesos });
  } catch (error) {
    console.error("Error al obtener la bitácora de accesos:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la bitácora de accesos." },
      { status: 500 },
    );
  }
}
