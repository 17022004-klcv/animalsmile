import { pedir } from "@/src/services/common/http";
import type {
  ConfiguracionSistemaInput,
  ConfiguracionSitioInput,
} from "@/src/services/config/config-validation";
import type {
  ConfiguracionSistema,
  ConfiguracionSitio,
} from "@/src/types/configuracion";

const BASE = "/api/admin/config";

export async function obtenerConfigSistema(): Promise<ConfiguracionSistema[]> {
  const data = await pedir<{ configuraciones: ConfiguracionSistema[] }>(
    `${BASE}/system`,
  );
  return data.configuraciones;
}

export async function crearConfigSistema(
  input: ConfiguracionSistemaInput,
): Promise<ConfiguracionSistema> {
  const data = await pedir<{ configuracion: ConfiguracionSistema }>(
    `${BASE}/system`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.configuracion;
}

export async function actualizarConfigSistema(
  id: string,
  input: Partial<ConfiguracionSistemaInput>,
): Promise<ConfiguracionSistema> {
  const data = await pedir<{ configuracion: ConfiguracionSistema }>(
    `${BASE}/system/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.configuracion;
}

export async function eliminarConfigSistema(id: string): Promise<void> {
  await pedir(`${BASE}/system/${id}`, { method: "DELETE" });
}

export async function obtenerConfigSitio(): Promise<ConfiguracionSitio[]> {
  const data = await pedir<{ configuraciones: ConfiguracionSitio[] }>(
    `${BASE}/site`,
  );
  return data.configuraciones;
}

export async function crearConfigSitio(
  input: ConfiguracionSitioInput,
): Promise<ConfiguracionSitio> {
  const data = await pedir<{ configuracion: ConfiguracionSitio }>(
    `${BASE}/site`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.configuracion;
}

export async function actualizarConfigSitio(
  id: string,
  input: Partial<ConfiguracionSitioInput>,
): Promise<ConfiguracionSitio> {
  const data = await pedir<{ configuracion: ConfiguracionSitio }>(
    `${BASE}/site/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return data.configuracion;
}

export async function eliminarConfigSitio(id: string): Promise<void> {
  await pedir(`${BASE}/site/${id}`, { method: "DELETE" });
}

export async function guardarConfigSitio(
  configuraciones: ConfiguracionSitioInput[],
): Promise<ConfiguracionSitio[]> {
  const data = await pedir<{ configuraciones: ConfiguracionSitio[] }>(
    `${BASE}/site`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configuraciones }),
    },
  );
  return data.configuraciones;
}

export async function subirImagenesSitio(files: File[]): Promise<string[]> {
  const formData = new FormData();
  formData.append("categoria", "site");
  for (const file of files) {
    formData.append("files", file);
  }
  const data = await pedir<{ urls: string[] }>("/api/admin/upload", {
    method: "POST",
    body: formData,
  });
  return data.urls ?? [];
}

export async function obtenerConfiguracionSitioPublica(): Promise<
  Record<string, string>
> {
  const data = await pedir<{ configuracion: Record<string, string> }>(
    "/api/config/site",
    { cache: "no-store" },
  );
  return data.configuracion ?? {};
}
