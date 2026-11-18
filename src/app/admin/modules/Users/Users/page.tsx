"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { Toast, type ToastTipo } from "@/src/components/ui/Toast";
import { fechaCorta } from "@/src/services/animals/animal-format";
import {
  eliminarUsuario,
  obtenerUsuarios,
} from "@/src/services/users/user-client";
import { DESCRIPCIONES_ROL, type UsuarioPublico } from "@/src/types/usuario";
import { ROLES_USUARIO } from "@/src/types/enums";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Loader2,
  Mail,
  Phone,
  Plus,
  Shield,
  Trash2,
  UserCheck,
  Users,
  Filter,
  X,
  Calendar,
} from "lucide-react";

export default function UsuariosPage() {
  const { palette } = useTheme();

  const [usuarios, setUsuarios] = useState<UsuarioPublico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [confirmacion, setConfirmacion] = useState<UsuarioPublico | null>(null);
  const [toast, setToast] = useState<{
    tipo: ToastTipo;
    mensaje: string;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<UsuarioPublico | null>(null);

  // --- Filtros avanzados ---
  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<
    "todos" | "activos" | "inactivos"
  >("todos");
  const [ordenamiento, setOrdenamiento] = useState<
    "recientes" | "antiguos" | "alfabetico"
  >("recientes");

  const itemsPerPage = 8;

  const colorRol = (rol: UsuarioPublico["rol"]) => {
    switch (rol) {
      case "Administrador":
        return palette.primary;
      case "Veterinario":
        return palette.secondary;
      case "Recepcionista":
        return palette.muted;
      default:
        return palette.accent;
    }
  };

  const cargarUsuarios = async () => {
    try {
      const data = await obtenerUsuarios();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los usuarios.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerUsuarios()
      .then((data) => {
        if (cancelado) return;
        setUsuarios(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los usuarios.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const filtrosActivos = useMemo(() => {
    let n = 0;
    if (filtroRol) n++;
    if (filtroEstado !== "todos") n++;
    if (ordenamiento !== "recientes") n++; // Solo cuenta si no es el default
    return n;
  }, [filtroRol, filtroEstado, ordenamiento]);

  const limpiarFiltros = () => {
    setFiltroRol("");
    setFiltroEstado("todos");
    setOrdenamiento("recientes");
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    let result = usuarios.filter((item) => {
      const texto = searchTerm.toLowerCase();
      const coincideTexto =
        !texto ||
        item.nombre.toLowerCase().includes(texto) ||
        item.apellido.toLowerCase().includes(texto) ||
        item.email.toLowerCase().includes(texto) ||
        (item.telefono ?? "").toLowerCase().includes(texto);

      const coincideRol = !filtroRol || item.rol === filtroRol;

      const coincideEstado =
        filtroEstado === "todos" ||
        (filtroEstado === "activos" && item.activo) ||
        (filtroEstado === "inactivos" && !item.activo);

      return coincideTexto && coincideRol && coincideEstado;
    });

    // Aplicar ordenamiento
    result.sort((a, b) => {
      if (ordenamiento === "alfabetico") {
        return `${a.nombre} ${a.apellido}`.localeCompare(
          `${b.nombre} ${b.apellido}`,
        );
      }

      // Usamos fallback a 0 si la fecha es null o undefined
      const dateA = a.creado_en ? new Date(a.creado_en).getTime() : 0;
      const dateB = b.creado_en ? new Date(b.creado_en).getTime() : 0;

      if (ordenamiento === "recientes") {
        return dateB - dateA; // Mayor a menor
      } else {
        return dateA - dateB; // Menor a mayor
      }
    });

    return result;
  }, [usuarios, searchTerm, filtroRol, filtroEstado, ordenamiento]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleVerDetalle = (usuario: UsuarioPublico) => {
    setUsuarioSeleccionado(usuario);
    setModalOpen(true);
  };

  const handleEliminar = (usuario: UsuarioPublico) => {
    setConfirmacion(usuario);
  };

  const confirmarEliminacion = async () => {
    if (!confirmacion) return;

    const nombre = `${confirmacion.nombre} ${confirmacion.apellido}`;
    setEliminandoId(confirmacion.id_usuario);
    setError(null);
    try {
      await eliminarUsuario(confirmacion.id_usuario);
      setConfirmacion(null);
      setToast({
        tipo: "success",
        mensaje: `El usuario "${nombre}" se eliminó correctamente.`,
      });
      await cargarUsuarios();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo eliminar el usuario.";
      setError(mensaje);
      setToast({
        tipo: "error",
        mensaje,
      });
    } finally {
      setEliminandoId(null);
    }
  };

  const exportarCSV = () => {
    const filas = [
      ["Nombre", "Apellido", "Email", "Teléfono", "Rol", "Activo", "Alta"],
      ...filteredData.map((u) => [
        u.nombre,
        u.apellido,
        u.email,
        u.telefono ?? "—",
        u.rol,
        u.activo ? "Sí" : "No",
        fechaCorta(u.creado_en),
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registro_usuarios.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="anim-fade-in h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="anim-fade-up delay-1 h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Gestión de{" "}
              <span style={{ color: palette.primary }}>Usuarios</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mostrando{" "}
              <span className="font-bold text-slate-700">
                {filteredData.length}
              </span>{" "}
              de {usuarios.length} usuarios
              {filtrosActivos > 0 && (
                <span
                  style={{ color: palette.primary }}
                  className="font-semibold ml-1"
                >
                  · {filtrosActivos} filtro{filtrosActivos > 1 ? "s" : ""}{" "}
                  activo{filtrosActivos > 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={<Download size={15} />}
              onClick={exportarCSV}
            >
              Exportar
            </Button>
            <Link href="/admin/modules/Users/Users/Form">
              <Button icon={<Plus size={16} />}>Nuevo Usuario</Button>
            </Link>
          </div>
        </div>

        {/* Buscador */}
        <div className="anim-fade-up delay-2 my-4 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre, email o teléfono..."
          />
        </div>

        {/* Panel de Filtros */}
        <div className="anim-fade-up delay-3 mb-3 shrink-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Filter size={12} />
              Filtros y Ordenamiento
              {filtrosActivos > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black text-white"
                  style={{ backgroundColor: palette.primary }}
                >
                  {filtrosActivos}
                </span>
              )}
            </span>

            {filtrosActivos > 0 && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="anim-press inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition"
                title="Limpiar filtros"
              >
                <X size={12} />
                Limpiar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Rol */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Rol
              </label>
              <select
                value={filtroRol}
                onChange={(e) => {
                  setFiltroRol(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="">Todos los roles</option>
                {ROLES_USUARIO.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Estado de la Cuenta
              </label>
              <select
                value={filtroEstado}
                onChange={(e) => {
                  setFiltroEstado(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="todos">Todos</option>
                <option value="activos">Solo Activos</option>
                <option value="inactivos">Solo Inactivos</option>
              </select>
            </div>

            {/* Ordenamiento */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                Ordenar por
              </label>
              <select
                value={ordenamiento}
                onChange={(e) => {
                  setOrdenamiento(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
              >
                <option value="recientes">Más recientes primero</option>
                <option value="antiguos">Más antiguos primero</option>
                <option value="alfabetico">Alfabético (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Tabla */}
        <div className="anim-fade-up delay-4 flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {cargando ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-xs font-medium">
                  Cargando usuarios...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Contacto</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Alta</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item) => (
                    <tr
                      key={item.id_usuario}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-full flex items-center justify-center border text-xs font-bold shrink-0"
                            style={{
                              color: colorRol(item.rol),
                              backgroundColor: `${colorRol(item.rol)}12`,
                              borderColor: `${colorRol(item.rol)}30`,
                            }}
                          >
                            {item.nombre.charAt(0)}
                            {item.apellido.charAt(0)}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">
                              {item.nombre} {item.apellido}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                          style={{
                            color: colorRol(item.rol),
                            backgroundColor: `${colorRol(item.rol)}10`,
                            borderColor: `${colorRol(item.rol)}30`,
                          }}
                        >
                          <Shield size={11} />
                          {item.rol.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 font-medium">
                            <Mail size={11} className="text-slate-400" />
                            {item.email}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Phone size={11} />
                            {item.telefono ?? "—"}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-2.5">
                        {item.activo ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Inactivo
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        {fechaCorta(item.creado_en)}
                      </td>

                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleVerDetalle(item)}
                            className="anim-press p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
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
                            title="Previsualizar usuario"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Users/Users/Form?id=${item.id_usuario}`}
                            className="anim-press p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                palette.secondary;
                              e.currentTarget.style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color = "#64748b";
                            }}
                            title="Editar usuario"
                          >
                            <Edit size={15} />
                          </Link>

                          <button
                            onClick={() => handleEliminar(item)}
                            disabled={eliminandoId === item.id_usuario}
                            className="anim-press p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Eliminar usuario"
                          >
                            {eliminandoId === item.id_usuario ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!cargando && paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-slate-400 font-medium"
                      >
                        {filtrosActivos > 0 || searchTerm
                          ? "No se encontraron usuarios con los filtros aplicados."
                          : "No se encontraron usuarios."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Paginación */}
        <div className="anim-fade-up delay-5 pt-4 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>
            mostrando {filteredData.length > 0 ? startIndex + 1 : 0}-
            {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
            {filteredData.length} registros
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="anim-press p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-bold text-slate-700">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="anim-press p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Previsualización (3 Columnas) */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="xl"
        title={
          <span className="flex items-center gap-2">
            <UserCheck size={18} style={{ color: palette.primary }} />
            Perfil del Usuario
          </span>
        }
      >
        {usuarioSeleccionado && (
          <div className="space-y-5 text-xs text-slate-600 w-full">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span
                className="w-14 h-14 rounded-full flex items-center justify-center border-2 text-lg font-black shadow-sm shrink-0 bg-white"
                style={{
                  color: colorRol(usuarioSeleccionado.rol),
                  borderColor: `${colorRol(usuarioSeleccionado.rol)}40`,
                }}
              >
                {usuarioSeleccionado.nombre.charAt(0)}
                {usuarioSeleccionado.apellido.charAt(0)}
              </span>
              <div className="min-w-0">
                <h3 className="font-bold text-lg text-slate-800 truncate">
                  {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                </h3>
                <p
                  className="text-xs font-bold mt-0.5 flex items-center gap-1"
                  style={{ color: colorRol(usuarioSeleccionado.rol) }}
                >
                  <Shield size={12} />
                  {usuarioSeleccionado.rol.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            {/* Grid de 3 Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Fila 1 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Mail size={12} /> Correo
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {usuarioSeleccionado.email}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone size={12} /> Teléfono
                </span>
                <p className="font-semibold text-slate-800">
                  {usuarioSeleccionado.telefono ?? "—"}
                </p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <UserCheck size={12} /> Estado
                </span>
                <p className="font-semibold text-slate-800">
                  {usuarioSeleccionado.activo ? (
                    <span className="text-emerald-600">Activo</span>
                  ) : (
                    <span className="text-slate-500">Inactivo</span>
                  )}
                </p>
              </div>

              {/* Fila 2 */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center md:col-span-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Fecha de Alta
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(usuarioSeleccionado.creado_en)}
                </p>
              </div>

              {/* Alcance del Rol (Ancho completo) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 md:col-span-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Users size={14} /> Alcance del Rol
                </span>
                <p className="font-semibold text-slate-800">
                  {DESCRIPCIONES_ROL[usuarioSeleccionado.rol]}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="anim-press px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-sm transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: palette.primary }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmacion !== null}
        title="Eliminar usuario"
        description={
          confirmacion
            ? `¿Estás seguro de eliminar al usuario "${confirmacion.nombre} ${confirmacion.apellido}"? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar usuario"
        loading={eliminandoId === confirmacion?.id_usuario}
        onConfirm={confirmarEliminacion}
        onCancel={() => setConfirmacion(null)}
      />

      <Toast
        open={toast !== null}
        message={toast?.mensaje ?? ""}
        type={toast?.tipo ?? "success"}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
