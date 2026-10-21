import { pedir } from "@/src/services/common/http";
import type {
  ActualizarUsuarioParcial,
  CrearUsuarioInput,
} from "@/src/services/users/user-validation";
import type { UsuarioPublico } from "@/src/types/usuario";

const BASE = "/api/admin/users";

export async function obtenerUsuarios(): Promise<UsuarioPublico[]> {
  const data = await pedir<{ usuarios: UsuarioPublico[] }>(BASE);
  return data.usuarios;
}

export async function obtenerUsuario(id: string): Promise<UsuarioPublico> {
  const data = await pedir<{ usuario: UsuarioPublico }>(`${BASE}/${id}`);
  return data.usuario;
}

export async function crearUsuario(
  input: CrearUsuarioInput,
): Promise<UsuarioPublico> {
  const data = await pedir<{ usuario: UsuarioPublico }>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.usuario;
}

export async function actualizarUsuario(
  id: string,
  input: ActualizarUsuarioParcial,
): Promise<UsuarioPublico> {
  const data = await pedir<{ usuario: UsuarioPublico }>(`${BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return data.usuario;
}

export async function eliminarUsuario(id: string): Promise<void> {
  await pedir(`${BASE}/${id}`, { method: "DELETE" });
}
