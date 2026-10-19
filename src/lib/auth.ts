import { cookies } from "next/headers";
import { prisma } from "./prisma";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./session";

export async function setSessionCookie(
  payload: Omit<SessionPayload, "exp">,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

type AccesoEvento = {
  idUsuario?: string | null;
  emailIntentado?: string | null;
  tipoEvento: "Login" | "Logout" | "Login_Fallido" | "Bloqueo_Cuenta" | "Cambio_Password";
  ipOrigen?: string | null;
  userAgent?: string | null;
  exito?: boolean;
  detalle?: string | null;
};

export async function registrarAcceso(evento: AccesoEvento): Promise<void> {
  try {
    await prisma.bitacoraAcceso.create({
      data: {
        id_usuario: evento.idUsuario ?? null,
        email_intentado: evento.emailIntentado ?? null,
        tipo_evento: evento.tipoEvento,
        ip_origen: evento.ipOrigen ?? null,
        user_agent: evento.userAgent ?? null,
        exito: evento.exito ?? true,
        detalle: evento.detalle ?? null,
      },
    });
  } catch (error) {
    console.error("No se pudo registrar el acceso en bitácora:", error);
  }
}
