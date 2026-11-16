import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { obtenerAnimalConConsultas } from "@/src/services/inquiries/inquiry-server";
import { ErrorServicio } from "@/src/services/common/errors";

type Params = { params: Promise<{ idAnimal: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { idAnimal } = await params;

  try {
    const animal = await obtenerAnimalConConsultas(idAnimal);
    return NextResponse.json({ animal });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al obtener el detalle del animal:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el detalle del animal." },
      { status: 500 },
    );
  }
}
