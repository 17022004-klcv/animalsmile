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
  const idEspecie = Number(id);
  if (!Number.isInteger(idEspecie)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const { nombre_comun, id_taxonomia, es_domestico } = (body ?? {}) as {
    nombre_comun?: unknown;
    id_taxonomia?: unknown;
    es_domestico?: unknown;
  };

  const data: {
    nombre_comun?: string;
    id_taxonomia?: number;
    es_domestico?: boolean;
  } = {};

  if (nombre_comun !== undefined) {
    const nombre = typeof nombre_comun === "string" ? nombre_comun.trim() : "";
    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre común es obligatorio." },
        { status: 400 },
      );
    }
    data.nombre_comun = nombre;
  }

  if (id_taxonomia !== undefined) {
    const idTaxonomia = Number(id_taxonomia);
    if (!Number.isInteger(idTaxonomia)) {
      return NextResponse.json(
        { error: "Debes seleccionar una taxonomía válida." },
        { status: 400 },
      );
    }
    data.id_taxonomia = idTaxonomia;
  }

  if (es_domestico !== undefined) {
    data.es_domestico = es_domestico !== false;
  }

  try {
    const especie = await prisma.especie.update({
      where: { id_especie: idEspecie },
      data,
      include: { taxonomia: true },
    });
    return NextResponse.json({ especie });
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "La taxonomía seleccionada no existe." },
        { status: 409 },
      );
    }
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Especie no encontrada." },
        { status: 404 },
      );
    }
    console.error("Error al actualizar especie:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar la especie." },
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
  const idEspecie = Number(id);
  if (!Number.isInteger(idEspecie)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    await prisma.especie.delete({ where: { id_especie: idEspecie } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        {
          error: "No se puede eliminar: hay animales registrados de esta especie.",
        },
        { status: 409 },
      );
    }
    if ((error as { code?: string }).code === "P2025") {
      return NextResponse.json(
        { error: "Especie no encontrada." },
        { status: 404 },
      );
    }
    console.error("Error al eliminar especie:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar la especie." },
      { status: 500 },
    );
  }
}
