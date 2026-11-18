import { NextResponse } from "next/server";
import { cambiarContrasena } from "@/src/services/auth/auth-server";
// Ajusta tu ruta
import { getSession } from "@/src/lib/auth"; // Asumo que tienes algo así para leer la cookie

export async function PUT(request: Request) {
  try {
    // 1. Obtener el usuario de la sesión (ajusta esto a tu helper real)
    const sesion = await getSession();
    if (!sesion || !sesion.sub) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Leer el body
    const body = await request.json();
    const { passwordActual, passwordNueva } = body;

    if (!passwordActual || !passwordNueva) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    // 3. Llamar al servicio
    await cambiarContrasena(sesion.sub, passwordActual, passwordNueva);

    return NextResponse.json({ mensaje: "Contraseña actualizada" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: error.status || 500 },
    );
  }
}
