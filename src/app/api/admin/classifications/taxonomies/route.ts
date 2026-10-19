import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const taxonomias = await prisma.taxonomia.findMany({
    orderBy: { nombre_clase: "asc" },
    include: { _count: { select: { especies: true } } },
  });

  return NextResponse.json({ taxonomias });
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

  const { nombre_clase } = (body ?? {}) as { nombre_clase?: unknown };
  const nombre = typeof nombre_clase === "string" ? nombre_clase.trim() : "";

  if (!nombre) {
    return NextResponse.json(
      { error: "El nombre de la clase es obligatorio." },
      { status: 400 },
    );
  }

  try {
    const taxonomia = await prisma.taxonomia.create({
      data: { nombre_clase: nombre },
    });
    return NextResponse.json({ taxonomia }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una taxonomía con ese nombre." },
        { status: 409 },
      );
    }
    console.error("Error al crear taxonomía:", error);
    return NextResponse.json(
      { error: "No se pudo crear la taxonomía." },
      { status: 500 },
    );
  }
}
