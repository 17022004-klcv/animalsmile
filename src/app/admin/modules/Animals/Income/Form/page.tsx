"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { Button } from "@/src/components/ui/Button";
import { generarCodigoEspecie } from "@/src/services/animals/animal-validation";
import { subirArchivos, obtenerAnimal } from "@/src/services/animals/animal-client";
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
} from "lucide-react";

type Especie = EspecieBasica;

function FormularioAnimal() {
  const { palette } = useTheme();
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
      router.push("/admin/modules/Animals/Income");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el registro.",
      );
    } finally {
      setGuardando(false);
      setSubiendoArchivos(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none hover:border-[var(--color-primary)] focus:border-[var(--color-primary)] transition";

  return (
    <div className="h-[calc(100vh-5rem)] w-full p-4 overflow-hidden bg-slate-50 text-slate-800 flex flex-col justify-between select-none">
      {/* Marco Contenedor Fijo (Sin Scroll de Pantalla) */}
      <form
        onSubmit={handleSubmit}
        className="h-full bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between overflow-hidden"
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between shrink-0 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/modules/Animals/Income"
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              title="Volver al listado"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-800">
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
              <p className="text-xs text-slate-500">
                {modoEdicion
                  ? "Actualiza la ficha general del animal y sus datos de ingreso."
                  : "Ingresa los datos generales del animal y su ficha de ingreso."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2.5 mt-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold shrink-0">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}

        {/* CONTENEDOR CON SCROLL INTERNO ÚNICO DIVIDIDO EN 3 COLUMNAS */}
        <div className="flex-1 my-4 overflow-y-auto pr-1">
          {cargandoAnimal ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs font-medium">Cargando animal...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* COLUMNA 1: IDENTIFICACIÓN Y ESPECIE */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Tag size={15} style={{ color: palette.secondary }} />
                  <span>1. Identificación</span>
                </h2>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre del Animal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Max, Luna, Toby"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
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
                    value={modoEdicion ? codigoIdentificador : codigoGenerado}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                      onChange={(e) => setRazaVariedad(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Foto principal */}
                <div className="space-y-2">
                  <div>
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
                      className="w-full text-xs text-slate-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90"
                    />
                  </div>
                  <div></div>
                </div>
              </div>

              {/* COLUMNA 2: PERFIL Y COMPORTAMIENTO */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Smile size={15} style={{ color: palette.secondary }} />
                  <span>2. Perfil y Estado</span>
                </h2>

                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div>
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

                <div>
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
              </div>

              {/* COLUMNA 3: DATOS DE RESCATE (DINÁMICO) */}
              <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Heart size={15} style={{ color: palette.primary }} />
                    <span>3. Datos de Rescate</span>
                  </h2>

                  <label className="flex items-center gap-2 cursor-pointer">
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
                  <div className="space-y-3 pt-2 border-t border-slate-200/60 animate-fadeIn">
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

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Rescatista
                        </label>
                        <input
                          type="text"
                          placeholder="Nombre completo"
                          value={nombreRescatista}
                          onChange={(e) => setNombreRescatista(e.target.value)}
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
                            setContactoRescatista(e.target.value)
                          }
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
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

                    {/* Fotos del rescate */}
                    <div className="space-y-2">
                      <div>
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
                          className="w-full text-xs text-slate-700 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-primary)] file:text-white hover:file:opacity-90"
                        />
                      </div>
                      <div></div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 bg-slate-100/50 rounded-xl border border-dashed border-slate-200 my-auto">
                    <p className="text-xs">
                      Marca la casilla superior si el animal proviene de un
                      reporte de rescate para adjuntar sus evidencias y
                      bitácora.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer del Formulario */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span>Campos marcados con (*) son obligatorios</span>
          <span className="font-semibold text-slate-600">
            Sistema AnimalSmile
          </span>
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
