"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput, SelectFilter } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
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
} from "lucide-react";

export default function UsuariosPage() {
  const { palette } = useTheme();

  const [usuarios, setUsuarios] = useState<UsuarioPublico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [rolFiltro, setRolFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] =
    useState<UsuarioPublico | null>(null);

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
        err instanceof Error ? err.message : "No se pudieron cargar los usuarios.",
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

  const filteredData = usuarios.filter((item) => {
    const texto = searchTerm.toLowerCase();
    const coincideTexto =
      item.nombre.toLowerCase().includes(texto) ||
      item.apellido.toLowerCase().includes(texto) ||
      item.email.toLowerCase().includes(texto) ||
      (item.telefono ?? "").toLowerCase().includes(texto);
    const coincideRol = !rolFiltro || item.rol === rolFiltro;
    return coincideTexto && coincideRol;
  });

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

  const handleEliminar = async (usuario: UsuarioPublico) => {
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar al usuario "${usuario.nombre} ${usuario.apellido}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setEliminandoId(usuario.id_usuario);
    setError(null);
    try {
      await eliminarUsuario(usuario.id_usuario);
      await cargarUsuarios();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el usuario.",
      );
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
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Gestión de{" "}
              <span style={{ color: palette.primary }}>Usuarios</span>
            </h1>
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

        <div className="flex items-center gap-3 my-4 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por nombre, email o teléfono..."
          />
          <SelectFilter
            label="Rol"
            value={rolFiltro}
            onChange={(e) => {
              setRolFiltro(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: "Todos", value: "" },
              ...ROLES_USUARIO.map((rol) => ({ label: rol, value: rol })),
            ]}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        <div className="flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
          {cargando ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando usuarios...</span>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/95 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
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
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              palette.primary;
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#64748b";
                          }}
                          title="Previsualizar usuario"
                        >
                          <Eye size={15} />
                        </button>

                        <Link
                          href={`/admin/modules/Users/Users/Form?id=${item.id_usuario}`}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              palette.secondary;
                            e.currentTarget.style.color = "#ffffff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "#64748b";
                          }}
                          title="Editar usuario"
                        >
                          <Edit size={15} />
                        </Link>

                        <button
                          onClick={() => handleEliminar(item)}
                          disabled={eliminandoId === item.id_usuario}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
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
                      No se encontraron usuarios.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>
            mostrando {filteredData.length > 0 ? startIndex + 1 : 0}-
            {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
            {filteredData.length} registros
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-bold text-slate-700">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <UserCheck size={18} style={{ color: palette.primary }} />
            Perfil del Usuario
          </span>
        }
      >
        {usuarioSeleccionado && (
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center border text-sm font-bold shadow-xs"
                style={{
                  color: colorRol(usuarioSeleccionado.rol),
                  backgroundColor: `${colorRol(usuarioSeleccionado.rol)}12`,
                  borderColor: `${colorRol(usuarioSeleccionado.rol)}30`,
                }}
              >
                {usuarioSeleccionado.nombre.charAt(0)}
                {usuarioSeleccionado.apellido.charAt(0)}
              </span>
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {usuarioSeleccionado.rol.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Correo Electrónico
                </span>
                <p className="font-semibold text-slate-800 break-all">
                  {usuarioSeleccionado.email}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Teléfono
                </span>
                <p className="font-semibold text-slate-800">
                  {usuarioSeleccionado.telefono ?? "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Estado
                </span>
                <p className="font-semibold text-slate-800">
                  {usuarioSeleccionado.activo ? "Activo" : "Inactivo"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Fecha de Alta
                </span>
                <p className="font-semibold text-slate-800">
                  {fechaCorta(usuarioSeleccionado.creado_en)}
                </p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Users size={12} /> Alcance del Rol
              </span>
              <p className="font-semibold text-slate-800 mt-0.5">
                {DESCRIPCIONES_ROL[usuarioSeleccionado.rol]}
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
