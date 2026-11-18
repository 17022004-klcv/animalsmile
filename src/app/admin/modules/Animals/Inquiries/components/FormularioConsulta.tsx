"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/context/ToastContext";
import {
  registrarConsulta,
  actualizarConsulta,
} from "@/src/services/inquiries/inquiry-client";
import type {
  ConsultaConRelaciones,
  ItemCatalogo,
} from "@/src/services/inquiries/inquiry-validation";
import { TIPOS_CONSULTA, type ItemPlanVacunas } from "@/src/types/inquiry";
import { formatearTipoConsulta } from "@/src/services/inquiries/inquiry-format";
import {
  Loader2,
  Plus,
  Save,
  Syringe,
  Stethoscope,
  Trash2,
  Pill,
} from "lucide-react";

interface FormularioConsultaProps {
  idAnimal: string;
  planVacunas: ItemPlanVacunas[];
  medicamentos: ItemCatalogo[];
  enfermedades: ItemCatalogo[];
  consulta?: ConsultaConRelaciones | null;
  onGuardado: () => void;
  onCancelar?: () => void;
}

type VacunaSeleccionada = {
  lote: string;
  proxima_dosis: string;
};

type FilaMedicamento = {
  id_medicamento: string;
  dosis: string;
  via: string;
};

const VIAS = [
  "Inyectable",
  "Oral",
  "Tópico",
  "Inhalada",
  "Rectal",
  "Subcutánea",
  "Intramuscular",
];

function ahoraLocal(): string {
  const ahora = new Date();
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function FormularioConsulta({
  idAnimal,
  planVacunas,
  medicamentos,
  enfermedades,
  consulta,
  onGuardado,
  onCancelar,
}: FormularioConsultaProps) {
  const { mostrarToast } = useToast();
  const esEdicion = Boolean(consulta);

  const [tipoConsulta, setTipoConsulta] = useState<string>("Consulta_General");
  const [fechaConsulta, setFechaConsulta] = useState<string>(ahoraLocal());
  const [motivo, setMotivo] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [idEnfermedad, setIdEnfermedad] = useState("");
  const [peso, setPeso] = useState("");
  const [proximaCita, setProximaCita] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [vacunas, setVacunas] = useState<Record<number, VacunaSeleccionada>>(
    {},
  );
  const [filasMedicamento, setFilasMedicamento] = useState<FilaMedicamento[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!consulta) {
      setTipoConsulta("Consulta_General");
      setFechaConsulta(ahoraLocal());
      setMotivo("");
      setDiagnostico("");
      setTratamiento("");
      setIdEnfermedad("");
      setPeso("");
      setProximaCita("");
      setObservaciones("");
      setVacunas({});
      setFilasMedicamento([]);
      return;
    }

    setTipoConsulta(consulta.tipo_consulta);
    setFechaConsulta(
      consulta.fecha_consulta ? consulta.fecha_consulta.slice(0, 16) : "",
    );
    setMotivo(consulta.motivo);
    setDiagnostico(consulta.diagnostico ?? "");
    setTratamiento(consulta.tratamiento ?? "");
    setIdEnfermedad(
      consulta.enfermedad ? String(consulta.enfermedad.id_enfermedad) : "",
    );
    setPeso(consulta.peso_kg !== null ? String(consulta.peso_kg) : "");
    setProximaCita(
      consulta.proxima_cita ? consulta.proxima_cita.slice(0, 10) : "",
    );
    setObservaciones(consulta.observaciones ?? "");

    const seleccion: Record<number, VacunaSeleccionada> = {};
    for (const aplicada of consulta.vacunas) {
      seleccion[aplicada.id_vacuna] = {
        lote: aplicada.lote ?? "",
        proxima_dosis: aplicada.proxima_dosis
          ? aplicada.proxima_dosis.slice(0, 10)
          : "",
      };
    }
    setVacunas(seleccion);

    setFilasMedicamento(
      consulta.medicamentos.map((medicamento) => ({
        id_medicamento: String(medicamento.id_medicamento),
        dosis: medicamento.dosis ?? "",
        via: medicamento.via_administracion ?? "",
      })),
    );
  }, [consulta]);

  const alternarVacuna = (idVacuna: number) => {
    setVacunas((previas) => {
      if (previas[idVacuna]) {
        const copia = { ...previas };
        delete copia[idVacuna];
        return copia;
      }
      return { ...previas, [idVacuna]: { lote: "", proxima_dosis: "" } };
    });
  };

  const agregarFilaMedicamento = () => {
    setFilasMedicamento((previas) => [
      ...previas,
      { id_medicamento: "", dosis: "", via: "" },
    ]);
  };

  const actualizarFilaMedicamento = (
    indice: number,
    cambios: Partial<FilaMedicamento>,
  ) => {
    setFilasMedicamento((previas) =>
      previas.map((fila, i) => (i === indice ? { ...fila, ...cambios } : fila)),
    );
  };

  const quitarFilaMedicamento = (indice: number) => {
    setFilasMedicamento((previas) => previas.filter((_, i) => i !== indice));
  };

  const payload = useMemo(
    () => ({
      tipo_consulta: tipoConsulta,
      fecha_consulta: fechaConsulta || null,
      motivo,
      diagnostico: diagnostico || null,
      tratamiento: tratamiento || null,
      id_enfermedad: idEnfermedad ? Number(idEnfermedad) : null,
      peso_kg: peso ? Number(peso) : null,
      proxima_cita: proximaCita || null,
      observaciones: observaciones || null,
      vacunas: Object.entries(vacunas).map(([id, datos]) => ({
        id_vacuna: Number(id),
        lote: datos.lote || null,
        fecha_aplicacion: fechaConsulta || null,
        proxima_dosis: datos.proxima_dosis || null,
        observaciones: null,
      })),
      medicamentos: filasMedicamento
        .filter((fila) => fila.id_medicamento)
        .map((fila) => ({
          id_medicamento: Number(fila.id_medicamento),
          dosis: fila.dosis || null,
          via_administracion: fila.via || null,
          fecha_aplicacion: fechaConsulta || null,
          observaciones: null,
        })),
    }),
    [
      tipoConsulta,
      fechaConsulta,
      motivo,
      diagnostico,
      tratamiento,
      idEnfermedad,
      peso,
      proximaCita,
      observaciones,
      vacunas,
      filasMedicamento,
    ],
  );

  const handleGuardar = async () => {
    if (!motivo.trim()) {
      const mensaje = "El motivo de la consulta es obligatorio.";
      setError(mensaje);
      mostrarToast(mensaje, "error");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      if (esEdicion && consulta) {
        await actualizarConsulta(consulta.id_consulta, payload);
      } else {
        await registrarConsulta(idAnimal, payload);
      }
      mostrarToast(
        esEdicion
          ? "Consulta actualizada correctamente."
          : "Consulta registrada correctamente.",
        "success",
      );
      onGuardado();
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : "No se pudo guardar la consulta.";
      setError(mensaje);
      mostrarToast(mensaje, "error");
    } finally {
      setGuardando(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[var(--color-primary)] transition";

  return (
    <div className="anim-fade-in space-y-4">
      {error && (
        <div className="anim-fade-up flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold">
          {error}
        </div>
      )}

      {/* Datos de la consulta */}
      <div className="anim-fade-up delay-1 space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Stethoscope size={12} /> Datos de la consulta
        </span>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Tipo *
            </label>
            <select
              value={tipoConsulta}
              onChange={(e) => setTipoConsulta(e.target.value)}
              className={inputClass}
            >
              {TIPOS_CONSULTA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {formatearTipoConsulta(tipo)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Fecha y hora *
            </label>
            <input
              type="datetime-local"
              value={fechaConsulta}
              onChange={(e) => setFechaConsulta(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Peso (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="Opcional"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">
            Motivo de la consulta *
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={2}
            placeholder="Motivo de la visita, síntomas observados..."
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Diagnóstico / enfermedad
            </label>
            <select
              value={idEnfermedad}
              onChange={(e) => setIdEnfermedad(e.target.value)}
              className={inputClass}
            >
              <option value="">Sin enfermedad registrada</option>
              {enfermedades.map((enfermedad) => (
                <option
                  key={enfermedad.id_enfermedad}
                  value={String(enfermedad.id_enfermedad)}
                >
                  {enfermedad.nombre}
                  {enfermedad.requiere_aislamiento ? " (aislar)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Próxima cita
            </label>
            <input
              type="date"
              value={proximaCita}
              onChange={(e) => setProximaCita(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Diagnóstico
            </label>
            <textarea
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              rows={2}
              placeholder="Hallazgos del examen..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Tratamiento
            </label>
            <textarea
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              rows={2}
              placeholder="Indicaciones dadas..."
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase">
            Observaciones
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={2}
            placeholder="Detalles adicionales de la atención..."
            className={inputClass}
          />
        </div>
      </div>

      {/* Vacunas */}
      <div className="anim-fade-up delay-2 space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Syringe size={12} /> Vacunas aplicadas ({Object.keys(vacunas).length})
        </span>

        {planVacunas.length === 0 ? (
          <p className="text-[11px] text-slate-400 text-center py-2">
            No hay vacunas en el catálogo para esta especie.
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {planVacunas.map((vacuna) => {
              const activa = Boolean(vacunas[vacuna.id_vacuna]);
              return (
                <div
                  key={vacuna.id_vacuna}
                  className={`p-2.5 rounded-xl border transition ${
                    activa
                      ? "bg-white border-[var(--color-primary)]"
                      : "bg-white/60 border-slate-200"
                  }`}
                >
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activa}
                      onChange={() => alternarVacuna(vacuna.id_vacuna)}
                      className="mt-0.5 accent-[var(--color-primary)]"
                    />
                    <span className="flex-1">
                      <span className="block font-bold text-[11px] text-slate-700">
                        {vacuna.nombre}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {vacuna.dosis_recomendada ?? "Dosis por definir"}
                        {vacuna.intervalo_dias
                          ? ` · refuerzo cada ${vacuna.intervalo_dias} días`
                          : ""}
                      </span>
                    </span>
                  </label>

                  {activa && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Lote"
                        value={vacunas[vacuna.id_vacuna].lote}
                        onChange={(e) =>
                          setVacunas((previas) => ({
                            ...previas,
                            [vacuna.id_vacuna]: {
                              ...previas[vacuna.id_vacuna],
                              lote: e.target.value,
                            },
                          }))
                        }
                        className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition"
                      />
                      <input
                        type="date"
                        value={vacunas[vacuna.id_vacuna].proxima_dosis}
                        onChange={(e) =>
                          setVacunas((previas) => ({
                            ...previas,
                            [vacuna.id_vacuna]: {
                              ...previas[vacuna.id_vacuna],
                              proxima_dosis: e.target.value,
                            },
                          }))
                        }
                        className="px-2 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Medicamentos */}
      <div className="anim-fade-up delay-3 space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Pill size={12} /> Medicamentos administrados (
            {filasMedicamento.length})
          </span>
          <Button variant="outline" icon={<Plus size={13} />} onClick={agregarFilaMedicamento}>
            Agregar
          </Button>
        </div>

        {filasMedicamento.length === 0 ? (
          <p className="text-[11px] text-slate-400 text-center py-2">
            Sin medicamentos registrados en esta consulta.
          </p>
        ) : (
          <div className="space-y-2">
            {filasMedicamento.map((fila, indice) => (
              <div
                key={indice}
                className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center p-2 bg-white rounded-xl border border-slate-200"
              >
                <select
                  value={fila.id_medicamento}
                  onChange={(e) =>
                    actualizarFilaMedicamento(indice, {
                      id_medicamento: e.target.value,
                    })
                  }
                  className="px-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition md:col-span-2"
                >
                  <option value="">Selecciona el medicamento...</option>
                  {medicamentos.map((medicamento) => (
                    <option
                      key={medicamento.id_medicamento}
                      value={String(medicamento.id_medicamento)}
                    >
                      {medicamento.nombre}
                      {medicamento.vias ? ` (${medicamento.vias})` : ""}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Dosis"
                  value={fila.dosis}
                  onChange={(e) =>
                    actualizarFilaMedicamento(indice, { dosis: e.target.value })
                  }
                  className="px-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition"
                />

                <div className="flex items-center gap-1">
                  <select
                    value={fila.via}
                    onChange={(e) =>
                      actualizarFilaMedicamento(indice, { via: e.target.value })
                    }
                    className="flex-1 px-2 py-1.5 text-[11px] bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-[var(--color-primary)] transition"
                  >
                    <option value="">Vía</option>
                    {VIAS.map((via) => (
                      <option key={via} value={via}>
                        {via}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => quitarFilaMedicamento(indice)}
                    className="anim-press p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                    title="Quitar medicamento"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="anim-fade-up delay-4 flex justify-end gap-2">
        {onCancelar && (
          <Button variant="outline" onClick={onCancelar}>
            Cancelar
          </Button>
        )}
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
          {esEdicion ? "Actualizar consulta" : "Registrar consulta"}
        </Button>
      </div>
    </div>
  );
}
