"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Modal } from "@/src/components/ui/Modal";
import { SearchInput } from "@/src/components/ui/Filters";
import {
  obtenerCatalogos,
  crearCatalogo,
  actualizarCatalogo,
  eliminarCatalogo,
} from "@/src/services/inquiries/inquiry-client";
import {
  obtenerEspecies,
  obtenerTaxonomias,
} from "@/src/services/classifications/classification-client";
import type {
  CatalogosMedicos,
  ItemCatalogo,
} from "@/src/services/inquiries/inquiry-validation";
import type {
  EspecieConRelaciones,
  TaxonomiaConEspecies,
} from "@/src/types/classification";
import { formatearAlcanceVacuna } from "@/src/services/inquiries/inquiry-format";
import {
  AlertTriangle,
  Edit,
  Loader2,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

type SubTab = "vacuna" | "medicamento" | "enfermedad";

interface CatalogoMedicoProps {
  onActualizado?: () => void;
}

const SUBTABS: { valor: SubTab; etiqueta: string }[] = [
  { valor: "vacuna", etiqueta: "Vacunas" },
  { valor: "medicamento", etiqueta: "Medicamentos" },
  { valor: "enfermedad", etiqueta: "Enfermedades" },
];

export default function CatalogoMedico({ onActualizado }: CatalogoMedicoProps) {
  const [subTab, setSubTab] = useState<SubTab>("vacuna");
  const [catalogos, setCatalogos] = useState<CatalogosMedicos | null>(null);
  const [especies, setEspecies] = useState<EspecieConRelaciones[]>([]);
  const [taxonomias, setTaxonomias] = useState<TaxonomiaConEspecies[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemEnEdicion, setItemEnEdicion] = useState<ItemCatalogo | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [vias, setVias] = useState("");
  const [idEspecie, setIdEspecie] = useState("");
  const [idTaxonomia, setIdTaxonomia] = useState("");
  const [edadMinima, setEdadMinima] = useState("");
  const [intervaloDias, setIntervaloDias] = useState("");
  const [dosisRecomendada, setDosisRecomendada] = useState("");
  const [esContagiosa, setEsContagiosa] = useState(false);
  const [requiereAislamiento, setRequiereAislamiento] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [catalogosMedicos, listaEspecies, listaTaxonomias] =
        await Promise.all([
          obtenerCatalogos(),
          obtenerEspecies(),
          obtenerTaxonomias(),
        ]);
      setCatalogos(catalogosMedicos);
      setEspecies(listaEspecies);
      setTaxonomias(listaTaxonomias);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los catálogos.",
      );
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const elementos = useMemo(() => {
    if (!catalogos) return [] as ItemCatalogo[];
    if (subTab === "vacuna") return catalogos.vacunas;
    if (subTab === "medicamento") return catalogos.medicamentos;
    return catalogos.enfermedades;
  }, [catalogos, subTab]);

  const elementosFiltrados = useMemo(() => {
    const termino = searchTerm.trim().toLowerCase();
    if (!termino) return elementos;
    return elementos.filter((item) =>
      item.nombre.toLowerCase().includes(termino),
    );
  }, [elementos, searchTerm]);

  const idDeItem = (item: ItemCatalogo): number | null => {
    if (subTab === "vacuna") return item.id_vacuna ?? null;
    if (subTab === "medicamento") return item.id_medicamento ?? null;
    return item.id_enfermedad ?? null;
  };

  const abrirNuevo = () => {
    setItemEnEdicion(null);
    setNombre("");
    setDescripcion("");
    setVias("");
    setIdEspecie("");
    setIdTaxonomia("");
    setEdadMinima("");
    setIntervaloDias("");
    setDosisRecomendada("");
    setEsContagiosa(false);
    setRequiereAislamiento(false);
    setError(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (item: ItemCatalogo) => {
    setItemEnEdicion(item);
    setNombre(item.nombre);
    setDescripcion(item.descripcion ?? "");
    setVias(item.vias ?? "");
    setIdEspecie(item.id_especie ? String(item.id_especie) : "");
    setIdTaxonomia(item.id_taxonomia ? String(item.id_taxonomia) : "");
    setEdadMinima(
      item.edad_minima_meses !== null && item.edad_minima_meses !== undefined
        ? String(item.edad_minima_meses)
        : "",
    );
    setIntervaloDias(
      item.intervalo_dias !== null && item.intervalo_dias !== undefined
        ? String(item.intervalo_dias)
        : "",
    );
    setDosisRecomendada(item.dosis_recomendada ?? "");
    setEsContagiosa(Boolean(item.es_contagiosa));
    setRequiereAislamiento(Boolean(item.requiere_aislamiento));
    setError(null);
    setModalAbierto(true);
  };

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setGuardando(true);
    setError(null);

    const datos: Record<string, unknown> = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
    };

    if (subTab === "vacuna") {
      datos.id_especie = idEspecie ? Number(idEspecie) : null;
      datos.id_taxonomia = idTaxonomia ? Number(idTaxonomia) : null;
      datos.edad_minima_meses = edadMinima ? Number(edadMinima) : null;
      datos.intervalo_dias = intervaloDias ? Number(intervaloDias) : null;
      datos.dosis_recomendada = dosisRecomendada.trim() || null;
    } else if (subTab === "medicamento") {
      datos.vias = vias.trim() || null;
    } else {
      datos.es_contagiosa = esContagiosa;
      datos.requiere_aislamiento = requiereAislamiento;
    }

    try {
      if (itemEnEdicion) {
        const id = idDeItem(itemEnEdicion);
        if (!id) throw new Error("El elemento no tiene un identificador válido.");
        await actualizarCatalogo(subTab, id, datos);
      } else {
        await crearCatalogo(subTab, datos);
      }
      setModalAbierto(false);
      await cargar();
      onActualizado?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el elemento.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (item: ItemCatalogo) => {
    const id = idDeItem(item);
    if (!id) return;
    if (!window.confirm(`¿Desactivar "${item.nombre}" del catálogo?`)) return;
    setError(null);
    try {
      await eliminarCatalogo(subTab, id);
      await cargar();
      onActualizado?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar el elemento.",
      );
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] transition";

  const tituloModal = itemEnEdicion
    ? `Editar ${subTab === "vacuna" ? "vacuna" : subTab === "medicamento" ? "medicamento" : "enfermedad"}`
    : `Nueva ${subTab === "vacuna" ? "vacuna" : subTab === "medicamento" ? "medicamento" : "enfermedad"}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {SUBTABS.map((tab) => (
            <button
              key={tab.valor}
              onClick={() => {
                setSubTab(tab.valor);
                setSearchTerm("");
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                subTab === tab.valor
                  ? "bg-white text-slate-800 shadow-xs"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.etiqueta}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-56">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre..."
            />
          </div>
          <Button icon={<Plus size={14} />} onClick={abrirNuevo}>
            Agregar
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold">
          <AlertTriangle size={13} />
          {error}
        </div>
      )}

      {cargando ? (
        <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando catálogos...</span>
        </div>
      ) : elementosFiltrados.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
          No hay elementos registrados en este catálogo.
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[9px] font-bold">
              {subTab === "vacuna" ? (
                <tr>
                  <th className="px-3 py-2">Vacuna</th>
                  <th className="px-3 py-2">Alcance</th>
                  <th className="px-3 py-2">Edad mínima</th>
                  <th className="px-3 py-2">Intervalo</th>
                  <th className="px-3 py-2">Dosis</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              ) : subTab === "medicamento" ? (
                <tr>
                  <th className="px-3 py-2">Medicamento</th>
                  <th className="px-3 py-2">Vías de administración</th>
                  <th className="px-3 py-2">Descripción</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-3 py-2">Enfermedad</th>
                  <th className="px-3 py-2">Contagiosa</th>
                  <th className="px-3 py-2">Aislamiento</th>
                  <th className="px-3 py-2">Descripción</th>
                  <th className="px-3 py-2 text-right">Acciones</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {elementosFiltrados.map((item) => (
                <tr key={String(idDeItem(item))} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2">
                    <span className="font-bold text-slate-700">{item.nombre}</span>
                  </td>

                  {subTab === "vacuna" && (
                    <>
                      <td className="px-3 py-2 text-slate-500">
                        {formatearAlcanceVacuna(item.alcance ?? "General")}
                      </td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                        {item.edad_minima_meses
                          ? `${item.edad_minima_meses} meses`
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                        {item.intervalo_dias ? `${item.intervalo_dias} días` : "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {item.dosis_recomendada ?? "—"}
                      </td>
                    </>
                  )}

                  {subTab === "medicamento" && (
                    <>
                      <td className="px-3 py-2 text-slate-500">{item.vias ?? "—"}</td>
                      <td className="px-3 py-2 text-slate-500">
                        {item.descripcion ?? "—"}
                      </td>
                    </>
                  )}

                  {subTab === "enfermedad" && (
                    <>
                      <td className="px-3 py-2">
                        {item.es_contagiosa ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                            Sí
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-200">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {item.requiere_aislamiento ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                            Sí
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-200">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {item.descripcion ?? "—"}
                      </td>
                    </>
                  )}

                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => abrirEdicion(item)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="Editar"
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => handleEliminar(item)}
                        className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Desactivar"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title={tituloModal}
        size="lg"
      >
        <div className="space-y-3">
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold">
              <AlertTriangle size={13} />
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del elemento"
              className={inputClass}
            />
          </div>

          {subTab === "vacuna" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Especie
                  </label>
                  <select
                    value={idEspecie}
                    onChange={(e) => setIdEspecie(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Todas las especies</option>
                    {especies.map((especie) => (
                      <option
                        key={especie.id_especie}
                        value={String(especie.id_especie)}
                      >
                        {especie.nombre_comun}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Taxonomía
                  </label>
                  <select
                    value={idTaxonomia}
                    onChange={(e) => setIdTaxonomia(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Todas las taxonomías</option>
                    {taxonomias.map((taxonomia) => (
                      <option
                        key={taxonomia.id_taxonomia}
                        value={String(taxonomia.id_taxonomia)}
                      >
                        {taxonomia.nombre_clase}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Edad mínima (meses)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={edadMinima}
                    onChange={(e) => setEdadMinima(e.target.value)}
                    placeholder="Ej. 3"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Intervalo (días)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={intervaloDias}
                    onChange={(e) => setIntervaloDias(e.target.value)}
                    placeholder="Ej. 365"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Dosis recomendada
                  </label>
                  <input
                    type="text"
                    value={dosisRecomendada}
                    onChange={(e) => setDosisRecomendada(e.target.value)}
                    placeholder="Ej. 1 ml SC"
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {subTab === "medicamento" && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">
                Vías de administración
              </label>
              <input
                type="text"
                value={vias}
                onChange={(e) => setVias(e.target.value)}
                placeholder="Ej. Inyectable, Oral"
                className={inputClass}
              />
            </div>
          )}

          {subTab === "enfermedad" && (
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={esContagiosa}
                  onChange={(e) => setEsContagiosa(e.target.checked)}
                  className="accent-[var(--color-primary)]"
                />
                Es contagiosa
              </label>
              <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                <input
                  type="checkbox"
                  checked={requiereAislamiento}
                  onChange={(e) => setRequiereAislamiento(e.target.checked)}
                  className="accent-[var(--color-primary)]"
                />
                Requiere aislamiento
              </label>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Detalles del elemento..."
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button
              icon={
                guardando ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )
              }
              onClick={handleGuardar}
              disabled={guardando}
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
