import { NextResponse } from "next/server";
import { obtenerConfiguracionSitioPublica } from "@/src/services/config/config-server";
import { mapaConfiguracionSitio } from "@/src/services/config/site-config";

export async function GET() {
  try {
    const filas = await obtenerConfiguracionSitioPublica();
    const configuracion = mapaConfiguracionSitio(filas);
    return NextResponse.json({ configuracion });
  } catch (error) {
    console.error("Error al obtener la configuración pública del sitio:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la configuración del sitio." },
      { status: 500 },
    );
  }
}
