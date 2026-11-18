import { pedir } from "@/src/services/common/http";
import type {
  EstadisticasDashboard,
  FiltroDashboard,
} from "@/src/types/dashboard";

export async function obtenerEstadisticasDashboard(
  filtro: FiltroDashboard,
): Promise<EstadisticasDashboard> {
  const params = new URLSearchParams({
    periodo: filtro.periodo,
    especie: filtro.especie,
  });
  return pedir<EstadisticasDashboard>(
    `/api/admin/dashboard?${params.toString()}`,
  );
}
