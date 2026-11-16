import { RolUsuario } from "@/src/types/enums";

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

/** Descripción de cada rol disponible en el módulo de usuarios. */
export const DESCRIPCIONES_ROL: Record<RolUsuario, string> = {
  [RolUsuario.Administrador]:
    "Acceso total al panel, configuración y gestión de usuarios.",
  [RolUsuario.Veterinario]:
    "Gestión de consultas, historiales clínicos y tratamientos.",
  [RolUsuario.Voluntario]:
    "Apoyo en rescates, cuidado de animales y seguimiento de adopciones.",
  [RolUsuario.Recepcionista]:
    "Registro de ingresos, solicitantes y atención general del refugio.",
};

/** Datos para crear un usuario. */
export type UsuarioInput = Pick<
  Usuario,
  "nombre" | "apellido" | "email" | "password_hash"
> &
  Partial<Pick<Usuario, "rol" | "telefono" | "activo">>;

/** Perfil del usuario autenticado, sin datos sensibles. */
export interface PerfilUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  telefono: string | null;
  activo: boolean | null;
  creado_en: string | null;
}

/** Datos de sesión (token firmado `as_session`). */
export interface SesionUsuario {
  sub: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
}
