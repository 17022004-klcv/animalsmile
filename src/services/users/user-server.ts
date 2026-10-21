import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { ErrorServicio, mapearErrorPrisma } from "@/src/services/common/errors";
import type {
  ActualizarUsuarioParcial,
  CrearUsuarioInput,
} from "@/src/services/users/user-validation";
import type { Prisma } from "@/src/generated/prisma/client";

const SELECT_PUBLICO = {
  id_usuario: true,
  nombre: true,
  apellido: true,
  email: true,
  rol: true,
  telefono: true,
  activo: true,
  creado_en: true,
} as const;

const MAPA_USUARIO: Record<string, { status: number; mensaje: string }> = {
  P2002: { status: 409, mensaje: "Ya existe un usuario con ese correo." },
  P2025: { status: 404, mensaje: "Usuario no encontrado." },
};

export async function listarUsuarios() {
  return prisma.usuario.findMany({
    orderBy: { creado_en: "desc" },
    select: SELECT_PUBLICO,
  });
}

export async function obtenerUsuario(id: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: id },
    select: SELECT_PUBLICO,
  });
  if (!usuario) {
    throw new ErrorServicio(404, "Usuario no encontrado.");
  }
  return usuario;
}

export async function crearUsuario(input: CrearUsuarioInput) {
  try {
    const passwordHash = await bcrypt.hash(input.password, 10);
    return await prisma.usuario.create({
      data: {
        nombre: input.nombre,
        apellido: input.apellido,
        email: input.email,
        password_hash: passwordHash,
        rol: input.rol,
        telefono: input.telefono,
      },
      select: SELECT_PUBLICO,
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw mapearErrorPrisma(error, MAPA_USUARIO, {
      status: 500,
      mensaje: "No se pudo crear el usuario.",
    });
  }
}

export async function actualizarUsuario(
  id: string,
  input: ActualizarUsuarioParcial,
) {
  const data: Prisma.UsuarioUncheckedUpdateInput = {
    nombre: input.nombre,
    apellido: input.apellido,
    email: input.email,
    rol: input.rol,
    telefono: input.telefono,
    activo: input.activo,
  };
  if (input.password) {
    data.password_hash = await bcrypt.hash(input.password, 10);
  }

  try {
    return await prisma.usuario.update({
      where: { id_usuario: id },
      data,
      select: SELECT_PUBLICO,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    throw mapearErrorPrisma(error, MAPA_USUARIO, {
      status: 500,
      mensaje: "No se pudo actualizar el usuario.",
    });
  }
}

export async function eliminarUsuario(id: string) {
  try {
    await prisma.usuario.delete({ where: { id_usuario: id } });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw mapearErrorPrisma(error, {
      P2003: {
        status: 409,
        mensaje:
          "No se puede eliminar: el usuario tiene registros asociados (rescates, historiales, etc.).",
      },
      P2025: { status: 404, mensaje: "Usuario no encontrado." },
    }, {
      status: 500,
      mensaje: "No se pudo eliminar el usuario.",
    });
  }
}
