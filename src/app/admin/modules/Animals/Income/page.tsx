"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { SearchInput } from "@/src/components/ui/Filters";
import { Modal } from "@/src/components/ui/Modal";
import { ConfirmDialog } from "@/src/components/ui/ConfirmDialog";
import { Toast, type ToastTipo } from "@/src/components/ui/Toast";
import { formatearEstado, fechaCorta } from "@/src/services/animals/animal-format";
import { obtenerAnimales, eliminarAnimal } from "@/src/services/animals/animal-client";
import type { AnimalConRelaciones } from "@/src/types/animal";
import {
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Heart,
  CheckCircle2,
  PawPrint,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function IngresosAnimalesPage() {
  const { palette } = useTheme();

  const [animales, setAnimales] = useState<AnimalConRelaciones[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<string | null>(null);
  const [confirmarEliminar, setConfirmarEliminar] =
    useState<AnimalConRelaciones | null>(null);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    type: ToastTipo;
  }>({ open: false, message: "", type: "success" });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [animalSeleccionado, setAnimalSeleccionado] =
    useState<AnimalConRelaciones | null>(null);

  const itemsPerPage = 10;

  const cargarAnimales = async () => {
    try {
      const data = await obtenerAnimales();
      setAnimales(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los animales.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let cancelado = false;
    obtenerAnimales()
      .then((data) => {
        if (cancelado) return;
        setAnimales(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los animales.",
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

  const filteredData = animales.filter(
    (item: AnimalConRelaciones) =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo_identificador
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.especie.nombre_comun.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleVerDetalle = (animal: AnimalConRelaciones) => {
    setAnimalSeleccionado(animal);
    setModalOpen(true);
  };

  const handleEliminar = async () => {
    if (!confirmarEliminar) return;
    const animal = confirmarEliminar;

    setEliminandoId(animal.id_animal);
    setError(null);
    try {
      await eliminarAnimal(animal.id_animal);
      await cargarAnimales();
      setToast({
        open: true,
        message: `Animal "${animal.nombre}" eliminado correctamente.`,
        type: "success",
      });
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo eliminar el animal.";
      setError(mensaje);
      setToast({ open: true, message: mensaje, type: "error" });
    } finally {
      setEliminandoId(null);
      setConfirmarEliminar(null);
    }
  };

  const exportarCSV = () => {
    const filas = [
      [
        "Código",
        "Nombre",
        "Especie",
        "Raza",
        "Edad (meses)",
        "Energía",
        "Temperamento",
        "Estado",
        "Origen",
        "Fecha ingreso",
      ],
      ...filteredData.map((a) => [
        a.codigo_identificador,
        a.nombre,
        a.especie.nombre_comun,
        a.raza_variedad ?? "",
        a.edad_estimada_meses !== null ? String(a.edad_estimada_meses) : "",
        a.nivel_energia ?? "",
        a.temperamento ?? "",
        formatearEstado(a.estado),
        a.rescate ? "Rescatado" : "Directo",
        fechaCorta(a.creado_en),
      ]),
    ];

    const csv = filas.map((f) => f.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ingresos_animales.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const descargarFicha = (animal: AnimalConRelaciones) => {
    const lineas = [
      "FICHA DE INGRESO - AnimalSmile",
      "".padEnd(40, "="),
      `Código: ${animal.codigo_identificador}`,
      `Nombre: ${animal.nombre}`,
      `Especie: ${animal.especie.nombre_comun}`,
      `Raza / Variedad: ${animal.raza_variedad ?? "—"}`,
      `Edad estimada: ${
        animal.edad_estimada_meses !== null
          ? `${animal.edad_estimada_meses} meses`
          : "—"
      }`,
      `Nivel de energía: ${animal.nivel_energia ?? "—"}`,
      `Temperamento: ${animal.temperamento ?? "—"}`,
      `Estado: ${formatearEstado(animal.estado)}`,
      `Origen: ${animal.rescate ? "Rescatado" : "Ingreso directo"}`,
      `Fecha de ingreso: ${fechaCorta(animal.creado_en)}`,
    ];

    if (animal.rescate) {
      lineas.push(
        "",
        "-- Datos de rescate --",
        `Fecha: ${fechaCorta(animal.rescate.fecha_rescate)}`,
        `Lugar: ${animal.rescate.ubicacion_hallazgo}`,
        `Rescatista: ${animal.rescate.nombre_rescatista ?? "—"}`,
        `Contacto: ${animal.rescate.contacto_rescatista ?? "—"}`,
        `Condición inicial: ${animal.rescate.condicion_inicial}`,
      );
    }

    const blob = new Blob([lineas.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ficha_${animal.codigo_identificador}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="anim-fade-in h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      {/* Marco Principal */}
      <div className="anim-fade-up delay-1 h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Ingresos de{" "}
              <span style={{ color: palette.primary }}>Animales</span>
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
            <Link href="/admin/modules/Animals/Income/Form">
              <Button icon={<Plus size={16} />}>Nuevo Registro</Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="anim-fade-up delay-2 flex items-center gap-3 my-4 shrink-0">
          <SearchInput
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Buscar por código, nombre o especie..."
          />
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Tabla con scroll interno */}
        <div className="anim-fade-up delay-3 flex-1 min-h-0 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs flex flex-col">
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
                    <th className="px-4 py-3">Origen</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((item: AnimalConRelaciones) => (
                    <tr
                      key={item.id_animal}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Foto en círculo + Código */}
                      <td className="px-4 py-2.5 flex items-center gap-3">
                        {item.foto_principal ? (
                          <img
                            src={item.foto_principal}
                            alt={item.nombre}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                          />
                        ) : (
                          <span
                            className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 bg-slate-100 text-slate-400 shrink-0"
                            title="Sin foto registrada"
                          >
                            <PawPrint size={15} />
                          </span>
                        )}
                        <span className="font-semibold tracking-wide text-slate-700">
                          {item.codigo_identificador}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 font-bold text-slate-800">
                        {item.nombre}
                      </td>

                      <td className="px-4 py-2.5 font-medium text-slate-600">
                        {item.especie.nombre_comun}
                      </td>

                      {/* Origen: Rescatado o Ingreso Directo */}
                      <td className="px-4 py-2.5">
                        {item.id_rescate ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-600 border border-pink-200"
                            style={{
                              color: palette.primary,
                              backgroundColor: `${palette.primary}10`,
                              borderColor: `${palette.primary}30`,
                            }}
                          >
                            <Heart size={11} className="fill-current" />
                            Rescatado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <CheckCircle2 size={11} />
                            Directo
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.estado === "Disponible_Adopcion"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-amber-50 text-amber-600 border border-amber-200"
                          }`}
                        >
                          {formatearEstado(item.estado)}
                        </span>
                      </td>

                      {/* Botones de Acción */}
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
                            title="Previsualizar animal"
                          >
                            <Eye size={15} />
                          </button>

                          <Link
                            href={`/admin/modules/Animals/Income/Form?id=${item.id_animal}`}
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
                            title="Editar registro"
                          >
                            <Edit size={15} />
                          </Link>

                          <button
                            onClick={() => descargarFicha(item)}
                            className="anim-press p-1.5 rounded-lg text-slate-500 hover:text-white transition shadow-2xs"
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
                            title="Descargar Ficha"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            onClick={() => setConfirmarEliminar(item)}
                            disabled={eliminandoId === item.id_animal}
                            className="anim-press p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                            title="Eliminar registro"
                          >
                            {eliminandoId === item.id_animal ? (
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
                        No se encontraron registros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Paginación */}
        <div className="anim-fade-up delay-4 pt-4 flex items-center justify-between text-xs text-slate-500 font-medium shrink-0">
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

      {/* Modal de Previsualización */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <PawPrint size={18} style={{ color: palette.primary }} />
            Expediente del Animal
          </span>
        }
      >
        {animalSeleccionado && (
          <div className="space-y-3 text-xs text-slate-600">
            {/* Foto + Nombre Header */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              {animalSeleccionado.foto_principal ? (
                <img
                  src={animalSeleccionado.foto_principal}
                  alt={animalSeleccionado.nombre}
                  className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <span className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 border-2 border-white shadow-xs text-slate-400">
                  <PawPrint size={20} />
                </span>
              )}
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  {animalSeleccionado.nombre}
                </h3>
                <p className="font-mono text-[11px] text-slate-400">
                  {animalSeleccionado.codigo_identificador}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Especie / Raza
                </span>
                <p className="font-semibold text-slate-800">
                  {animalSeleccionado.especie.nombre_comun} -{" "}
                  {animalSeleccionado.raza_variedad ?? "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Edad Estimada
                </span>
                <p className="font-semibold text-slate-800">
                  {animalSeleccionado.edad_estimada_meses !== null
                    ? `${animalSeleccionado.edad_estimada_meses} meses`
                    : "—"}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Estado
                </span>
                <p className="font-semibold text-slate-800">
                  {formatearEstado(animalSeleccionado.estado)}
                </p>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Nivel de Energía
                </span>
                <p className="font-semibold text-slate-800">
                  {animalSeleccionado.nivel_energia ?? "—"}
                </p>
              </div>
            </div>

            {animalSeleccionado.temperamento && (
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Temperamento
                </span>
                <p className="font-semibold text-slate-800">
                  {animalSeleccionado.temperamento}
                </p>
              </div>
            )}

            {/* Datos de Rescate si aplica */}
            {animalSeleccionado.rescate && (
              <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 flex items-center gap-1">
                  <Heart size={12} className="fill-pink-600" /> Datos de Rescate
                </span>
                <p className="text-slate-700">
                  <strong>Fecha:</strong>{" "}
                  {fechaCorta(animalSeleccionado.rescate.fecha_rescate)}
                </p>
                <p className="text-slate-700">
                  <strong>Lugar:</strong>{" "}
                  {animalSeleccionado.rescate.ubicacion_hallazgo}
                </p>
                <p className="text-slate-700">
                  <strong>Rescatista:</strong>{" "}
                  {animalSeleccionado.rescate.nombre_rescatista ?? "—"} (
                  {animalSeleccionado.rescate.contacto_rescatista ?? "—"})
                </p>
                <p className="text-slate-700">
                  <strong>Condición inicial:</strong>{" "}
                  {animalSeleccionado.rescate.condicion_inicial}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="anim-press px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm transition"
                style={{ backgroundColor: palette.primary }}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmarEliminar !== null}
        title="Eliminar animal"
        description={
          confirmarEliminar
            ? `¿Estás seguro de eliminar a "${confirmarEliminar.nombre}" (${confirmarEliminar.codigo_identificador})? Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        loading={
          eliminandoId !== null &&
          eliminandoId === confirmarEliminar?.id_animal
        }
        onConfirm={handleEliminar}
        onCancel={() => setConfirmarEliminar(null)}
      />

      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
