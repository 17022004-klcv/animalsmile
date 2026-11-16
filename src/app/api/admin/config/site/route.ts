import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  crearConfigSitio,
  guardarConfigSitio,
  listarConfigSitio,
} from "@/src/services/config/config-server";
import {
  parseConfigSitioInput,
  parseConfiguracionSitioLote,
} from "@/src/services/config/config-validation";

export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const configuraciones = await listarConfigSitio();
    return NextResponse.json({ configuraciones });
  } catch (error) {
    console.error("Error al obtener la configuración del sitio:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la configuración del sitio." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parseo = parseConfiguracionSitioLote(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const configuraciones = await guardarConfigSitio(
      parseo.valor.configuraciones,
      session.sub,
    );
    return NextResponse.json({ configuraciones });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error al guardar la configuración del sitio:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la configuración del sitio." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const parseo = parseConfigSitioInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const configuracion = await crearConfigSitio(parseo.valor, session.sub);
    return NextResponse.json({ configuracion }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error al crear la configuración del sitio:", error);
    return NextResponse.json(
      { error: "No se pudo crear la configuración del sitio." },
      { status: 500 },
    );
  }
}
