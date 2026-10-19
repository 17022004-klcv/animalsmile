import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const especies = await prisma.especie.findMany({
    orderBy: { nombre_comun: "asc" },
    include: {
      taxonomia: true,
      _count: { select: { animales: true } },
    },
  });

  return NextResponse.json({ especies });
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

  const { nombre_comun, id_taxonomia, es_domestico } = (body ?? {}) as {
    nombre_comun?: unknown;
    id_taxonomia?: unknown;
    es_domestico?: unknown;
  };

  const nombre = typeof nombre_comun === "string" ? nombre_comun.trim() : "";
  const idTaxonomia = Number(id_taxonomia);

  if (!nombre) {
    return NextResponse.json(
      { error: "El nombre común es obligatorio." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(idTaxonomia)) {
    return NextResponse.json(
      { error: "Debes seleccionar una taxonomía válida." },
      { status: 400 },
    );
  }

  try {
    const especie = await prisma.especie.create({
      data: {
        nombre_comun: nombre,
        id_taxonomia: idTaxonomia,
        es_domestico: es_domestico !== false,
      },
      include: { taxonomia: true },
    });
    return NextResponse.json({ especie }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2003") {
      return NextResponse.json(
        { error: "La taxonomía seleccionada no existe." },
        { status: 409 },
      );
    }
    console.error("Error al crear especie:", error);
    return NextResponse.json(
      { error: "No se pudo crear la especie." },
      { status: 500 },
    );
  }
}
