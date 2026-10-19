import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { registrarAcceso, setSessionCookie } from "@/src/lib/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Correo y contraseña son obligatorios." },
      { status: 400 },
    );
  }

  const emailLimpio = email.trim().toLowerCase();
  const ipOrigen = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");

  if (!EMAIL_REGEX.test(emailLimpio) || !password) {
    return NextResponse.json(
      { error: "Credenciales incorrectas." },
      { status: 401 },
    );
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: emailLimpio },
  });

  if (!usuario) {
    await registrarAcceso({
      emailIntentado: emailLimpio,
      tipoEvento: "Login_Fallido",
      ipOrigen,
      userAgent,
      exito: false,
      detalle: "Correo no encontrado",
    });
    return NextResponse.json(
      { error: "Credenciales incorrectas." },
      { status: 401 },
    );
  }

  const coincide = await bcrypt.compare(password, usuario.password_hash);
  if (!coincide) {
    await registrarAcceso({
      idUsuario: usuario.id_usuario,
      emailIntentado: emailLimpio,
      tipoEvento: "Login_Fallido",
      ipOrigen,
      userAgent,
      exito: false,
      detalle: "Contraseña incorrecta",
    });
    return NextResponse.json(
      { error: "Credenciales incorrectas." },
      { status: 401 },
    );
  }

  if (usuario.activo === false) {
    await registrarAcceso({
      idUsuario: usuario.id_usuario,
      emailIntentado: emailLimpio,
      tipoEvento: "Bloqueo_Cuenta",
      ipOrigen,
      userAgent,
      exito: false,
      detalle: "Cuenta desactivada",
    });
    return NextResponse.json(
      { error: "Tu cuenta está desactivada. Contacta al administrador." },
      { status: 403 },
    );
  }

  await setSessionCookie({
    sub: usuario.id_usuario,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    rol: usuario.rol,
  });

  await registrarAcceso({
    idUsuario: usuario.id_usuario,
    emailIntentado: usuario.email,
    tipoEvento: "Login",
    ipOrigen,
    userAgent,
    exito: true,
  });

  const esAdmin = usuario.rol === "Administrador";

  return NextResponse.json({
    ok: true,
    redirect: esAdmin ? "/admin" : "/",
    usuario: {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
    },
  });
}
