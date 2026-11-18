"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "@/src/context/ThemeContext";
import { useToast } from "@/src/context/ToastContext";
import { Button } from "@/src/components/ui/Button";
import {
  crearAdopcion,
  obtenerSolicitud,
} from "@/src/services/adoptions/adoption-client";
import { fechaCorta } from "@/src/services/animals/animal-format";
import {
  ArrowLeft,
  Printer,
  Loader2,
  AlertTriangle,
  FileSignature,
  Edit3,
  X,
  Check,
} from "lucide-react";
import type { SolicitudConRelaciones } from "@/src/services/adoptions/adoption-client";

const PLANTILLA_CONTRATO = (adoptante: any, animal: any, fecha: string) => `
CONTRATO DE ADOPCIÓN RESPONSABLE

En la ciudad de San Salvador, a los ${fecha}, se celebra el presente contrato de adopción entre AnimalSmile (en adelante, "El Refugio") y el/la Sr(a). ${adoptante.nombre} ${adoptante.apellido}, con documento de identidad número ${adoptante.documento_identidad}, con domicilio en ${adoptante.direccion}, teléfono ${adoptante.telefono} y correo electrónico ${adoptante.email} (en adelante, "El Adoptante").

CLÁUSULAS:

PRIMERA: El Refugio entrega en adopción al Adoptante al animal identificado con el código ${animal.codigo_identificador}, de nombre ${animal.nombre}.

SEGUNDA: El Adoptante se compromete a brindar al animal un hogar seguro, alimentación adecuada, atención veterinaria y afecto. Queda prohibido el maltrato, abandono o venta del animal.

TERCERA: El Adoptante acepta recibir visitas de seguimiento por parte del personal de AnimalSmile para verificar el bienestar del animal.

CUARTA: En caso de no poder continuar cuidando al animal, el Adoptante se compromete a notificar a AnimalSmile y devolverlo, sin derecho a reembolso.



Firmas:



_________________________________          _________________________________
El Adoptante                               AnimalSmile
${adoptante.nombre} ${adoptante.apellido}
Doc: ${adoptante.documento_identidad}
`;

function FormularioContrato() {
  const { palette } = useTheme();
  const { mostrarToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const idSolicitud = searchParams.get("id_solicitud");

  const [solicitud, setSolicitud] = useState<SolicitudConRelaciones | null>(
    null,
  );
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fechaAdopcion, setFechaAdopcion] = useState(
    new Date().toISOString().slice(0, 10),
  );

  // Estados para el contrato y la edición
  const [textoContrato, setTextoContrato] = useState("");
  const [modoEdicion, setModoEdicion] = useState(false);
  const [textoBorrador, setTextoBorrador] = useState(""); // Para no modificar el original hasta guardar

  useEffect(() => {
    if (!idSolicitud) {
      setError("No se ha especificado una solicitud válida.");
      setCargando(false);
      return;
    }

    let cancelado = false;

    obtenerSolicitud(idSolicitud)
      .then((data) => {
        if (cancelado) return;
        setSolicitud(data);
        const textoInicial = PLANTILLA_CONTRATO(
          data.solicitante,
          data.animal,
          fechaCorta(fechaAdopcion + "T12:00:00Z"),
        );
        setTextoContrato(textoInicial);
        setTextoBorrador(textoInicial);
      })
      .catch((err) => {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar la solicitud.",
          );
        }
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [idSolicitud]);

  // Actualizar fecha en el documento si el usuario la cambia
  useEffect(() => {
    if (solicitud && !modoEdicion) {
      const nuevoTexto = PLANTILLA_CONTRATO(
        solicitud.solicitante,
        solicitud.animal,
        fechaCorta(fechaAdopcion + "T12:00:00Z"),
      );
      setTextoContrato(nuevoTexto);
      setTextoBorrador(nuevoTexto);
    }
  }, [fechaAdopcion, solicitud, modoEdicion]);

  const handleGuardarEdicion = () => {
    setTextoContrato(textoBorrador);
    setModoEdicion(false);
  };

  const handleImprimir = async () => {
    if (!solicitud) return;
    setGuardando(true);

    try {
      await crearAdopcion({
        id_solicitud: idSolicitud!,
        fecha_adopcion: fechaAdopcion,
        contrato_firmado_url: "GENERADO_EN_NAVEGADOR",
      });
      mostrarToast("Adopción registrada correctamente.", "success");
    } catch (err: any) {
      console.warn(
        "Aviso: No se guardó en BD (posiblemente ya existe):",
        err.message,
      );
    } finally {
      window.print();
      setTimeout(() => {
        setGuardando(false);
        router.push("/admin/modules/Adoption/Applications");
      }, 1500);
    }
  };

  if (cargando) {
    return (
      <div className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center gap-2 text-slate-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-xs font-medium">Preparando el documento...</span>
      </div>
    );
  }

  if (error || !solicitud) {
    return (
      <div className="h-[calc(100vh-5rem)] flex flex-col items-center justify-center gap-3 text-center">
        <span className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50 text-red-500">
          <AlertTriangle size={24} />
        </span>
        <p className="text-sm font-bold text-red-600">
          {error || "Error desconocido"}
        </p>
        <Link href="/admin/modules/Adoption/Applications">
          <Button variant="outline">Volver a Solicitudes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="anim-fade-in h-[calc(100vh-5rem)] w-full overflow-hidden bg-slate-100 flex flex-col relative">
      {/* REGLAS DE IMPRESIÓN */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #seccion-imprimible,
          #seccion-imprimible * {
            visibility: visible;
          }
          #seccion-imprimible {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* BARRA SUPERIOR FLOTANTE (No se imprime) */}
      <div className="anim-fade-up delay-1 no-print bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/modules/Adoption/Applications"
            className="anim-press p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-lg font-black text-slate-800">
              Contrato de{" "}
              <span style={{ color: palette.primary }}>Adopción</span>
            </h1>
            <p className="text-xs text-slate-500">
              Revisa el documento antes de generar el PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs font-bold text-slate-500">Fecha:</span>
            <input
              type="date"
              value={fechaAdopcion}
              onChange={(e) => setFechaAdopcion(e.target.value)}
              disabled={modoEdicion}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setTextoBorrador(textoContrato); // Clonamos el texto actual al borrador
              setModoEdicion(true);
            }}
            icon={<Edit3 size={15} />}
          >
            Editar Texto
          </Button>

          <Button
            onClick={handleImprimir}
            disabled={guardando}
            icon={
              guardando ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Printer size={16} />
              )
            }
          >
            {guardando ? "Generando PDF..." : "Imprimir PDF"}
          </Button>
        </div>
      </div>

      {/* ÁREA DE PREVISUALIZACIÓN (El fondo gris) */}
      <div className="anim-fade-up delay-2 flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-200/60 relative">
        {/* Icono lateral */}
        <div className="no-print absolute top-8 left-1/2 -translate-x-[420px] hidden lg:flex flex-col gap-2">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-400 flex flex-col gap-4">
            <FileSignature size={18} className="text-slate-600" />
          </div>
        </div>

        {/* LA HOJA BLANCA (Único elemento visible en el PDF) */}
        <div
          id="seccion-imprimible"
          className="anim-scale-in delay-3 bg-white text-black p-12 md:p-16 w-full max-w-[800px] shadow-xl min-h-[1050px] font-mono text-[12px] leading-[1.8] whitespace-pre-wrap rounded-sm"
        >
          {textoContrato}
        </div>
      </div>

      {/* MODAL DE EDICIÓN (Overlay oscuro) */}
      {modoEdicion && (
        <div className="anim-fade-in no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="anim-modal-in bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <Edit3 size={18} style={{ color: palette.primary }} />
                  Editar Cláusulas del Contrato
                </h3>
                <p className="text-xs text-slate-500">
                  Puedes modificar el texto. Los cambios se reflejarán al
                  imprimir.
                </p>
              </div>
              <button
                onClick={() => setModoEdicion(false)}
                className="anim-press p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Editor */}
            <div className="p-6">
              <textarea
                value={textoBorrador}
                onChange={(e) => setTextoBorrador(e.target.value)}
                className="w-full h-[50vh] p-4 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono leading-relaxed resize-none focus:outline-none focus:border-[var(--color-primary)] transition"
                placeholder="Escribe el contenido del contrato aquí..."
              />
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setModoEdicion(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGuardarEdicion} icon={<Check size={16} />}>
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContratoFormPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-5rem)] w-full flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 size={22} className="animate-spin" />
          <span className="text-xs font-medium">Cargando...</span>
        </div>
      }
    >
      <FormularioContrato />
    </Suspense>
  );
}
