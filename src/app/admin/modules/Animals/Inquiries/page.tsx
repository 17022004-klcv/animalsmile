"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput, FilterBar } from "@/src/components/ui/Filters";
import {
  obtenerAnimalesConConsultas,
  type AnimalConConsultas,
} from "@/src/services/inquiries/inquiry-client";
import { obtenerEspecies } from "@/src/services/classifications/classification-client";
import { formatearEstado, fechaCorta } from "@/src/services/animals/animal-format";
import { ESTADOS_ANIMAL } from "@/src/types/animal";
import DetalleAnimalModal from "@/src/app/admin/modules/Animals/Inquiries/components/DetalleAnimalModal";
import CatalogoMedico from "@/src/app/admin/modules/Animals/Inquiries/components/CatalogoMedico";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  PawPrint,
} from "lucide-react";

type Vista = "consultas" | "catalogos";

export default function ConsultasPage() {
  const { palette } = useTheme();

  const [vista, setVista] = useState<Vista>("consultas");
  const [animales, setAnimales] = useState<AnimalConConsultas[]>([]);
  const [especies, setEspecies] = useState<{ label: string; value: string }[]>(
    [],
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEspecie, setFiltroEspecie] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroDesde, setFiltroDesde] = useState("");
  const [filtroHasta, setFiltroHasta] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [animalSeleccionado, setAnimalSeleccionado] = useState<string | null>(
    null,
  );

  const itemsPerPage = 10;

  const cargar = async () => {
    try {
      const [listaAnimales, listaEspecies] = await Promise.all([
        obtenerAnimalesConConsultas(),
        obtenerEspecies(),
      ]);
      setAnimales(listaAnimales);
      setEspecies(
        listaEspecies.map((e) => ({
          label: e.nombre_comun,
          value: String(e.id_especie),
        })),
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los animales.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const estados = useMemo(
    () =>
      ESTADOS_ANIMAL.map((estado) => ({
        label: formatearEstado(estado),
        value: estado,
      })),
    [],
  );

  const filteredData = useMemo(() => {
    const termino = searchTerm.trim().toLowerCase();

    return animales.filter((animal) => {
      if (filtroEspecie && String(animal.especie.id_especie) !== filtroEspecie) {
        return false;
      }

      if (filtroEstado && animal.estado !== filtroEstado) {
        return false;
      }

      if (termino) {
        const coincide =
          animal.nombre.toLowerCase().includes(termino) ||
          animal.codigo_identificador.toLowerCase().includes(termino) ||
          animal.especie.nombre_comun.toLowerCase().includes(termino);
        if (!coincide) return false;
      }

      if (filtroDesde || filtroHasta) {
        if (!animal.ultima_consulta) return false;
        const fecha = new Date(animal.ultima_consulta);
        if (filtroDesde && fecha < new Date(filtroDesde)) return false;
        if (filtroHasta) {
          const limite = new Date(filtroHasta);
          limite.setHours(23, 59, 59, 999);
          if (fecha > limite) return false;
        }
      }

      return true;
    });
  }, [
    animales,
    searchTerm,
    filtroEspecie,
    filtroEstado,
    filtroDesde,
    filtroHasta,
  ]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const limpiarFiltros = () => {
    setFiltroEspecie("");
    setFiltroEstado("");
    setFiltroDesde("");
    setFiltroHasta("");
    setCurrentPage(1);
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <div className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Consultas{" "}
              <span style={{ color: palette.primary }}>Veterinarias</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1">
              Registro de consultas, vacunas, medicamentos y enfermedades por
              expediente animal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setVista("consultas")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  vista === "consultas"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Consultas
              </button>
              <button
                onClick={() => setVista("catalogos")}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${
                  vista === "catalogos"
                    ? "bg-white text-slate-800 shadow-xs"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Catálogos
              </button>
            </div>

            <Link href="/admin/modules/Animals/Income">
              <Button variant="outline" icon={<PawPrint size={15} />}>
                Ir a Animales
              </Button>
            </Link>
          </div>
        </div>

        {vista === "catalogos" ? (
          <div className="flex-1 min-h-0 overflow-y-auto mt-4">
            <CatalogoMedico onActualizado={cargar} />
          </div>
        ) : (
          <>
            {/* Búsqueda */}
            <div className="flex items-center gap-3 mt-4 shrink-0">
              <SearchInput
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por código, nombre o especie..."
              />
            </div>

            {/* Filtros */}
            <FilterBar
              especies={especies}
              estados={estados}
              especie={filtroEspecie}
              estado={filtroEstado}
              desde={filtroDesde}
              hasta={filtroHasta}
              onEspecieChange={(v) => {
                setFiltroEspecie(v);
                setCurrentPage(1);
              }}
              onEstadoChange={(v) => {
                setFiltroEstado(v);
                setCurrentPage(1);
              }}
              onDesdeChange={(v) => {
                setFiltroDesde(v);
                setCurrentPage(1);
              }}
              onHastaChange={(v) => {
                setFiltroHasta(v);
                setCurrentPage(1);
              }}
              onLimpiar={limpiarFiltros}
            />

            {error && (
              <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            {/* Tabla */}
            <div className="flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
              <div className="flex-1 overflow-y-auto">
                {cargando ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 size={22} className="animate-spin" />
                    <span className="text-xs font-medium">
                      Cargando animales...
                    </span>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold z-10">
                      <tr>
                        <th className="px-4 py-3">Foto / Código</th>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Especie</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Consultas</th>
                        <th className="px-4 py-3">Plan de vacunas</th>
                        <th className="px-4 py-3">Última consulta</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedData.map((animal) => (
                        <tr
                          key={animal.id_animal}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              {animal.foto_principal ? (
                                <img
                                  src={animal.foto_principal}
                                  alt={animal.nombre}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                                />
                              ) : (
                                <span className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-400 shrink-0">
                                  <PawPrint size={15} />
                                </span>
                              )}
                              <span className="font-mono font-bold text-slate-700">
                                {animal.codigo_identificador}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-2.5 font-bold text-slate-800">
                            {animal.nombre}
                          </td>

                          <td className="px-4 py-2.5 font-medium text-slate-600">
                            {animal.especie.nombre_comun}
                            <span className="block text-[10px] text-slate-400">
                              {animal.especie.taxonomia.nombre_clase}
                            </span>
                          </td>

                          <td className="px-4 py-2.5 font-medium text-slate-600">
                            {formatearEstado(animal.estado)}
                          </td>

                          <td className="px-4 py-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {animal.total_consultas}
                            </span>
                          </td>

                          <td className="px-4 py-2.5">
                            {animal.plan.total === 0 ? (
                              <span className="text-[10px] text-slate-400">
                                Sin catálogo
                              </span>
                            ) : (
                              <div className="flex flex-wrap items-center gap-1">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                                  {animal.plan.al_dia} al día
                                </span>
                                {animal.plan.vencidas > 0 && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                                    {animal.plan.vencidas} vencidas
                                  </span>
                                )}
                                {animal.plan.pendientes > 0 && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                                    {animal.plan.pendientes} pendientes
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-2.5 font-medium text-slate-600 whitespace-nowrap">
                            {fechaCorta(animal.ultima_consulta)}
                          </td>

                          <td className="px-4 py-2.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => setAnimalSeleccionado(animal.id_animal)}
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
                              title="Ver expediente de consultas"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {!cargando && paginatedData.length === 0 && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-12 text-center text-slate-400 font-medium"
                          >
                            No se encontraron animales.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Paginación */}
            <div className="pt-4 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
              <span>
                mostrando {filteredData.length > 0 ? startIndex + 1 : 0}-
                {Math.min(startIndex + itemsPerPage, filteredData.length)} de{" "}
                {filteredData.length} animales
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de detalle del animal */}
      <DetalleAnimalModal
        idAnimal={animalSeleccionado}
        onClose={() => setAnimalSeleccionado(null)}
        onActualizado={cargar}
      />
    </div>
  );
}
