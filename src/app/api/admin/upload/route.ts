import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/src/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.rol !== "Administrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    
    if (!files.length) {
      return NextResponse.json({ error: "No hay archivos." }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "uploads", "animals");
    await mkdir(dir, { recursive: true });

    const urls: string[] = [];
    for (const f of files) {
      if (!(f instanceof File)) continue;
      if (!ALLOWED.includes(f.type)) {
        return NextResponse.json({ error: `Tipo no permitido: ${f.type}` }, { status: 400 });
      }
      if (f.size > MAX) {
        return NextResponse.json({ error: "Archivo demasiado grande (máx 5MB)." }, { status: 400 });
      }

      const ext = path.extname(f.name) || ".jpg";
      const name = `${randomUUID()}${ext.toLowerCase()}`;
      const buf = Buffer.from(await f.arrayBuffer());
      await writeFile(path.join(dir, name), buf);
      urls.push(`/uploads/animals/${name}`);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Error al subir archivos:", error);
    return NextResponse.json({ error: "No se pudieron subir los archivos." }, { status: 500 });
  }
}
