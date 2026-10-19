import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const idTaxonomia = Number(id);
  if (!Number.isInteger(idTaxonomia)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const { nombre_clase } = (body ?? {}) as { nombre_clase?: unknown };
  const nombre = typeof nombre_clase === "string" ? nombre_clase.trim() : "";

  if (!nombre) {
    return NextResponse.json(
      { error: "El nombre de la clase es obligatorio." },
      { status: 400 },
    );
  }

  try {
    const taxonomia = await prisma.taxonomia.update({
      where: { id_taxonomia: idTaxonomia },
      data: { nombre_clase: nombre },
    });
    return NextResponse.json({ taxonomia });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una taxonomía con ese nombre." },
        { status: 409 },
      );
    }
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Taxonomía no encontrada." },
        { status: 404 },
      );
    }
    console.error("Error al actualizar taxonomía:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la taxonomía." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const idTaxonomia = Number(id);
  if (!Number.isInteger(idTaxonomia)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    await prisma.taxonomia.delete({ where: { id_taxonomia: idTaxonomia } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar: hay especies asignadas a esta taxonomía.",
        },
        { status: 409 },
      );
    }
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Taxonomía no encontrada." },
        { status: 404 },
      );
    }
    console.error("Error al eliminar taxonomía:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la taxonomía." },
      { status: 500 },
    );
  }
}
