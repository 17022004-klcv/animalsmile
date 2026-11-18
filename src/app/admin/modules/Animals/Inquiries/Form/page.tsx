"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";
import { Button } from "@/src/components/ui/Button";
import {
  SearchableSelect,
  SelectOption,
} from "@/src/components/ui/SearchableSelect";
import { pedir } from "@/src/services/common/http";
import {
  ArrowLeft,
  Save,
  Stethoscope,
  Syringe,
  Pill,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
} from "lucide-react";

interface CatalogoItem {
  id: number;
  nombre: string;
}

interface AnimalResumen {
  id_animal: string;
  nombre: string;
  codigo_identificador: string;
  especie: {
    id_especie: number;
    nombre_comun: string;
  };
}

const PASOS = [
  {
    id: "consulta",
    titulo: "Datos de Consulta",
    descripcion: "Motivo, diagnóstico y observaciones clínicas",
    icono: Stethoscope,
  },
  {
    id: "vacunas-enfermedades",
    titulo: "Vacunas y Diagnósticos",
    descripcion: "Vacunas aplicadas y enfermedades detectadas",
    icono: Syringe,
  },
  {
    id: "medicamentos",
    titulo: "Medicamentos",
    descripcion: "Tratamiento recetado, dosis y frecuencia",
    icono: Pill,
  },
] as const;

const inputClass =
  "w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition";

function FormularioConsulta() {
  const { palette } = useTheme();
  const { mostrarToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idAnimalParam = searchParams.get("id") ?? "";

  const [paso, setPaso] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Catálogos y animales
  const [animales, setAnimales] = useState<AnimalResumen[]>([]);
  const [vacunasCatalogo, setVacunasCatalogo] = useState<CatalogoItem[]>([]);
  const [medicamentosCatalogo, setMedicamentosCatalogo] = useState<
    CatalogoItem[]
  >([]);
  const [enfermedadesCatalogo, setEnfermedadesCatalogo] = useState<
    CatalogoItem[]
  >([]);

  // Paso 1: Consulta general
  const [idAnimal, setIdAnimal] = useState(idAnimalParam);
  const [fechaConsulta, setFechaConsulta] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [motivoConsulta, setMotivoConsulta] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [pesoKg, setPesoKg] = useState("");
  const [temperaturaC, setTemperaturaC] = useState("");
  const [observaciones, setObservaciones] = useState("");

  // Paso 2: Vacunas aplicadas y enfermedades diagnosticadas
  const [vacunasAplicadas, setVacunasAplicadas] = useState<
    { id_vacuna: string; proxima_dosis: string }[]
  >([]);
  const [enfermedadesDetectadas, setEnfermedadesDetectadas] = useState<
    string[]
  >([]);

  // Paso 3: Medicamentos recetados
  const [medicamentosRecetados, setMedicamentosRecetados] = useState<
    { id_medicamento: string; dosis: string; duracion: string }[]
  >([]);

  useEffect(() => {
    let cancelado = false;

    Promise.all([
      pedir<{ animales: AnimalResumen[] }>("/api/admin/animals"),
      pedir<{
        vacunas?: CatalogoItem[];
        medicamentos?: CatalogoItem[];
        enfermedades?: CatalogoItem[];
      }>("/api/admin/inquiries/catalogs"),
    ])
      .then(([resAnimales, resCatalogos]) => {
        if (cancelado) return;
        setAnimales(resAnimales.animales ?? []);
        setVacunasCatalogo(resCatalogos.vacunas ?? []);
        setMedicamentosCatalogo(resCatalogos.medicamentos ?? []);
        setEnfermedadesCatalogo(resCatalogos.enfermedades ?? []);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los catálogos médicos.",
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

  const opcionesAnimales: SelectOption[] = useMemo(
    () =>
      animales.map((a) => ({
        value: a.id_animal,
        label: a.nombre,
        sublabel: `${a.codigo_identificador} · ${a.especie.nombre_comun}`,
      })),
    [animales],
  );

  const opcionesVacunas: SelectOption[] = useMemo(
    () =>
      vacunasCatalogo.map((v) => ({
        value: String(v.id),
        label: v.nombre,
      })),
    [vacunasCatalogo],
  );

  const opcionesEnfermedades: SelectOption[] = useMemo(
    () =>
      enfermedadesCatalogo.map((e) => ({
        value: String(e.id),
        label: e.nombre,
      })),
    [enfermedadesCatalogo],
  );

  const opcionesMedicamentos: SelectOption[] = useMemo(
    () =>
      medicamentosCatalogo.map((m) => ({
        value: String(m.id),
        label: m.nombre,
      })),
    [medicamentosCatalogo],
  );

  const obtenerErrorPasoActual = (): string | null => {
    if (paso === 0) {
      if (!idAnimal) {
        return "Debes seleccionar un animal para registrar la consulta.";
      }
      if (!fechaConsulta) {
        return "La fecha de consulta es obligatoria.";
      }
      if (!motivoConsulta.trim()) {
        return "El motivo de la consulta es obligatorio.";
      }
    }

    return null;
  };

  const validarPasoActual = (mostrarToastError = false): boolean => {
    const mensaje = obtenerErrorPasoActual();
    if (mensaje) {
      setError(mensaje);
      if (mostrarToastError) mostrarToast(mensaje, "error");
      return false;
    }
    setError(null);
    return true;
  };

  const irAPaso = (indice: number) => {
    if (indice <= paso) {
      setError(null);
      setPaso(indice);
    }
  };

  const retrocederPaso = () => {
    setError(null);
    setPaso((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paso < PASOS.length - 1) {
      if (validarPasoActual()) {
        setPaso((prev) => prev + 1);
      }
      return;
    }

    if (!validarPasoActual(true)) return;

    setGuardando(true);
    setError(null);

    try {
      const payload = {
        id_animal: Number(idAnimal),
        fecha_consulta: fechaConsulta,
        motivo: motivoConsulta.trim(),
        diagnostico: diagnostico.trim() || null,
        peso_kg: pesoKg === "" ? null : Number(pesoKg),
        temperatura_c: temperaturaC === "" ? null : Number(temperaturaC),
        observaciones: observaciones.trim() || null,
        vacunas: vacunasAplicadas
          .filter((v) => v.id_vacuna)
          .map((v) => ({
            id_vacuna: Number(v.id_vacuna),
            proxima_dosis: v.proxima_dosis || null,
          })),
        enfermedades: enfermedadesDetectadas
          .filter(Boolean)
          .map((id) => Number(id)),
        medicamentos: medicamentosRecetados
          .filter((m) => m.id_medicamento)
          .map((m) => ({
            id_medicamento: Number(m.id_medicamento),
            dosis: m.dosis.trim(),
            duracion: m.duracion.trim(),
          })),
      };

      await pedir("/api/admin/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      mostrarToast("Consulta veterinaria registrada correctamente.", "success");
      router.push("/admin/modules/Animals/Inquiries");
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudo guardar la consulta veterinaria.";
      setError(mensaje);
      mostrarToast(mensaje, "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <form
        onSubmit={handleSubmit}
        className="anim-fade-in h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden"
      >
        {/* Cabecera con flecha hacia atrás */}
        <div className="anim-fade-up flex items-center justify-between gap-4 shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/modules/Animals/Inquiries"
              className="anim-press p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition shrink-0"
              title="Volver a Consultas Veterinarias"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-800 truncate">
                Registro de{" "}
                <span style={{ color: palette.primary }}>
                  Nueva Consulta Veterinaria
                </span>
              </h1>
              <p className="text-xs text-slate-500 truncate">
                Completa los pasos para registrar el chequeo clínico, vacunas y
                tratamiento.
              </p>
            </div>
          </div>

          <span
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0"
            style={{
              color: palette.primary,
              backgroundColor: `${palette.primary}10`,
              border: `1px solid ${palette.primary}30`,
            }}
          >
            Paso {paso + 1} de {PASOS.length}
          </span>
        </div>

        {/* Stepper horizontal con numeración */}
        <div className="anim-fade-up delay-1 shrink-0 pt-5">
          <ol className="flex items-center gap-2 sm:gap-3">
            {PASOS.map((p, indice) => {
              const activo = indice === paso;
              const completado = indice < paso;
              const habilitado = indice <= paso;
              const Icono = p.icono;

              return (
                <li
                  key={p.id}
                  className="flex items-center gap-2 sm:gap-3 flex-1 last:flex-none min-w-0"
                >
                  <button
                    type="button"
                    onClick={() => irAPaso(indice)}
                    disabled={!habilitado}
                    aria-current={activo ? "step" : undefined}
                    className={`anim-press flex items-center gap-2.5 rounded-2xl px-1.5 py-1.5 transition text-left min-w-0 ${
                      habilitado
                        ? "cursor-pointer"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center border text-xs font-black shrink-0 transition"
                      style={{
                        backgroundColor:
                          completado || activo ? palette.primary : "#ffffff",
                        borderColor:
                          completado || activo ? palette.primary : "#e2e8f0",
                        color: completado || activo ? "#ffffff" : "#94a3b8",
                      }}
                    >
                      {completado ? <Check size={15} /> : <Icono size={15} />}
                    </span>
                    <span className="hidden sm:block min-w-0">
                      <span
                        className="block text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: activo ? palette.primary : "#94a3b8",
                        }}
                      >
                        Paso {indice + 1}
                      </span>
                      <span
                        className={`block text-xs font-bold truncate ${
                          activo ? "text-slate-800" : "text-slate-500"
                        }`}
                      >
                        {p.titulo}
                      </span>
                    </span>
                  </button>

                  {indice < PASOS.length - 1 && (
                    <span
                      className="flex-1 h-0.5 rounded-full transition-colors"
                      style={{
                        backgroundColor: completado
                          ? palette.primary
                          : "#e2e8f0",
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="anim-fade-up flex items-center gap-2 px-4 py-2.5 mt-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* Contenedor central con scroll interno */}
        <div className="flex-1 min-h-0 my-4 overflow-y-auto pr-1 pb-16">
          {cargando ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">
                Cargando expediente y catálogos...
              </span>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-5 py-1">
              {/* PASO 1: DATOS DE CONSULTA */}
              {paso === 0 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.secondary}12`,
                        color: palette.secondary,
                      }}
                    >
                      <Stethoscope size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Evaluación clínica general
                      </h2>
                      <p className="text-xs text-slate-500">
                        Selecciona el paciente, signos vitales y motivo de
                        atención veterinaria.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Animal / Paciente *
                      </label>
                      <SearchableSelect
                        options={opcionesAnimales}
                        value={idAnimal}
                        onChange={(val) => setIdAnimal(String(val))}
                        placeholder="Selecciona un animal..."
                        searchPlaceholder="Buscar por nombre o código..."
                        disabled={Boolean(idAnimalParam)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fecha de Consulta *
                      </label>
                      <input
                        type="date"
                        required
                        value={fechaConsulta}
                        onChange={(e) => setFechaConsulta(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Peso (kg)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          placeholder="Ej. 12.5"
                          value={pesoKg}
                          onChange={(e) => setPesoKg(e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Temp. (°C)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min={30}
                          max={45}
                          placeholder="Ej. 38.5"
                          value={temperaturaC}
                          onChange={(e) => setTemperaturaC(e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Motivo de Consulta *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Control general, refuerzo de vacuna, decaimiento..."
                        value={motivoConsulta}
                        onChange={(e) => setMotivoConsulta(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Diagnóstico / Observaciones
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Hallazgos físicos, evolución o indicaciones..."
                        value={diagnostico}
                        onChange={(e) => setDiagnostico(e.target.value)}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* PASO 2: VACUNAS Y ENFERMEDADES */}
              {paso === 1 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.primary}12`,
                        color: palette.primary,
                      }}
                    >
                      <Syringe size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Vacunas aplicadas y diagnósticos
                      </h2>
                      <p className="text-xs text-slate-500">
                        Agrega las vacunas administradas en esta sesión y
                        enfermedades detectadas (opcional).
                      </p>
                    </div>
                  </div>

                  {/* Vacunas */}
                  <div className="anim-fade-up delay-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Vacunas aplicadas en consulta
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setVacunasAplicadas((prev) => [
                            ...prev,
                            { id_vacuna: "", proxima_dosis: "" },
                          ])
                        }
                        className="anim-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white transition"
                        style={{ backgroundColor: palette.primary }}
                      >
                        <Plus size={13} /> Añadir vacuna
                      </button>
                    </div>

                    {vacunasAplicadas.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-xl bg-white">
                        No se han agregado vacunas en esta consulta.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {vacunasAplicadas.map((item, idx) => (
                          <div
                            key={idx}
                             className="anim-fade-up grid sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-xl border border-slate-200"
                          >
                            <div className="sm:col-span-6">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Vacuna
                              </label>
                              <SearchableSelect
                                options={opcionesVacunas}
                                value={item.id_vacuna}
                                onChange={(val) =>
                                  setVacunasAplicadas((prev) =>
                                    prev.map((v, i) =>
                                      i === idx
                                        ? { ...v, id_vacuna: String(val) }
                                        : v,
                                    ),
                                  )
                                }
                                placeholder="Seleccionar vacuna..."
                                searchPlaceholder="Buscar vacuna..."
                              />
                            </div>
                            <div className="sm:col-span-5">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Próxima dosis
                              </label>
                              <input
                                type="date"
                                value={item.proxima_dosis}
                                onChange={(e) =>
                                  setVacunasAplicadas((prev) =>
                                    prev.map((v, i) =>
                                      i === idx
                                        ? {
                                            ...v,
                                            proxima_dosis: e.target.value,
                                          }
                                        : v,
                                    ),
                                  )
                                }
                                className={inputClass}
                              />
                            </div>
                            <div className="sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setVacunasAplicadas((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  )
                                }
                                 className="anim-press p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                                 title="Quitar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Enfermedades */}
                  <div className="anim-fade-up delay-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Enfermedades o afecciones diagnosticadas
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setEnfermedadesDetectadas((prev) => [...prev, ""])
                        }
                        className="anim-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition"
                      >
                        <Plus size={13} /> Añadir diagnóstico
                      </button>
                    </div>

                    {enfermedadesDetectadas.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-xl bg-white">
                        Sin enfermedades diagnosticadas.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {enfermedadesDetectadas.map((idEnf, idx) => (
                          <div
                            key={idx}
                             className="anim-fade-up flex items-center gap-2.5 bg-white p-3 rounded-xl border border-slate-200"
                          >
                            <div className="flex-1">
                              <SearchableSelect
                                options={opcionesEnfermedades}
                                value={idEnf}
                                onChange={(val) =>
                                  setEnfermedadesDetectadas((prev) =>
                                    prev.map((e, i) =>
                                      i === idx ? String(val) : e,
                                    ),
                                  )
                                }
                                placeholder="Seleccionar enfermedad..."
                                searchPlaceholder="Buscar en catálogo..."
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setEnfermedadesDetectadas((prev) =>
                                  prev.filter((_, i) => i !== idx),
                                )
                              }
                               className="anim-press p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                               title="Quitar"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* PASO 3: MEDICAMENTOS */}
              {paso === 2 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start gap-3">
                    <span
                      className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${palette.dark}12`,
                        color: palette.dark,
                      }}
                    >
                      <Pill size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Medicamentos y tratamiento
                      </h2>
                      <p className="text-xs text-slate-500">
                        Indica los medicamentos recetados, dosis y duración del
                        tratamiento.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Receta médica
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setMedicamentosRecetados((prev) => [
                            ...prev,
                            { id_medicamento: "", dosis: "", duracion: "" },
                          ])
                        }
                        className="anim-press inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white transition"
                        style={{ backgroundColor: palette.primary }}
                      >
                        <Plus size={13} /> Añadir medicamento
                      </button>
                    </div>

                    {medicamentosRecetados.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center border border-dashed border-slate-200 rounded-xl bg-white">
                        No se recetaron medicamentos en esta consulta. Puedes
                        guardar el registro directamente.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {medicamentosRecetados.map((med, idx) => (
                          <div
                            key={idx}
                             className="anim-fade-up grid sm:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-xl border border-slate-200"
                          >
                            <div className="sm:col-span-5">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Medicamento
                              </label>
                              <SearchableSelect
                                options={opcionesMedicamentos}
                                value={med.id_medicamento}
                                onChange={(val) =>
                                  setMedicamentosRecetados((prev) =>
                                    prev.map((m, i) =>
                                      i === idx
                                        ? {
                                            ...m,
                                            id_medicamento: String(val),
                                          }
                                        : m,
                                    ),
                                  )
                                }
                                placeholder="Seleccionar..."
                                searchPlaceholder="Buscar medicamento..."
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Dosis
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. 1 tableta c/12h"
                                value={med.dosis}
                                onChange={(e) =>
                                  setMedicamentosRecetados((prev) =>
                                    prev.map((m, i) =>
                                      i === idx
                                        ? { ...m, dosis: e.target.value }
                                        : m,
                                    ),
                                  )
                                }
                                className={inputClass}
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                Duración
                              </label>
                              <input
                                type="text"
                                placeholder="Ej. 7 días"
                                value={med.duracion}
                                onChange={(e) =>
                                  setMedicamentosRecetados((prev) =>
                                    prev.map((m, i) =>
                                      i === idx
                                        ? { ...m, duracion: e.target.value }
                                        : m,
                                    ),
                                  )
                                }
                                className={inputClass}
                              />
                            </div>
                            <div className="sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setMedicamentosRecetados((prev) =>
                                    prev.filter((_, i) => i !== idx),
                                  )
                                }
                                 className="anim-press p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                                 title="Quitar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer de Navegación */}
        <div className="anim-fade-up delay-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-400 hidden sm:block">
            {paso === 0
              ? "Los campos marcados con (*) son obligatorios."
              : `Paso ${paso + 1} de ${PASOS.length} · ${PASOS[paso].descripcion}`}
          </span>

          <div className="flex items-center gap-2 ml-auto">
            {paso > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={retrocederPaso}
                disabled={guardando}
                icon={<ChevronLeft size={15} />}
              >
                Anterior
              </Button>
            )}

            {paso < PASOS.length - 1 ? (
              <Button
                type="submit"
                disabled={cargando}
                icon={<ChevronRight size={15} />}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={guardando || cargando}
                icon={
                  guardando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )
                }
              >
                Guardar Consulta
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ConsultaFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando formulario...</span>
        </div>
      }
    >
      <FormularioConsulta />
    </Suspense>
  );
}
