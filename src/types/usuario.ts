import type { RolUsuario } from "@/src/types/enums";

/** Modelo `Usuario` (tabla `usuarios`). */
export interface Usuario {
  id_usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
  rol: RolUsuario;
  telefono: string | null;
  activo: boolean | null;
  creado_en: string | null;
}

/** Usuario sin datos sensibles, para respuestas de API. */
export type UsuarioPublico = Omit<Usuario, "password_hash">;

/** Datos para crear un usuario. */
export type UsuarioInput = Pick<
  Usuario,
  "nombre" | "apellido" | "email" | "password_hash"
> &
  Partial<Pick<Usuario, "rol" | "telefono" | "activo">>;

/** Datos de sesión (token firmado `as_session`). */
export interface SesionUsuario {
  sub: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
}
