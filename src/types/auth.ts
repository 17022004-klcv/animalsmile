import type { UsuarioPublico } from "@/src/types/usuario";

export type { SesionUsuario, SesionUsuario as Sesion } from "@/src/types/usuario";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegistroInput = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
};

export type RespuestaAuth = {
  ok?: boolean;
  redirect?: string;
  error?: string;
  usuario?: Pick<UsuarioPublico, "nombre" | "apellido" | "email" | "rol">;
};
