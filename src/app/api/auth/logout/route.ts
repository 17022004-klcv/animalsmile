import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, getSession, registrarAcceso } from "@/src/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (session) {
    await registrarAcceso({
      idUsuario: session.sub,
      emailIntentado: session.email,
      tipoEvento: "Logout",
      ipOrigen: request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
      exito: true,
    });
  }

  await clearSessionCookie();

  return NextResponse.json({ ok: true, redirect: "/login" });
}
