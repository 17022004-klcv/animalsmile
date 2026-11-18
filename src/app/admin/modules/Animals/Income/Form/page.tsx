"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";
import { Button } from "@/src/components/ui/Button";
import { generarCodigoEspecie } from "@/src/services/animals/animal-validation";
import { Validaciones } from "@/src/utils/validaciones";
import {
  SearchableSelect,
  SelectOption,
} from "@/src/components/ui/SearchableSelect";
import {
  subirArchivos,
  obtenerAnimal,
} from "@/src/services/animals/animal-client";
import { pedir } from "@/src/services/common/http";
import type { EspecieBasica } from "@/src/types/animal";
import {
  ArrowLeft,
  Save,
  Tag,
  Smile,
  Heart,
  Loader2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";

type Especie = EspecieBasica;

function FormularioAnimal() {
  const { palette } = useTheme();
  const { mostrarToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idAnimal = searchParams.get("id");
  const modoEdicion = idAnimal !== null;

  // Especies disponibles (cargadas desde la API de clasificaciones)
  const [especies, setEspecies] = useState<Especie[]>([]);

  // Estados de carga
  const [cargandoAnimal, setCargandoAnimal] = useState(modoEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Archivos a subir
  const [fotoPrincipalFile, setFotoPrincipalFile] = useState<File | null>(null);
  const [fotosRescateFiles, setFotosRescateFiles] = useState<File[]>([]);
  const [subiendoArchivos, setSubiendoArchivos] = useState(false);

  // Campos principales del Animal
  const [nombre, setNombre] = useState("");
  const [codigoIdentificador, setCodigoIdentificador] = useState("");
  const [idEspecie, setIdEspecie] = useState("");
  const [razaVariedad, setRazaVariedad] = useState("");
  const [edadEstimadaMeses, setEdadEstimadaMeses] = useState("");
  const [temperamento, setTemperamento] = useState("");
  const [nivelEnergia, setNivelEnergia] = useState("Medio");
  const [estado, setEstado] = useState("En_Cuarentena");
  const [fotoPrincipalUrl, setFotoPrincipalUrl] = useState("");

  // Checkbox e inputs para Rescate
  const [esRescatado, setEsRescatado] = useState(false);
  const [fechaRescate, setFechaRescate] = useState("");
  const [ubicacionHallazgo, setUbicacionHallazgo] = useState("");
  const [nombreRescatista, setNombreRescatista] = useState("");
  const [contactoRescatista, setContactoRescatista] = useState("");
  const [condicionInicial, setCondicionInicial] = useState("");
  const [fotosRescateTexto, setFotosRescateTexto] = useState("");

  // Cargar catálogo de especies
  useEffect(() => {
    let cancelado = false;
    pedir<{ especies: Especie[] }>("/api/admin/classifications/species")
      .then((data) => {
        if (!cancelado) setEspecies(data.especies ?? []);
      })
      .catch(() => {
        /* el formulario sigue siendo usable con el mensaje de guardado */
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Cargar datos del animal en modo edición
  useEffect(() => {
    if (!idAnimal) return;
    let cancelado = false;

    obtenerAnimal(idAnimal)
      .then((a) => {
        if (cancelado) return;
        setNombre(a.nombre);
        setCodigoIdentificador(a.codigo_identificador);
        setIdEspecie(String(a.id_especie));
        setRazaVariedad(a.raza_variedad ?? "");
        setEdadEstimadaMeses(
          a.edad_estimada_meses !== null ? String(a.edad_estimada_meses) : "",
        );
        setTemperamento(a.temperamento ?? "");
        setNivelEnergia(a.nivel_energia ?? "Medio");
        setEstado(a.estado);
        setFotoPrincipalUrl(a.foto_principal ?? "");
        if (a.rescate) {
          setEsRescatado(true);
          setFechaRescate(a.rescate.fecha_rescate.slice(0, 10));
          setUbicacionHallazgo(a.rescate.ubicacion_hallazgo);
          setNombreRescatista(a.rescate.nombre_rescatista ?? "");
          setContactoRescatista(a.rescate.contacto_rescatista ?? "");
          setCondicionInicial(a.rescate.condicion_inicial);
          setFotosRescateTexto((a.rescate.fotos_ingreso ?? []).join("\n"));
        }
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error ? err.message : "No se pudo cargar el animal.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargandoAnimal(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idAnimal]);

  // Código identificador generado en el cliente (solo previsualización en
  // creación; el servidor genera el definitivo y valida unicidad)
  const codigoGenerado = useMemo(() => {
    if (modoEdicion || !nombre.trim() || !idEspecie) return "";
    const especieSel = especies.find((e) => e.id_especie === Number(idEspecie));
    if (!especieSel) return "";
    return generarCodigoEspecie(especieSel.nombre_comun);
  }, [nombre, idEspecie, especies, modoEdicion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    try {
      let fotoPrincipalFinal = fotoPrincipalUrl.trim();

      // Subir foto principal si hay archivo
      if (fotoPrincipalFile) {
        setSubiendoArchivos(true);
        const urls = await subirArchivos([fotoPrincipalFile]);
        if (urls.length > 0) fotoPrincipalFinal = urls[0];
        setSubiendoArchivos(false);
      }

      // Subir fotos de rescate si hay archivos
      let fotosRescateUrls: string[] = [];
      if (esRescatado && fotosRescateFiles.length > 0) {
        setSubiendoArchivos(true);
        fotosRescateUrls = await subirArchivos(fotosRescateFiles);
        setSubiendoArchivos(false);
      }

      // Combinar URLs del textarea con URLs subidas
      const fotosRescateTextoUrls = fotosRescateTexto
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u !== "");

      const payload: Record<string, unknown> = {
        nombre,
        id_especie: Number(idEspecie),
        raza_variedad: razaVariedad.trim(),
        edad_estimada_meses:
          edadEstimadaMeses === "" ? null : Number(edadEstimadaMeses),
        temperamento: temperamento.trim(),
        nivel_energia: nivelEnergia,
        estado,
        foto_principal: fotoPrincipalFinal || null,
        rescate: esRescatado
          ? {
              fecha_rescate: fechaRescate,
              ubicacion_hallazgo: ubicacionHallazgo.trim(),
              nombre_rescatista: nombreRescatista.trim(),
              contacto_rescatista: contactoRescatista.trim(),
              condicion_inicial: condicionInicial.trim(),
              fotos_ingreso: [...fotosRescateTextoUrls, ...fotosRescateUrls],
            }
          : null,
      };

      if (!modoEdicion && codigoGenerado) {
        payload.codigo_identificador = codigoGenerado;
      }

      await pedir(
        modoEdicion ? `/api/admin/animals/${idAnimal}` : "/api/admin/animals",
        {
          method: modoEdicion ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      mostrarToast(
        modoEdicion
          ? "Animal actualizado correctamente."
          : "Animal registrado correctamente.",
        "success",
      );
      router.push("/admin/modules/Animals/Income");
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo guardar el registro.";
      setError(mensaje);
      mostrarToast(mensaje, "error");
    } finally {
      setGuardando(false);
      setSubiendoArchivos(false);
    }
  };

  const PASOS = [
    {
      id: "identificacion",
      titulo: "Identificación",
      descripcion: "Datos básicos, especie y foto principal",
      icono: Tag,
    },
    {
      id: "perfil",
      titulo: "Perfil y Estado",
      descripcion: "Edad estimada, energía y temperamento",
      icono: Smile,
    },
    {
      id: "rescate",
      titulo: "Datos de Rescate",
      descripcion: "Origen, hallazgo y evidencias",
      icono: Heart,
    },
  ] as const;

  const [paso, setPaso] = useState(0);

  const obtenerErrorPasoActual = (): string | null => {
    if (paso === 0) {
      const errNombre = Validaciones.validarSoloLetras(
        nombre,
        "Nombre del Animal",
        { requerido: true, maxLength: 50 },
      );
      if (errNombre) return errNombre;

      if (!idEspecie) {
        return "Debes seleccionar una especie antes de continuar.";
      }

      const errRaza = Validaciones.validarSoloLetras(
        razaVariedad,
        "Raza / Variedad",
        { requerido: false, maxLength: 50 },
      );
      if (errRaza) return errRaza;
    }

    if (paso === 2 && esRescatado) {
      if (!fechaRescate) {
        return "La fecha de rescate es obligatoria.";
      }
      if (!ubicacionHallazgo.trim()) {
        return "La ubicación del hallazgo es obligatoria.";
      }

      const errRescatista = Validaciones.validarSoloLetras(
        nombreRescatista,
        "Nombre del Rescatista",
        { requerido: false, maxLength: 50 },
      );
      if (errRescatista) return errRescatista;

      const errContacto = Validaciones.validarTelefono(
        contactoRescatista,
        false,
      );
      if (errContacto) return errContacto;

      if (!condicionInicial.trim()) {
        return "La condición inicial del animal es obligatoria.";
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

  const handleFormSubmit = (e: React.FormEvent) => {
    if (paso < PASOS.length - 1) {
      e.preventDefault();
      if (validarPasoActual()) {
        setPaso((prev) => prev + 1);
      }
      return;
    }

    if (!validarPasoActual(true)) {
      e.preventDefault();
      return;
    }

    handleSubmit(e);
  };

  const irAPaso = (indice: number) => {
    if (indice <= paso || modoEdicion) {
      setError(null);
      setPaso(indice);
    }
  };

  const retrocederPaso = () => {
    setError(null);
    setPaso((prev) => Math.max(0, prev - 1));
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition";

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      <form
        onSubmit={handleFormSubmit}
        className="anim-fade-in h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden"
      >
        {/* Cabecera */}
        <div className="anim-fade-up flex items-center justify-between gap-4 shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/admin/modules/Animals/Income"
              className="anim-press p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition shrink-0"
              title="Volver al listado"
            >
              <ArrowLeft size={16} />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-800 truncate">
                {modoEdicion ? (
                  <>
                    Edición de{" "}
                    <span style={{ color: palette.primary }}>Animal</span>
                  </>
                ) : (
                  <>
                    Registro de{" "}
                    <span style={{ color: palette.primary }}>Nuevo Animal</span>
                  </>
                )}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {modoEdicion
                  ? "Actualiza la ficha general del animal y sus datos de ingreso."
                  : "Completa los pasos para registrar el ingreso del animal."}
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

        {/* Stepper horizontal con numeración y línea conectora */}
        <div className="anim-fade-up delay-1 shrink-0 pt-5">
          <ol className="flex items-center gap-2 sm:gap-3">
            {PASOS.map((p, indice) => {
              const activo = indice === paso;
              const completado = indice < paso;
              const habilitado = indice <= paso || modoEdicion;
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
        <div className="flex-1 min-h-0 my-4 overflow-y-auto pr-1">
          {cargandoAnimal ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando animal...</span>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-5 py-1">
              {/* PASO 1: IDENTIFICACIÓN */}
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
                      <Tag size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Identificación y especie
                      </h2>
                      <p className="text-xs text-slate-500">
                        Registra el nombre, clasificación y fotografía principal
                        del animal.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre del Animal *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Max, Luna, Toby"
                        value={nombre}
                        onChange={(e) =>
                          setNombre(
                            Validaciones.formatearSoloLetras(
                              e.target.value,
                              50,
                            ),
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Código Identificador {modoEdicion ? "" : "(Auto)"}
                      </label>
                      <input
                        type="text"
                        readOnly
                        placeholder="Se genera automáticamente"
                        value={
                          modoEdicion ? codigoIdentificador : codigoGenerado
                        }
                        className="w-full px-3 py-2 text-xs font-semibold tracking-wide bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Especie *
                      </label>
                      <select
                        value={idEspecie}
                        onChange={(e) => setIdEspecie(e.target.value)}
                        required
                        className={inputClass}
                      >
                        <option value="">Selecciona...</option>
                        {especies.map((esp) => (
                          <option
                            key={esp.id_especie}
                            value={String(esp.id_especie)}
                          >
                            {esp.nombre_comun}
                          </option>
                        ))}
                      </select>
                      {especies.length === 0 && (
                        <p className="text-[11px] text-amber-600 mt-1 font-medium">
                          No hay especies registradas. Crea una primero en
                          Clasificaciones.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Raza / Variedad
                      </label>
                      <input
                        type="text"
                        placeholder="Mestizo"
                        value={razaVariedad}
                        onChange={(e) =>
                          setRazaVariedad(
                            Validaciones.formatearSoloLetras(
                              e.target.value,
                              50,
                            ),
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Subir Foto Principal (desde archivo)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFotoPrincipalFile(file);
                          if (file) setFotoPrincipalUrl("");
                        }}
                        className="w-full text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* PASO 2: PERFIL Y ESTADO */}
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
                      <Smile size={18} />
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-slate-800">
                        Perfil y estado de ingreso
                      </h2>
                      <p className="text-xs text-slate-500">
                        Define la edad estimada, el nivel de actividad y su
                        estado actual en el refugio.
                      </p>
                    </div>
                  </div>

                  <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Edad Estimada (Meses)
                      </label>
                      <input
                        type="number"
                        min={0}
                        placeholder="Ej. 12"
                        value={edadEstimadaMeses}
                        onChange={(e) => setEdadEstimadaMeses(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nivel de Energía
                      </label>
                      <select
                        value={nivelEnergia}
                        onChange={(e) => setNivelEnergia(e.target.value)}
                        className={inputClass}
                      >
                        <option value="Bajo">Bajo</option>
                        <option value="Medio">Medio</option>
                        <option value="Alto">Alto</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Estado de Ingreso *
                      </label>
                      <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className={inputClass}
                      >
                        <option value="En_Cuarentena">En Cuarentena</option>
                        <option value="En_Tratamiento">En Tratamiento</option>
                        <option value="Disponible_Adopcion">
                          Disponible Adopción
                        </option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Temperamento
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tranquilo, cariñoso, protector..."
                        value={temperamento}
                        onChange={(e) => setTemperamento(e.target.value)}
                        className={`${inputClass} resize-none`}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* PASO 3: DATOS DE RESCATE */}
              {paso === 2 && (
                <section className="anim-fade-up delay-2 space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${palette.dark}12`,
                          color: palette.dark,
                        }}
                      >
                        <Heart size={18} />
                      </span>
                      <div>
                        <h2 className="text-lg font-black text-slate-800">
                          Datos de rescate
                        </h2>
                        <p className="text-xs text-slate-500">
                          Si proviene de un rescate, documenta el hallazgo y
                          adjunta fotografías.
                        </p>
                      </div>
                    </div>

                    <label className="anim-press flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 shrink-0">
                      <input
                        type="checkbox"
                        checked={esRescatado}
                        onChange={(e) => setEsRescatado(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 accent-[var(--color-primary)] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        ¿Es rescatado?
                      </span>
                    </label>
                  </div>

                  {esRescatado ? (
                    <div className="anim-fade-up delay-3 grid gap-5 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Fecha de Rescate *
                        </label>
                        <input
                          type="date"
                          required={esRescatado}
                          value={fechaRescate}
                          onChange={(e) => setFechaRescate(e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ubicación del Hallazgo *
                        </label>
                        <input
                          type="text"
                          required={esRescatado}
                          placeholder="Dirección o punto de referencia"
                          value={ubicacionHallazgo}
                          onChange={(e) => setUbicacionHallazgo(e.target.value)}
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Rescatista
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          value={nombreRescatista}
                          onChange={(e) =>
                            setNombreRescatista(
                              Validaciones.formatearSoloLetras(
                                e.target.value,
                                50,
                              ),
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Contacto
                        </label>
                        <input
                          type="text"
                          placeholder="+503 7000-0000"
                          value={contactoRescatista}
                          onChange={(e) =>
                            setContactoRescatista(
                              Validaciones.formatearTelefono(e.target.value),
                            )
                          }
                          className={inputClass}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Condición Inicial *
                        </label>
                        <textarea
                          rows={2}
                          required={esRescatado}
                          placeholder="Estado físico y de salud al ser hallado..."
                          value={condicionInicial}
                          onChange={(e) => setCondicionInicial(e.target.value)}
                          className={`${inputClass} resize-none`}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Subir Fotos del Rescate (desde archivos)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setFotosRescateFiles(files);
                          }}
                          className="w-full text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-200 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs leading-relaxed">
                        Marca la casilla superior si el animal proviene de un
                        reporte de rescate para adjuntar sus evidencias y
                        bitácora. De lo contrario, ya puedes guardar el
                        registro.
                      </p>
                    </div>
                  )}
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
                disabled={guardando || subiendoArchivos}
                icon={<ChevronLeft size={15} />}
              >
                Anterior
              </Button>
            )}

            {paso < PASOS.length - 1 ? (
              <Button
                type="submit"
                disabled={cargandoAnimal}
                icon={<ChevronRight size={15} />}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={guardando || subiendoArchivos || cargandoAnimal}
                icon={
                  guardando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )
                }
              >
                {modoEdicion ? "Guardar Cambios" : "Guardar Registro"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AnimalFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando formulario...</span>
        </div>
      }
    >
      <FormularioAnimal />
    </Suspense>
  );
}
