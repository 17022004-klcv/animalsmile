/**
 * Cliente HTTP ligero para las APIs del proyecto.
 * Lanza un Error con el mensaje en español que devuelve el servidor.
 */
export async function pedir<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("Error de conexión con el servidor.");
  }

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? "No se pudo completar la operación.");
  }

  return data;
}

export function json(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}
