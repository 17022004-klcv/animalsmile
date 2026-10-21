import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { eliminarHistorial } from "@/src/services/medical/medical-server";
import { ErrorServicio } from "@/src/services/common/errors";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await eliminarHistorial(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error al eliminar historial:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el registro clínico." },
      { status: 500 },
    );
  }
}
