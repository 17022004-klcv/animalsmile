import type { LoginInput, RegistroInput } from "@/src/types/auth";
import type { ResultadoParseo } from "@/src/types/common";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valida las credenciales de inicio de sesión. */
export function parseLoginInput(raw: unknown): ResultadoParseo<LoginInput> {
  const b = (raw ?? {}) as Record<string, unknown>;
  if (typeof b.email !== "string" || typeof b.password !== "string") {
    return { ok: false, error: "Correo y contraseña son obligatorios." };
  }
  const email = b.email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(email) || !b.password) {
    return { ok: false, error: "Credenciales incorrectas." };
  }
  return { ok: true, valor: { email, password: b.password } };
}

/** Valida los datos de registro de una cuenta nueva. */
export function parseRegistroInput(
  raw: unknown,
): ResultadoParseo<RegistroInput> {
  const b = (raw ?? {}) as Record<string, unknown>;

  if (
    typeof b.nombre !== "string" ||
    typeof b.apellido !== "string" ||
    typeof b.email !== "string" ||
    typeof b.password !== "string"
  ) {
    return { ok: false, error: "Todos los campos son obligatorios." };
  }

  const nombre = b.nombre.trim();
  const apellido = b.apellido.trim();
  const email = b.email.trim().toLowerCase();
  const password = b.password;

  if (!nombre || !apellido) {
    return { ok: false, error: "Nombre y apellido son obligatorios." };
  }
  if (nombre.length > 100 || apellido.length > 100) {
    return {
      ok: false,
      error: "Nombre y apellido no pueden superar 100 caracteres.",
    };
  }
  if (email.length > 150 || !EMAIL_REGEX.test(email)) {
    return { ok: false, error: "Ingresa un correo electrónico válido." };
  }
  if (password.length < 8) {
    return {
      ok: false,
      error: "La contraseña debe tener al menos 8 caracteres.",
    };
  }
  if (password.length > 72) {
    return { ok: false, error: "La contraseña no puede superar 72 caracteres." };
  }

  return { ok: true, valor: { nombre, apellido, email, password } };
}
