"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { TabsSwitcher } from "@/src/components/ui/TabsSwitcher";
import { Modal } from "@/src/components/ui/Modal";

import {
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type Taxonomia = {
  id_taxonomia: number;
  nombre_clase: string;
  _count?: { especies: number };
};

type Especie = {
  id_especie: number;
  nombre_comun: string;
  es_domestico: boolean | null;
  creado_en: string | null;
  id_taxonomia: number;
  taxonomia: { nombre_clase: string };
  _count?: { animales: number };
};

type ModoModal = "crear" | "editar";

async function obtenerClasificaciones(): Promise<{
  especies: Especie[];
  taxonomias: Taxonomia[];
}> {
  const [resEspecies, resTaxonomias] = await Promise.all([
    fetch("/api/admin/classifications/species"),
    fetch("/api/admin/classifications/taxonomies"),
  ]);

  if (!resEspecies.ok || !resTaxonomias.ok) {
    throw new Error("No se pudieron cargar los datos.");
  }

  const dataEspecies = await resEspecies.json();
  const dataTaxonomias = await resTaxonomias.json();

  return {
    especies: dataEspecies.especies ?? [],
    taxonomias: dataTaxonomias.taxonomias ?? [],
  };
}

export default function ClasificacionesPage() {
  const { palette } = useTheme();

  const [activeTab, setActiveTab] = useState<"especies" | "taxonomias">(
    "especies",
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [taxonomiaFilter, setTaxonomiaFilter] = useState("todas");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [especies, setEspecies] = useState<Especie[]>([]);
  const [taxonomias, setTaxonomias] = useState<Taxonomia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    tipo: "especie" | "taxonomia";
    modo: ModoModal;
    id?: number;
  } | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formTaxonomia, setFormTaxonomia] = useState("");
  const [formDomestico, setFormDomestico] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [detalle, setDetalle] = useState<{
    titulo: string;
    filas: [string, string][];
  } | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      const data = await obtenerClasificaciones();
      setEspecies(data.especies);
      setTaxonomias(data.taxonomias);
      setError(null);
    } catch {
      setError("Error al cargar las clasificaciones. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let cancelado = false;
    obtenerClasificaciones()
      .then((data) => {
        if (cancelado) return;
        setEspecies(data.especies);
        setTaxonomias(data.taxonomias);
        setError(null);
      })
      .catch(() => {
        if (cancelado) return;
        setError("Error al cargar las clasificaciones. Intenta de nuevo.");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const abrirModal = (
    tipo: "especie" | "taxonomia",
    modo: ModoModal,
    id?: number,
  ) => {
    setError(null);
    setModal({ tipo, modo, id });
    setFormNombre("");
    setFormTaxonomia("");
    setFormDomestico(true);

    if (modo === "editar" && id !== undefined) {
      if (tipo === "especie") {
        const especie = especies.find((e) => e.id_especie === id);
        if (especie) {
          setFormNombre(especie.nombre_comun);
          setFormTaxonomia(String(especie.id_taxonomia));
          setFormDomestico(especie.es_domestico !== false);
        }
      } else {
        const taxonomia = taxonomias.find((t) => t.id_taxonomia === id);
        if (taxonomia) setFormNombre(taxonomia.nombre_clase);
      }
    }
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal) return;

    setGuardando(true);
    setError(null);

    try {
      const esTaxonomia = modal.tipo === "taxonomia";
      const url = esTaxonomia
        ? modal.modo === "crear"
          ? "/api/admin/classifications/taxonomies"
          : `/api/admin/classifications/taxonomies/${modal.id}`
        : modal.modo === "crear"
          ? "/api/admin/classifications/species"
          : `/api/admin/classifications/species/${modal.id}`;

      const payload = esTaxonomia
        ? { nombre_clase: formNombre }
        : {
            nombre_comun: formNombre,
            id_taxonomia: Number(formTaxonomia),
            es_domestico: formDomestico,
          };

      const res = await fetch(url, {
        method: modal.modo === "crear" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el registro.");
        return;
      }

      setModal(null);
      await cargarDatos();
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (
    tipo: "especie" | "taxonomia",
    id: number,
    nombre: string,
  ) => {
    if (
      !window.confirm(
        `¿Seguro que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    setError(null);
    try {
      const url =
        tipo === "especie"
          ? `/api/admin/classifications/species/${id}`
          : `/api/admin/classifications/taxonomies/${id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "No se pudo eliminar el registro.");
        return;
      }

      await cargarDatos();
    } catch {
      setError("Error de conexión con el servidor.");
    }
  };

  const exportarCSV = () => {
    const filas =
      activeTab === "especies"
        ? [
            ["ID", "Nombre común", "Taxonomía", "Tipo", "Animales"],
            ...filtradasEspecies.map((e) => [
              String(e.id_especie),
              e.nombre_comun,
              e.taxonomia.nombre_clase,
              e.es_domestico ? "Doméstico" : "Silvestre",
              String(e._count?.animales ?? 0),
            ]),
          ]
        : [
            ["ID", "Clase", "Especies"],
            ...filtradasTaxonomias.map((t) => [
              String(t.id_taxonomia),
              t.nombre_clase,
              String(t._count?.especies ?? 0),
            ]),
          ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clasificaciones_${activeTab}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const verDetalleEspecie = (item: Especie) => {
    setDetalle({
      titulo: item.nombre_comun,
      filas: [
        ["Taxonomía", item.taxonomia.nombre_clase],
        ["Tipo", item.es_domestico !== false ? "Doméstico" : "Silvestre"],
        ["Animales registrados", String(item._count?.animales ?? 0)],
        [
          "Creado",
          item.creado_en
            ? new Date(item.creado_en).toLocaleDateString("es-ES")
            : "—",
        ],
      ],
    });
  };

  const verDetalleTaxonomia = (item: Taxonomia) => {
    setDetalle({
      titulo: item.nombre_clase,
      filas: [
        ["Clase", item.nombre_clase],
        ["Especies asociadas", String(item._count?.especies ?? 0)],
      ],
    });
  };

  const descargarArchivo = (nombre: string, contenido: string, tipo: string) => {
    const blob = new Blob([contenido], { type: `${tipo};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFichaEspecie = (item: Especie) => {
    const contenido = [
      "FICHA DE ESPECIE - AnimalSmile",
      "".padEnd(40, "="),
      `Nombre común: ${item.nombre_comun}`,
      `Taxonomía: ${item.taxonomia.nombre_clase}`,
      `Tipo: ${item.es_domestico !== false ? "Doméstico" : "Silvestre"}`,
      `Animales registrados: ${item._count?.animales ?? 0}`,
      `Creado: ${
        item.creado_en
          ? new Date(item.creado_en).toLocaleDateString("es-ES")
          : "—"
      }`,
    ].join("\n");
    descargarArchivo(
      `ficha_especie_${item.id_especie}.txt`,
      contenido,
      "text/plain",
    );
  };

  const descargarFichaTaxonomia = (item: Taxonomia) => {
    const contenido = [
      "FICHA DE TAXONOMÍA - AnimalSmile",
      "".padEnd(40, "="),
      `Clase: ${item.nombre_clase}`,
      `Especies asociadas: ${item._count?.especies ?? 0}`,
    ].join("\n");
    descargarArchivo(
      `ficha_taxonomia_${item.id_taxonomia}.txt`,
      contenido,
      "text/plain",
    );
  };

  const filtradasEspecies = especies.filter((item) => {
    const coincideBusqueda = item.nombre_comun
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const coincideTaxonomia =
      taxonomiaFilter === "todas" ||
      String(item.id_taxonomia) === taxonomiaFilter;
    return coincideBusqueda && coincideTaxonomia;
  });

  const filtradasTaxonomias = taxonomias.filter((item) =>
    item.nombre_clase.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const datosFiltrados =
    activeTab === "especies" ? filtradasEspecies.length : filtradasTaxonomias.length;
  const totalPages = Math.ceil(datosFiltrados / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginaEspecies = filtradasEspecies.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  const paginaTaxonomias = filtradasTaxonomias.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const cambiarTab = (tab: "especies" | "taxonomias") => {
    setActiveTab(tab);
    setSearchTerm("");
    setTaxonomiaFilter("todas");
    setCurrentPage(1);
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* 1. Cabecera */}
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            Clasificaciones
          </h1>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon={<Download size={15} />}
              onClick={exportarCSV}
            >
              Exportar CSV
            </Button>
            <Button
              icon={<Plus size={16} />}
              onClick={() =>
                abrirModal(
                  activeTab === "especies" ? "especie" : "taxonomia",
                  "crear",
                )
              }
            >
              Agregar
            </Button>
          </div>
        </div>

        {/* 2. Filtros y Tabs */}
        <div className="flex flex-col gap-3 my-4 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Buscador por nombre..."
            />

            {activeTab === "especies" && (
              <div className="relative inline-flex items-center">
                <div className="absolute left-3 pointer-events-none text-slate-400">
                  <Filter size={14} style={{ color: palette.secondary }} />
                </div>
                <select
                  value={taxonomiaFilter}
                  onChange={(e) => {
                    setTaxonomiaFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 pr-8 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none transition-all duration-200 hover:border-slate-300 appearance-none"
                  style={{
                    borderColor:
                      taxonomiaFilter !== "todas" ? palette.primary : undefined,
                  }}
                >
                  <option value="todas">Taxonomía: Todas</option>
                  {taxonomias.map((t) => (
                    <option
                      key={t.id_taxonomia}
                      value={String(t.id_taxonomia)}
                    >
                      {t.nombre_clase}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none text-slate-400 text-[10px]">
                  ▼
                </div>
              </div>
            )}
          </div>

          <TabsSwitcher activeTab={activeTab} onChange={cambiarTab} />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* 3. Tabla */}
        <div className="flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {cargando ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-xs font-medium">
                  Cargando clasificaciones...
                </span>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                  {activeTab === "especies" ? (
                    <tr>
                      <th className="px-4 py-3">Nombre Común</th>
                      <th className="px-4 py-3">Taxonomía</th>
                      <th className="px-4 py-3">Tipo</th>
                      <th className="px-4 py-3">Animales</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3">Clase</th>
                      <th className="px-4 py-3">Especies</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeTab === "especies" &&
                    paginaEspecies.map((item) => (
                      <tr
                        key={item.id_especie}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {item.nombre_comun}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">
                          {item.taxonomia.nombre_clase}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            {item.es_domestico !== false
                              ? "Doméstico"
                              : "Silvestre"}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">
                          {item._count?.animales ?? 0}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => verDetalleEspecie(item)}
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
                              title="Ver detalle"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() =>
                                abrirModal("especie", "editar", item.id_especie)
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
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
                              title="Editar registro"
                            >
                              <Edit size={15} />
                            </button>

                            <button
                              onClick={() => descargarFichaEspecie(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  palette.dark;
                                e.currentTarget.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color = "#64748b";
                              }}
                              title="Descargar ficha"
                            >
                              <Download size={15} />
                            </button>

                            <button
                              onClick={() =>
                                eliminar(
                                  "especie",
                                  item.id_especie,
                                  item.nombre_comun,
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs"
                              title="Eliminar registro"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {activeTab === "taxonomias" &&
                    paginaTaxonomias.map((item) => (
                      <tr
                        key={item.id_taxonomia}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {item.nombre_clase}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-600">
                          {item._count?.especies ?? 0}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => verDetalleTaxonomia(item)}
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
                              title="Ver detalle"
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              onClick={() =>
                                abrirModal(
                                  "taxonomia",
                                  "editar",
                                  item.id_taxonomia,
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
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
                              title="Editar registro"
                            >
                              <Edit size={15} />
                            </button>

                            <button
                              onClick={() => descargarFichaTaxonomia(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  palette.dark;
                                e.currentTarget.style.color = "#ffffff";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                                e.currentTarget.style.color = "#64748b";
                              }}
                              title="Descargar ficha"
                            >
                              <Download size={15} />
                            </button>

                            <button
                              onClick={() =>
                                eliminar(
                                  "taxonomia",
                                  item.id_taxonomia,
                                  item.nombre_clase,
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs"
                              title="Eliminar registro"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {(activeTab === "especies"
                    ? paginaEspecies.length === 0
                    : paginaTaxonomias.length === 0) && (
                    <tr>
                      <td
                        colSpan={activeTab === "especies" ? 5 : 3}
                        className="px-4 py-12 text-center text-slate-400 font-medium"
                      >
                        No se encontraron registros de{" "}
                        {activeTab === "especies" ? "especies" : "taxonomías"}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 4. Paginación */}
        <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
          <span>
            mostrando {datosFiltrados > 0 ? startIndex + 1 : 0}-
            {Math.min(startIndex + itemsPerPage, datosFiltrados)} de{" "}
            {datosFiltrados} registros
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

      {/* Modal Crear / Editar */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={
          modal
            ? `${modal.modo === "crear" ? "Agregar" : "Editar"} ${
                modal.tipo === "especie" ? "especie" : "taxonomía"
              }`
            : ""
        }
      >
        {modal && (
        <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  {modal.tipo === "especie" ? "Nombre común" : "Nombre de la clase"}
                </label>
                <input
                  type="text"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  required
                  autoFocus
                  placeholder={
                    modal.tipo === "especie"
                      ? "Ej. Perro doméstico"
                      : "Ej. Mammalia"
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-slate-400 transition"
                />
              </div>

              {modal.tipo === "especie" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Taxonomía
                    </label>
                    <select
                      value={formTaxonomia}
                      onChange={(e) => setFormTaxonomia(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-slate-400 transition"
                    >
                      <option value="">Selecciona una taxonomía...</option>
                      {taxonomias.map((t) => (
                        <option
                          key={t.id_taxonomia}
                          value={String(t.id_taxonomia)}
                        >
                          {t.nombre_clase}
                        </option>
                      ))}
                    </select>
                    {taxonomias.length === 0 && (
                      <p className="text-[11px] text-amber-600 mt-1 font-medium">
                        No hay taxonomías registradas. Crea una primero en la
                        pestaña de Taxonomía.
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formDomestico}
                      onChange={(e) => setFormDomestico(e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    Especie doméstica
                  </label>
                </>
              )}

              <button
                type="submit"
                disabled={guardando}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition hover:opacity-95 disabled:opacity-60"
                style={{ backgroundColor: palette.primary }}
              >
                {guardando && <Loader2 size={14} className="animate-spin" />}
                {modal.modo === "crear" ? "Crear registro" : "Guardar cambios"}
              </button>
            </form>
        )}
      </Modal>

      {/* Modal de detalle (Ver) */}
      <Modal
        open={detalle !== null}
        onClose={() => setDetalle(null)}
        title={
          detalle ? (
            <span className="flex items-center gap-2">
              <Eye size={18} style={{ color: palette.primary }} />
              {detalle.titulo}
            </span>
          ) : (
            ""
          )
        }
      >
        <dl className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {detalle?.filas.map(([etiqueta, valor]) => (
            <div
              key={etiqueta}
              className="flex items-center justify-between px-4 py-2.5 text-xs"
            >
              <dt className="font-semibold text-slate-500">{etiqueta}</dt>
              <dd className="font-bold text-slate-800 text-right">{valor}</dd>
            </div>
          ))}
        </dl>

        <button
          onClick={() => setDetalle(null)}
          className="w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition hover:opacity-95"
          style={{ backgroundColor: palette.primary }}
        >
          Cerrar
        </button>
      </Modal>
    </div>
  );
}
