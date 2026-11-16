"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTheme, type Palette } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput, SelectFilter } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import {
  obtenerAccesos,
  type AccesoConUsuario,
} from "@/src/services/security/security-client";
import {
  etiquetaEvento,
  fechaHora,
} from "@/src/services/security/security-format";
import { TIPOS_EVENTO_ACCESO, type TipoEventoAcceso } from "@/src/types/enums";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  Eye,
  Globe,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldAlert,
  SlidersHorizontal,
  User,
  X,
  XCircle,
} from "lucide-react";

function colorEvento(evento: TipoEventoAcceso, palette: Palette): string {
  switch (evento) {
    case "Login":
      return "#10b981";
    case "Logout":
      return palette.muted;
    case "Login_Fallido":
      return "#ef4444";
    case "Bloqueo_Cuenta":
      return "#f59e0b";
    case "Cambio_Password":
      return palette.secondary;
    default:
      return palette.muted;
  }
}

function nombreUsuario(acceso: AccesoConUsuario): string {
  return acceso.usuario
    ? `${acceso.usuario.nombre} ${acceso.usuario.apellido}`.trim()
    : "Usuario no registrado";
}

function correoUsuario(acceso: AccesoConUsuario): string {
  return acceso.usuario?.email ?? acceso.email_intentado ?? "—";
}

export default function AccesosSistemaPage() {
  const { palette } = useTheme();

  const [accesos, setAccesos] = useState<AccesoConUsuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [resultado, setResultado] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [recarga, setRecarga] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [accesoSeleccionado, setAccesoSeleccionado] =
    useState<AccesoConUsuario | null>(null);

  useEffect(() => {
    let cancelado = false;

    const pedirDatos = () => {
      setCargando(true);
      obtenerAccesos({
        desde: desde || null,
        hasta: hasta || null,
        id_usuario: null,
        tipo_evento: tipoEvento ? (tipoEvento as TipoEventoAcceso) : null,
        exito: resultado === "" ? null : resultado === "true",
        busqueda: busqueda.trim() || null,
        limite: 500,
      })
        .then((data) => {
          if (cancelado) return;
          setAccesos(data);
          setError(null);
        })
        .catch((err) => {
          if (cancelado) return;
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar la bitácora de accesos.",
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
  }, [busqueda, tipoEvento, resultado, desde, hasta, recarga]);

  const resumen = useMemo(() => {
    const exitosos = accesos.filter((a) => a.exito).length;
    return {
      total: accesos.length,
      exitosos,
      fallidos: accesos.length - exitosos,
    };
  }, [accesos]);

  const hayFiltros = Boolean(
    busqueda || tipoEvento || resultado || desde || hasta,
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setTipoEvento("");
    setResultado("");
    setDesde("");
    setHasta("");
  };

  const handleVerDetalle = (acceso: AccesoConUsuario) => {
    setAccesoSeleccionado(acceso);
    setModalOpen(true);
  };

  const exportarCSV = () => {
    const filas = [
      [
        "Fecha",
        "Usuario",
        "Correo",
        "Evento",
        "Resultado",
        "IP",
        "Detalle",
        "Navegador",
      ],
      ...accesos.map((a) => [
        fechaHora(a.fecha_evento),
        a.usuario ? nombreUsuario(a) : "",
        correoUsuario(a),
        etiquetaEvento(a.tipo_evento),
        a.exito ? "Correcto" : "Fallido",
        a.ip_origen ?? "",
        `"${(a.detalle ?? "").replace(/"/g, '""')}"`,
        `"${(a.user_agent ?? "").replace(/"/g, '""')}"`,
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bitacora_accesos.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between shrink-0 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Bitácora de{" "}
              <span style={{ color: palette.primary }}>Accesos</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro de ingresos, salidas e intentos de autenticación.
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
            placeholder="Buscar por usuario, correo, IP o detalle..."
          />

          <SelectFilter
            label="Evento"
            value={tipoEvento}
            onChange={(e) => setTipoEvento(e.target.value)}
            options={[
              { label: "Todos", value: "" },
              ...TIPOS_EVENTO_ACCESO.map((evento) => ({
                label: etiquetaEvento(evento as TipoEventoAcceso),
                value: evento,
              })),
            ]}
          />

          <SelectFilter
            label="Resultado"
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            options={[
              { label: "Todos", value: "" },
              { label: "Correctos", value: "true" },
              { label: "Fallidos", value: "false" },
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
              <span className="text-xs font-medium">
                Cargando bitácora de accesos...
              </span>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <table className="w-full min-w-[980px] text-left text-xs text-slate-600">
                <thead className="sticky top-0 z-10 bg-slate-50/95 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Evento</th>
                    <th className="px-4 py-3">Resultado</th>
                    <th className="px-4 py-3">IP de origen</th>
                    <th className="px-4 py-3">Fecha y hora</th>
                    <th className="px-4 py-3">Detalle</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accesos.map((item) => {
                    const color = colorEvento(item.tipo_evento, palette);
                    const iniciales = item.usuario
                      ? `${item.usuario.nombre.charAt(0)}${item.usuario.apellido.charAt(0)}`.toUpperCase()
                      : null;

                    return (
                      <tr
                        key={item.id_acceso}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-3">
                            <span
                              className="w-9 h-9 rounded-full flex items-center justify-center border text-xs font-bold shrink-0"
                              style={{
                                color,
                                backgroundColor: `${color}12`,
                                borderColor: `${color}30`,
                              }}
                            >
                              {iniciales ?? <KeyRound size={15} />}
                            </span>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 truncate">
                                {nombreUsuario(item)}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium truncate">
                                {correoUsuario(item)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-2.5">
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border whitespace-nowrap"
                            style={{
                              color,
                              backgroundColor: `${color}12`,
                              borderColor: `${color}30`,
                            }}
                          >
                            {etiquetaEvento(item.tipo_evento)}
                          </span>
                        </td>

                        <td className="px-4 py-2.5">
                          {item.exito ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <CheckCircle2 size={11} />
                              Correcto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">
                              <XCircle size={11} />
                              Fallido
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                            <Globe size={11} className="text-slate-400" />
                            {item.ip_origen ?? "—"}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 font-medium text-slate-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={11} className="text-slate-400" />
                            {fechaHora(item.fecha_evento)}
                          </span>
                        </td>

                        <td className="px-4 py-2.5 font-medium text-slate-500 max-w-[220px] truncate">
                          {item.detalle ?? "—"}
                        </td>

                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleVerDetalle(item)}
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
                            title="Ver detalle del acceso"
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {!cargando && accesos.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-12 text-center text-slate-400 font-medium"
                      >
                        No se encontraron accesos con los filtros seleccionados.
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
              {resumen.exitosos} correcto
              {resumen.exitosos === 1 ? "" : "s"}
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
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={
          <span className="flex items-center gap-2">
            <ShieldAlert size={18} style={{ color: palette.primary }} />
            Detalle del Acceso
          </span>
        }
      >
        {accesoSeleccionado && (
          <div className="space-y-3 text-xs text-slate-600">
            <div
              className="flex items-center justify-between gap-3 p-4 rounded-xl text-white"
              style={{
                background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})`,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-11 h-11 rounded-full flex items-center justify-center bg-white/20 border border-white/40 shrink-0">
                  <User size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">
                    {nombreUsuario(accesoSeleccionado)}
                  </h3>
                  <p className="text-[11px] text-white/80 truncate">
                    {correoUsuario(accesoSeleccionado)}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/20 border border-white/40 shrink-0">
                {etiquetaEvento(accesoSeleccionado.tipo_evento)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <CheckCircle2 size={11} /> Resultado
                </span>
                <p
                  className={`font-semibold ${
                    accesoSeleccionado.exito
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {accesoSeleccionado.exito
                    ? "Acceso correcto"
                    : "Acceso fallido"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Calendar size={11} /> Fecha y hora
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaHora(accesoSeleccionado.fecha_evento)}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <Globe size={11} /> IP de origen
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {accesoSeleccionado.ip_origen ?? "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <User size={11} /> Correo intentado
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {accesoSeleccionado.email_intentado ?? "—"}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Detalle
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {accesoSeleccionado.detalle ?? "Sin detalle registrado."}
              </p>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Navegador / User Agent
              </span>
              <p className="font-medium text-slate-700 mt-0.5 break-all">
                {accesoSeleccionado.user_agent ?? "—"}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition"
                style={{ backgroundColor: palette.primary }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
