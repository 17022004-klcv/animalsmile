import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@animalsmile.org";
  const password = process.env.ADMIN_PASSWORD ?? "Admin12345";
  const nombre = process.env.ADMIN_NOMBRE ?? "Administrador";
  const apellido = process.env.ADMIN_APELLIDO ?? "Sistema";

  const emailLimpio = email.trim().toLowerCase();

  const existente = await prisma.usuario.findUnique({
    where: { email: emailLimpio },
  });

  if (existente) {
    const hashed = await bcrypt.hash(password, 10);
    await prisma.usuario.update({
      where: { id_usuario: existente.id_usuario },
      data: {
        password_hash: hashed,
        rol: "Administrador",
        activo: true,
      },
    });
    console.log(`Admin actualizado: ${emailLimpio}`);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.usuario.create({
    data: {
      nombre,
      apellido,
      email: emailLimpio,
      password_hash: hashed,
      rol: "Administrador",
      activo: true,
    },
  });
  console.log(`Admin creado: ${emailLimpio} (password: ${password})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
