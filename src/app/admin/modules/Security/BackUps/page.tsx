"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme, type Palette } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput, SelectFilter } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import {
  cambiarEstadoBackup,
  eliminarBackup,
  obtenerBackupDetalle,
  obtenerBackups,
  registrarBackup,
  type BackupConEjecutor,
  type BackupDetalle,
} from "@/src/services/security/security-client";
import {
  etiquetaAccionBitacora,
  etiquetaEstadoBackup,
  fechaHora,
} from "@/src/services/security/security-format";
import {
  ESTADOS_BACKUP,
  EstadoBackup,
  TIPOS_BACKUP,
  TipoBackup,
} from "@/src/types/enums";
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle2,
  Database,
  Download,
  Eye,
  HardDrive,
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";

type FormBackup = {
  nombre_archivo: string;
  ruta_almacenamiento: string;
  tipo_backup: TipoBackup;
  hash_checksum: string;
  es_automatico: boolean;
};

function colorEstado(estado: EstadoBackup, palette: Palette): string {
  switch (estado) {
    case EstadoBackup.Completado:
      return "#10b981";
    case EstadoBackup.Fallido:
      return "#ef4444";
    case EstadoBackup.Restaurado:
      return palette.secondary;
    case EstadoBackup.En_Proceso:
      return "#f59e0b";
    default:
      return palette.muted;
  }
}

function colorTipo(tipo: TipoBackup, palette: Palette): string {
  switch (tipo) {
    case TipoBackup.Completo:
      return palette.primary;
    case TipoBackup.Incremental:
      return palette.secondary;
    case TipoBackup.Diferencial:
      return palette.muted;
    default:
      return palette.muted;
  }
}

function formatoTamano(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

function nombreEjecutor(backup: BackupConEjecutor | BackupDetalle): string {
  return backup.ejecutor
    ? `${backup.ejecutor.nombre} ${backup.ejecutor.apellido}`.trim()
    : "—";
}

export default function BackupsPage() {
  const { palette } = useTheme();

  const [backups, setBackups] = useState<BackupConEjecutor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [modalNuevo, setModalNuevo] = useState(false);
  const [form, setForm] = useState<FormBackup>({
    nombre_archivo: "",
    ruta_almacenamiento: "",
    tipo_backup: TipoBackup.Completo,
    hash_checksum: "",
    es_automatico: false,
  });
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [modalDetalle, setModalDetalle] = useState(false);
  const [seleccionado, setSeleccionado] =
    useState<BackupConEjecutor | null>(null);
  const [detalle, setDetalle] = useState<BackupDetalle | null>(null);
  const [detalleCargando, setDetalleCargando] = useState(false);
  const [cambiandoId, setCambiandoId] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [modalFallido, setModalFallido] = useState(false);
  const [backupFallido, setBackupFallido] =
    useState<BackupConEjecutor | null>(null);
  const [motivoFallo, setMotivoFallo] = useState("");

  useEffect(() => {
    let cancelado = false;

    const pedirDatos = () => {
      setCargando(true);
      obtenerBackups({
        desde: desde || null,
        hasta: hasta || null,
        tipo_backup: tipoFiltro ? (tipoFiltro as TipoBackup) : null,
        estado: estadoFiltro ? (estadoFiltro as EstadoBackup) : null,
        busqueda: busqueda.trim() || null,
        limite: 500,
      })
        .then((data) => {
          if (cancelado) return;
          setBackups(data);
          setError(null);
        })
        .catch((err) => {
          if (cancelado) return;
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los backups.",
          );
        })
        .finally(() => {
          if (!cancelado) setCargando(false);
        });
    };

    const timer = setTimeout(pedirDatos, busqueda.trim() ? 300 : 0);
    return () => {
      cancelado = true;
      clearTimeout(timer);
    };
  }, [busqueda, tipoFiltro, estadoFiltro, desde, hasta, recarga]);

  const resumen = useMemo(() => {
    const completados = backups.filter((b) => b.estado === EstadoBackup.Completado).length;
    const fallidos = backups.filter((b) => b.estado === EstadoBackup.Fallido).length;
    const enProceso = backups.filter((b) => b.estado === EstadoBackup.En_Proceso).length;
    return { total: backups.length, completados, fallidos, enProceso };
  }, [backups]);

  const hayFiltros = Boolean(
    busqueda || tipoFiltro || estadoFiltro || desde || hasta,
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setTipoFiltro("");
    setEstadoFiltro("");
    setDesde("");
    setHasta("");
  };

  const abrirNuevo = () => {
    const sello = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-");
    const nombre = `animalsmile_${sello}.sql`;
    setForm({
      nombre_archivo: nombre,
      ruta_almacenamiento: `backups/${nombre}`,
      tipo_backup: TipoBackup.Completo,
      hash_checksum: "",
      es_automatico: false,
    });
    setErrorForm(null);
    setModalNuevo(true);
  };

  const handleCrear = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGuardando(true);
    setErrorForm(null);

    try {
      await registrarBackup({
        nombre_archivo: form.nombre_archivo.trim(),
        ruta_almacenamiento: form.ruta_almacenamiento.trim(),
        tipo_backup: form.tipo_backup,
        hash_checksum: form.hash_checksum.trim() || null,
        es_automatico: form.es_automatico,
      });
      setModalNuevo(false);
      setRecarga((n) => n + 1);
    } catch (err) {
      setErrorForm(
        err instanceof Error ? err.message : "No se pudo registrar el backup.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const abrirDetalle = async (backup: BackupConEjecutor) => {
    setSeleccionado(backup);
    setDetalle(null);
    setModalDetalle(true);
    setDetalleCargando(true);
    try {
      const data = await obtenerBackupDetalle(backup.id_backup);
      setDetalle(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar el detalle.",
      );
    } finally {
      setDetalleCargando(false);
    }
  };

  const aplicarCambioEstado = async (
    backup: BackupConEjecutor,
    nuevoEstado: EstadoBackup,
    detalleError: string | null,
  ) => {
    setCambiandoId(backup.id_backup);
    setError(null);
    try {
      await cambiarEstadoBackup(backup.id_backup, {
        estado: nuevoEstado,
        detalle_error: detalleError,
        tamano_bytes: backup.tamano_bytes,
        hash_checksum: backup.hash_checksum,
      });
      setRecarga((n) => n + 1);

      if (seleccionado?.id_backup === backup.id_backup) {
        const actualizado = await obtenerBackupDetalle(backup.id_backup);
        setDetalle(actualizado);
        setSeleccionado(actualizado);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el estado del backup.",
      );
    } finally {
      setCambiandoId(null);
    }
  };

  const handleCambiarEstado = (
    backup: BackupConEjecutor,
    nuevoEstado: EstadoBackup,
  ) => {
    if (nuevoEstado === EstadoBackup.Fallido) {
      setBackupFallido(backup);
      setMotivoFallo("");
      setModalFallido(true);
      return;
    }
    void aplicarCambioEstado(backup, nuevoEstado, null);
  };

  const cerrarModalFallido = () => {
    setModalFallido(false);
    setBackupFallido(null);
    setMotivoFallo("");
  };

  const confirmarFallido = () => {
    if (!backupFallido) return;
    const backup = backupFallido;
    const detalleError = motivoFallo.trim() || null;
    cerrarModalFallido();
    void aplicarCambioEstado(backup, EstadoBackup.Fallido, detalleError);
  };

  const handleEliminar = async (backup: BackupConEjecutor) => {
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar el backup "${backup.nombre_archivo}"? También se eliminará su bitácora.`,
      )
    ) {
      return;
    }

    setEliminandoId(backup.id_backup);
    setError(null);
    try {
      await eliminarBackup(backup.id_backup);
      if (seleccionado?.id_backup === backup.id_backup) {
        setModalDetalle(false);
        setSeleccionado(null);
        setDetalle(null);
      }
      setRecarga((n) => n + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el backup.",
      );
    } finally {
      setEliminandoId(null);
    }
  };

  const exportarCSV = () => {
    const filas = [
      [
        "Archivo",
        "Ruta",
        "Tipo",
        "Estado",
        "Tamaño",
        "Fecha inicio",
        "Fecha fin",
        "Ejecutado por",
        "Automático",
      ],
      ...backups.map((b) => [
        b.nombre_archivo,
        b.ruta_almacenamiento,
        b.tipo_backup,
        etiquetaEstadoBackup(b.estado),
        formatoTamano(b.tamano_bytes),
        fechaHora(b.fecha_inicio),
        fechaHora(b.fecha_fin),
        nombreEjecutor(b),
        b.es_automatico ? "Sí" : "No",
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backups.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between shrink-0 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Recuperación de{" "}
              <span style={{ color: palette.primary }}>Datos</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro y seguimiento de copias de seguridad del sistema.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={
                <RefreshCw
                  size={15}
                  className={cargando ? "animate-spin" : ""}
                />
              }
              onClick={() => setRecarga((n) => n + 1)}
            >
              Actualizar
            </Button>
            <Button
              variant="outline"
              icon={<Download size={15} />}
              onClick={exportarCSV}
            >
              Exportar
            </Button>
            <Button icon={<Plus size={16} />} onClick={abrirNuevo}>
              Nuevo Backup
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 my-4 shrink-0">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase">
            <SlidersHorizontal size={13} />
            Filtros
          </span>

          <SearchInput
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por archivo, ruta, hash o responsable..."
          />

          <SelectFilter
            label="Tipo"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            options={[
              { label: "Todos", value: "" },
              ...TIPOS_BACKUP.map((tipo) => ({ label: tipo, value: tipo })),
            ]}
          />

          <SelectFilter
            label="Estado"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            options={[
              { label: "Todos", value: "" },
              ...ESTADOS_BACKUP.map((estado) => ({
                label: etiquetaEstadoBackup(estado as EstadoBackup),
                value: estado,
              })),
            ]}
          />

          <label className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
              Desde
            </span>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">
              Hasta
            </span>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
            />
          </label>

          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
              title="Limpiar filtros"
            >
              <X size={13} />
              Limpiar
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
          {cargando ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando backups...</span>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <table className="w-full min-w-[1020px] text-left text-xs text-slate-600">
                <thead className="sticky top-0 z-10 bg-slate-50/95 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Archivo</th>
                    <th className="px-4 py-3">Tipo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Tamaño</th>
                    <th className="px-4 py-3">Inicio</th>
                    <th className="px-4 py-3">Ejecutado por</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backups.map((item) => {
                    const colorEst = colorEstado(item.estado, palette);
                    const colorTip = colorTipo(item.tipo_backup, palette);

                    return (
                      <tr
                        key={item.id_backup}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-9 h-9 rounded-full flex items-center justify-center border shrink-0"
                              style={{
                                color: colorTip,
                                backgroundColor: `${colorTip}12`,
                                borderColor: `${colorTip}30`,
                              }}
                            >
                              <Archive size={16} />
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate max-w-[260px]">
                                {item.nombre_archivo}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[260px]">
                                {item.ruta_almacenamiento}
                              </p>
                            </div>
                            {item.es_automatico && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200 whitespace-nowrap">
                                Automático
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-2.5">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap"
                            style={{
                              color: colorTip,
                              backgroundColor: `${colorTip}10`,
                              borderColor: `${colorTip}30`,
                            }}
                          >
                            {item.tipo_backup}
                          </span>
                        </td>

                        <td className="px-4 py-2.5">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap"
                            style={{
                              color: colorEst,
                              backgroundColor: `${colorEst}10`,
                              borderColor: `${colorEst}30`,
                            }}
                          >
                            {item.estado === EstadoBackup.Completado && (
                              <CheckCircle2 size={11} />
                            )}
                            {item.estado === EstadoBackup.Fallido && <XCircle size={11} />}
                            {item.estado === EstadoBackup.En_Proceso && (
                              <Loader2 size={11} className="animate-spin" />
                            )}
                            {item.estado === EstadoBackup.Restaurado && (
                              <RotateCcw size={11} />
                            )}
                            {etiquetaEstadoBackup(item.estado)}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 font-medium text-slate-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <HardDrive size={11} className="text-slate-400" />
                            {formatoTamano(item.tamano_bytes)}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 font-medium text-slate-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} className="text-slate-400" />
                            {fechaHora(item.fecha_inicio)}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 font-medium text-slate-600 max-w-[170px] truncate">
                          <span className="inline-flex items-center gap-1">
                            <User size={11} className="text-slate-400" />
                            {nombreEjecutor(item)}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => abrirDetalle(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  palette.primary;
                                e.currentTarget.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color = "#64748b";
                              }}
                              title="Ver detalle del backup"
                            >
                              <Eye size={15} />
                            </button>

                            {item.estado !== EstadoBackup.Completado && (
                              <button
                                onClick={() =>
                                  handleCambiarEstado(item, EstadoBackup.Completado)
                                }
                                disabled={cambiandoId === item.id_backup}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Marcar como completado"
                              >
                                {cambiandoId === item.id_backup ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={15} />
                                )}
                              </button>
                            )}

                            {item.estado !== EstadoBackup.Fallido && (
                              <button
                                onClick={() =>
                                  handleCambiarEstado(item, EstadoBackup.Fallido)
                                }
                                disabled={cambiandoId === item.id_backup}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                                title="Marcar como fallido"
                              >
                                {cambiandoId === item.id_backup ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <XCircle size={15} />
                                )}
                              </button>
                            )}

                            <button
                              onClick={() => handleEliminar(item)}
                              disabled={eliminandoId === item.id_backup}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Eliminar backup"
                            >
                              {eliminandoId === item.id_backup ? (
                                <Loader2 size={15} className="animate-spin" />
                              ) : (
                                <Trash2 size={15} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!cargando && backups.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-400 font-medium"
                      >
                        No se encontraron backups con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>
            Mostrando {resumen.total} registro
            {resumen.total === 1 ? "" : "s"} (límite 500)
          </span>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 size={13} />
              {resumen.completados} completado
              {resumen.completados === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <Loader2 size={13} />
              {resumen.enProceso} en proceso
            </span>
            <span className="flex items-center gap-1 text-red-500">
              <XCircle size={13} />
              {resumen.fallidos} fallido
              {resumen.fallidos === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      <Modal
        open={modalNuevo}
        onClose={() => setModalNuevo(false)}
        title={
          <span className="flex items-center gap-2">
            <Database size={18} style={{ color: palette.primary }} />
            Registrar Backup
          </span>
        }
      >
        <form onSubmit={handleCrear} className="space-y-3 text-xs text-slate-600">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Nombre del archivo
            </label>
            <input
              type="text"
              required
              value={form.nombre_archivo}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre_archivo: e.target.value }))
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Ruta de almacenamiento
            </label>
            <input
              type="text"
              required
              value={form.ruta_almacenamiento}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  ruta_almacenamiento: e.target.value,
                }))
              }
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Tipo de backup
              </label>
              <select
                value={form.tipo_backup}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    tipo_backup: e.target.value as TipoBackup,
                  }))
                }
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition"
              >
                {TIPOS_BACKUP.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Hash / checksum
              </label>
              <input
                type="text"
                value={form.hash_checksum}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hash_checksum: e.target.value }))
                }
                placeholder="Opcional"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] transition"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={form.es_automatico}
              onChange={(e) =>
                setForm((f) => ({ ...f, es_automatico: e.target.checked }))
              }
              className="accent-[var(--color-primary)]"
            />
            <span className="font-semibold text-slate-700">
              Backup automático
            </span>
          </label>

          {errorForm && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold">
              <AlertTriangle size={13} />
              {errorForm}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalNuevo(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: palette.primary }}
            >
              {guardando ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}
              Registrar
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={modalDetalle}
        onClose={() => setModalDetalle(false)}
        size="lg"
        title={
          <span className="flex items-center gap-2">
            <Archive size={18} style={{ color: palette.primary }} />
            Detalle del Backup
          </span>
        }
      >
        {detalleCargando ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-xs font-medium">Cargando detalle...</span>
          </div>
        ) : (detalle ?? seleccionado) ? (
          (() => {
            const actual = detalle ?? seleccionado!;
            const colorEst = colorEstado(actual.estado, palette);
            return (
              <div className="space-y-3 text-xs text-slate-600">
                <div
                  className="flex items-center justify-between gap-3 p-4 rounded-xl text-white"
                  style={{
                    background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-11 h-11 rounded-full flex items-center justify-center bg-white/20 border border-white/40 shrink-0">
                      <Archive size={20} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate">
                        {actual.nombre_archivo}
                      </h3>
                      <p className="text-[11px] text-white/80 truncate">
                        {actual.ruta_almacenamiento}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 border border-white/40 shrink-0">
                    {etiquetaEstadoBackup(actual.estado)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Tipo
                    </span>
                    <p className="font-semibold text-slate-800">
                      {actual.tipo_backup}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Estado
                    </span>
                    <p className="font-semibold" style={{ color: colorEst }}>
                      {etiquetaEstadoBackup(actual.estado)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <HardDrive size={11} /> Tamaño
                    </span>
                    <p className="font-semibold text-slate-800">
                      {formatoTamano(actual.tamano_bytes)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <User size={11} /> Ejecutado por
                    </span>
                    <p className="font-semibold text-slate-800 truncate">
                      {nombreEjecutor(actual)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Calendar size={11} /> Inicio
                    </span>
                    <p className="font-semibold text-slate-800">
                      {fechaHora(actual.fecha_inicio)}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Calendar size={11} /> Fin
                    </span>
                    <p className="font-semibold text-slate-800">
                      {fechaHora(actual.fecha_fin)}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <KeyRound size={11} /> Hash / checksum
                  </span>
                  <p className="font-medium text-slate-700 mt-0.5 break-all">
                    {actual.hash_checksum ?? "—"}
                  </p>
                </div>

                {actual.detalle_error && (
                  <div className="p-2.5 bg-red-50 rounded-xl border border-red-200">
                    <span className="text-[10px] font-bold text-red-400 uppercase">
                      Detalle del error
                    </span>
                    <p className="font-semibold text-red-600 mt-0.5">
                      {actual.detalle_error}
                    </p>
                  </div>
                )}

                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Historial del backup
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {detalle?.bitacoras.length ?? 0} registro
                      {(detalle?.bitacoras.length ?? 0) === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="max-h-48 overflow-auto divide-y divide-slate-100">
                    {detalle && detalle.bitacoras.length > 0 ? (
                      detalle.bitacoras.map((entrada) => (
                        <div
                          key={entrada.id_bitacora_backup}
                          className="px-3 py-2 flex items-start justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800">
                              {etiquetaAccionBitacora(entrada.accion)}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {entrada.descripcion ?? "Sin descripción"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {entrada.usuario
                                ? `${entrada.usuario.nombre} ${entrada.usuario.apellido}`
                                : "Sistema"}
                            </p>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {fechaHora(entrada.fecha_evento)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="px-3 py-6 text-center text-slate-400 font-medium">
                        Sin registros de bitácora.
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap justify-end gap-2">
                  {actual.estado !== EstadoBackup.Completado && (
                    <button
                      onClick={() =>
                        handleCambiarEstado(actual, EstadoBackup.Completado)
                      }
                      disabled={cambiandoId === actual.id_backup}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      Completado
                    </button>
                  )}
                  {actual.estado === EstadoBackup.Completado && (
                    <button
                      onClick={() =>
                        handleCambiarEstado(actual, EstadoBackup.Restaurado)
                      }
                      disabled={cambiandoId === actual.id_backup}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition disabled:opacity-50"
                    >
                      <RotateCcw size={14} />
                      Restaurado
                    </button>
                  )}
                  {actual.estado !== EstadoBackup.Fallido && (
                    <button
                      onClick={() => handleCambiarEstado(actual, EstadoBackup.Fallido)}
                      disabled={cambiandoId === actual.id_backup}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 border border-red-200 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      <XCircle size={14} />
                      Fallido
                    </button>
                  )}
                  <button
                    onClick={() => setModalDetalle(false)}
                    className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition"
                    style={{ backgroundColor: palette.primary }}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            );
          })()
        ) : null}
      </Modal>

      <Modal
        open={modalFallido}
        onClose={cerrarModalFallido}
        title={
          <span className="flex items-center gap-2">
            <XCircle size={18} className="text-red-500" />
            Marcar backup como fallido
          </span>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <p className="leading-relaxed">
            {backupFallido ? (
              <>
                ¿Confirmas marcar el backup{" "}
                <strong className="text-slate-800">
                  {backupFallido.nombre_archivo}
                </strong>{" "}
                como <span className="font-bold text-red-600">fallido</span>?
              </>
            ) : (
              "¿Confirmas marcar el backup como fallido?"
            )}
          </p>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Motivo del fallo (opcional)
            </label>
            <textarea
              value={motivoFallo}
              onChange={(e) => setMotivoFallo(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Describe qué ocurrió durante el backup..."
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] transition resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={cerrarModalFallido}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 border border-slate-200 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarFallido}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm bg-red-500 hover:bg-red-600 transition"
            >
              <XCircle size={14} />
              Marcar como fallido
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
