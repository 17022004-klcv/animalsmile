import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { ErrorServicio } from "@/src/services/common/errors";
import {
  listarBackups,
  parseFiltroBackupDesdeUrl,
  registrarBackup,
} from "@/src/services/security/security-server";
import { parseBackupInput } from "@/src/services/security/security-validation";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const filtro = parseFiltroBackupDesdeUrl(request.url);
    const backups = await listarBackups(filtro);
    return NextResponse.json({ backups });
  } catch (error) {
    console.error("Error al obtener los backups:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los backups." },
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

  const parseo = parseBackupInput(body);
  if (!parseo.ok) {
    return NextResponse.json({ error: parseo.error }, { status: 400 });
  }

  try {
    const backup = await registrarBackup(parseo.valor, session.sub);
    return NextResponse.json({ backup }, { status: 201 });
  } catch (error) {
    if (error instanceof ErrorServicio) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    console.error("Error al registrar el backup:", error);
    return NextResponse.json(
      { error: "No se pudo registrar el backup." },
      { status: 500 },
    );
  }
}
