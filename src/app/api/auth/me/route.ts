import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id_usuario: session.sub },
      select: {
        id_usuario: true,
        email: true,
        nombre: true,
        apellido: true,
        rol: true,
        telefono: true,
        activo: true,
        creado_en: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "El usuario de la sesión no existe." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
        telefono: usuario.telefono,
        activo: usuario.activo,
        creado_en: usuario.creado_en,
      },
    });
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el perfil." },
      { status: 500 },
    );
  }
}
