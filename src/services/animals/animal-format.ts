export function formatearEstado(estado: string): string {
  return estado.replace(/_/g, " ");
}

export function fechaCorta(iso: string | null): string {
  if (!iso) return "—";
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleDateString("es-ES");
}
