import { pedir } from "@/src/services/common/http";
import type { AnimalConRelaciones } from "@/src/types/animal";

const BASE = "/api/admin/animals";

export async function obtenerAnimales(): Promise<AnimalConRelaciones[]> {
  const data = await pedir<{ animales: AnimalConRelaciones[] }>(BASE);
  return data.animales;
}

export async function obtenerAnimal(
  id: string,
): Promise<AnimalConRelaciones> {
  const data = await pedir<{ animal: AnimalConRelaciones }>(`${BASE}/${id}`);
  return data.animal;
}

export async function eliminarAnimal(id: string): Promise<void> {
  await pedir(`${BASE}/${id}`, { method: "DELETE" });
}

export async function subirArchivos(files: File[]): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file);
  }
  const data = await pedir<{ urls: string[] }>("/api/admin/upload", {
    method: "POST",
    body: formData,
  });
  return data.urls ?? [];
}
