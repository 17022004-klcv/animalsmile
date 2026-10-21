import type {
  RolUsuario,
} from "@/src/types/enums";
import type { UsuarioPublico } from "@/src/types/usuario";
import type { ResultadoParseo } from "@/src/types/common";
import { ROLES_USUARIO } from "@/src/types/enums";

export type CrearUsuarioInput = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: RolUsuario;
  telefono: string | null;
};

export type ActualizarUsuarioParcial = Partial<
  Omit<CrearUsuarioInput, "password">
> & {
  password?: string;
  activo?: boolean;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esRolValido(valor: unknown): valor is RolUsuario {
  return (
    typeof valor === "string" &&
    (ROLES_USUARIO as readonly string[]).includes(valor)
  );
}

/** Valida y normaliza la creación de un usuario. */
export function parseCrearUsuario(
  raw: unknown,
): ResultadoParseo<CrearUsuarioInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  const nombre = typeof b.nombre === "string" ? b.nombre.trim() : "";
  if (!nombre) return { ok: false, error: "El nombre es obligatorio." };

  const apellido = typeof b.apellido === "string" ? b.apellido.trim() : "";
  if (!apellido) return { ok: false, error: "El apellido es obligatorio." };

  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, error: "El correo electrónico no es válido." };
  }

  const password = typeof b.password === "string" ? b.password : "";
  if (password.length < 8) {
    return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  }

  if (!esRolValido(b.rol)) {
    return { ok: false, error: "El rol seleccionado no es válido." };
  }

  const telefono =
    typeof b.telefono === "string" && b.telefono.trim()
      ? b.telefono.trim()
      : null;

  return {
    ok: true,
    valor: { nombre, apellido, email, password, rol: b.rol, telefono },
  };
}

/** Valida y normaliza la actualización parcial de un usuario. */
export function parseActualizarUsuario(
  raw: unknown,
): ResultadoParseo<ActualizarUsuarioParcial> {
  const b = (raw ?? {}) as Record<string, unknown>;
  const data: ActualizarUsuarioParcial = {};

  if (b.nombre !== undefined) {
    const nombre = typeof b.nombre === "string" ? b.nombre.trim() : "";
    if (!nombre) return { ok: false, error: "El nombre es obligatorio." };
    data.nombre = nombre;
  }

  if (b.apellido !== undefined) {
    const apellido = typeof b.apellido === "string" ? b.apellido.trim() : "";
    if (!apellido) return { ok: false, error: "El apellido es obligatorio." };
    data.apellido = apellido;
  }

  if (b.email !== undefined) {
    const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
    if (!email || !EMAIL_RE.test(email)) {
      return { ok: false, error: "El correo electrónico no es válido." };
    }
    data.email = email;
  }

  if (b.password !== undefined) {
    const password = typeof b.password === "string" ? b.password : "";
    if (password && password.length < 8) {
      return {
        ok: false,
        error: "La contraseña debe tener al menos 8 caracteres.",
      };
    }
    if (password) data.password = password;
  }

  if (b.rol !== undefined) {
    if (!esRolValido(b.rol)) {
      return { ok: false, error: "El rol seleccionado no es válido." };
    }
    data.rol = b.rol;
  }

  if (b.telefono !== undefined) {
    data.telefono =
      typeof b.telefono === "string" && b.telefono.trim()
        ? b.telefono.trim()
        : null;
  }

  if (b.activo !== undefined) {
    data.activo = b.activo === true || b.activo === "true";
  }

  return { ok: true, valor: data };
}

export type { UsuarioPublico };
