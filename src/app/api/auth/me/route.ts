import { NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "No hay sesión activa." }, { status: 401 });
  }

  return NextResponse.json({
    usuario: {
      id: session.sub,
      email: session.email,
      nombre: session.nombre,
      apellido: session.apellido,
      rol: session.rol,
    },
  });
}
