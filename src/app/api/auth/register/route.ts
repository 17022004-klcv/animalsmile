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

  const { nombre, apellido, email, password } = (body ?? {}) as {
    nombre?: unknown;
    apellido?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (
    typeof nombre !== "string" ||
    typeof apellido !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json(
      { error: "Todos los campos son obligatorios." },
      { status: 400 },
    );
  }

  const nombreLimpio = nombre.trim();
  const apellidoLimpio = apellido.trim();
  const emailLimpio = email.trim().toLowerCase();

  if (!nombreLimpio || !apellidoLimpio) {
    return NextResponse.json(
      { error: "Nombre y apellido son obligatorios." },
      { status: 400 },
    );
  }
  if (nombreLimpio.length > 100 || apellidoLimpio.length > 100) {
    return NextResponse.json(
      { error: "Nombre y apellido no pueden superar 100 caracteres." },
      { status: 400 },
    );
  }
  if (emailLimpio.length > 150 || !EMAIL_REGEX.test(emailLimpio)) {
    return NextResponse.json(
      { error: "Ingresa un correo electrónico válido." },
      { status: 400 },
    );
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres." },
      { status: 400 },
    );
  }
  if (password.length > 72) {
    return NextResponse.json(
      { error: "La contraseña no puede superar 72 caracteres." },
      { status: 400 },
    );
  }

  const existente = await prisma.usuario.findUnique({
    where: { email: emailLimpio },
    select: { id_usuario: true },
  });
  if (existente) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese correo electrónico." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: nombreLimpio,
      apellido: apellidoLimpio,
      email: emailLimpio,
      password_hash: passwordHash,
    },
    select: {
      id_usuario: true,
      nombre: true,
      apellido: true,
      email: true,
      rol: true,
    },
  });

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
    ipOrigen: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
    exito: true,
    detalle: "Registro de cuenta",
  });

  return NextResponse.json({
    ok: true,
    redirect: "/",
    usuario: {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
    },
  });
}
