import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { registrarAcceso, setSessionCookie } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import type { LoginInput, RegistroInput } from "@/src/types/auth";

type MetadatosAcceso = {
  ipOrigen: string | null;
  userAgent: string | null;
};

/** Autentica a un usuario y crea la sesión. Lanza ErrorServicio si falla. */
export async function iniciarSesion(
  input: LoginInput,
  metadatos: MetadatosAcceso,
) {
  const { ipOrigen, userAgent } = metadatos;

  const usuario = await prisma.usuario.findUnique({
    where: { email: input.email },
  });

  if (!usuario) {
    await registrarAcceso({
      emailIntentado: input.email,
      tipoEvento: "Login_Fallido",
      ipOrigen,
      userAgent,
      exito: false,
      detalle: "Correo no encontrado",
    });
    throw new ErrorServicio(401, "Credenciales incorrectas.");
  }

  const coincide = await bcrypt.compare(input.password, usuario.password_hash);
  if (!coincide) {
    await registrarAcceso({
      idUsuario: usuario.id_usuario,
      emailIntentado: input.email,
      tipoEvento: "Login_Fallido",
      ipOrigen,
      userAgent,
      exito: false,
      detalle: "Contraseña incorrecta",
    });
    throw new ErrorServicio(401, "Credenciales incorrectas.");
  }

  if (usuario.activo === false) {
    await registrarAcceso({
      idUsuario: usuario.id_usuario,
      emailIntentado: input.email,
      tipoEvento: "Bloqueo_Cuenta",
      ipOrigen,
      userAgent,
      exito: false,
      detalle: "Cuenta desactivada",
    });
    throw new ErrorServicio(
      403,
      "Tu cuenta está desactivada. Contacta al administrador.",
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

  return {
    redirect: usuario.rol === "Administrador" ? "/admin" : "/",
    usuario: {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
}

/** Crea una cuenta nueva, inicia sesión y deja registro en bitácora. */
export async function registrarCuenta(
  input: RegistroInput,
  metadatos: MetadatosAcceso,
) {
  const { ipOrigen, userAgent } = metadatos;

  const existente = await prisma.usuario.findUnique({
    where: { email: input.email },
    select: { id_usuario: true },
  });
  if (existente) {
    throw new ErrorServicio(
      409,
      "Ya existe una cuenta con ese correo electrónico.",
    );
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: input.nombre,
      apellido: input.apellido,
      email: input.email,
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
    ipOrigen,
    userAgent,
    exito: true,
    detalle: "Registro de cuenta",
  });

  return {
    usuario: {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      rol: usuario.rol,
    },
  };
}

// En tu archivo de auth-service.ts
export async function cambiarContrasena(
  idUsuario: string,
  passwordActual: string,
  passwordNueva: string,
) {
  // 1. Buscamos al usuario
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: idUsuario },
  });

  if (!usuario) {
    throw new ErrorServicio(404, "Usuario no encontrado.");
  }

  // 2. Verificamos que la contraseña actual sea correcta
  const coincide = await bcrypt.compare(passwordActual, usuario.password_hash);
  if (!coincide) {
    throw new ErrorServicio(400, "La contraseña actual es incorrecta.");
  }

  // 3. Validamos la nueva contraseña (mínimo 8 caracteres, etc.)
  if (passwordNueva.length < 8) {
    throw new ErrorServicio(
      400,
      "La nueva contraseña debe tener al menos 8 caracteres.",
    );
  }

  // 4. Encriptamos y guardamos la nueva
  const nuevoHash = await bcrypt.hash(passwordNueva, 10);
  await prisma.usuario.update({
    where: { id_usuario: idUsuario },
    data: { password_hash: nuevoHash },
  });

  return { exito: true };
}
