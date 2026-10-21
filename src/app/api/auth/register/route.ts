import { NextRequest, NextResponse } from "next/server";
import { parseRegistroInput } from "@/src/services/auth/auth-validation";
import { registrarCuenta } from "@/src/services/auth/auth-server";
import { ErrorServicio } from "@/src/services/common/errors";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parseo = parseRegistroInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const resultado = await registrarCuenta(parseo.valor, {
      ipOrigen: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    });
    return NextResponse.json({ ok: true, redirect: "/", ...resultado });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error inesperado al registrar cuenta:", error);
    return NextResponse.json(
      { error: "No se pudo crear la cuenta." },
      { status: 500 },
    );
  }
}
