import { NextRequest, NextResponse } from "next/server";
import { parseLoginInput } from "@/src/services/auth/auth-validation";
import { iniciarSesion } from "@/src/services/auth/auth-server";
import { ErrorServicio } from "@/src/services/common/errors";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parseo = parseLoginInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 401 });
  }

  try {
    const resultado = await iniciarSesion(parseo.valor, {
      ipOrigen: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return NextResponse.json({ ok: true, ...resultado });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error inesperado al iniciar sesión:", error);
    return NextResponse.json(
      { error: "No se pudo iniciar sesión." },
      { status: 500 },
    );
  }
}
