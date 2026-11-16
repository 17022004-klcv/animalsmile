import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// =============================================================================
// CATÁLOGOS MÉDICOS (vacunas por especie, medicamentos y enfermedades)
// =============================================================================

type VacunaCatalogo = {
  nombre: string;
  descripcion: string;
  especie?: string;
  taxonomia?: string;
  edad_minima_meses: number;
  intervalo_dias: number;
  dosis_recomendada: string;
};

const VACUNAS: VacunaCatalogo[] = [
  {
    nombre: "Antirábica",
    descripcion:
      "Vacuna inactivada contra la rabia. Refuerzo anual en la mayoría de especies.",
    taxonomia: "Mamifero",
    edad_minima_meses: 3,
    intervalo_dias: 365,
    dosis_recomendada: "1 ml IM/SC",
  },
  {
    nombre: "Polivalente Canina (DHPP)",
    descripcion:
      "Distemper, hepatitis infecciosa, parainfluenza y parvovirus canino. Refuerzo anual.",
    especie: "Perro",
    edad_minima_meses: 2,
    intervalo_dias: 365,
    dosis_recomendada: "1 ml SC",
  },
  {
    nombre: "Parvovirus Canino (monovalente)",
    descripcion: "Vacuna monovalente contra parvovirus canino.",
    especie: "Perro",
    edad_minima_meses: 2,
    intervalo_dias: 365,
    dosis_recomendada: "1 ml SC",
  },
  {
    nombre: "Bordetella (Tos de las Peredas)",
    descripcion: "Prevención de la tos de las perreras por Bordetella bronchiseptica.",
    especie: "Perro",
    edad_minima_meses: 3,
    intervalo_dias: 365,
    dosis_recomendada: "0.5 ml IN o SC",
  },
  {
    nombre: "Leptospirosis",
    descripcion:
      "Protección contra leptospirosis (serovares canis e icterohaemorrhagiae).",
    especie: "Perro",
    edad_minima_meses: 3,
    intervalo_dias: 365,
    dosis_recomendada: "1 ml SC",
  },
  {
    nombre: "Triple Felina (FVRCP)",
    descripcion:
      "Fiebre, moquillo y panleucopenia felina. Refuerzo anual.",
    especie: "Gato",
    edad_minima_meses: 2,
    intervalo_dias: 365,
    dosis_recomendada: "1 ml SC",
  },
  {
    nombre: "Leucemia Felina (FeLV)",
    descripcion:
      "Indicada en gatos de riesgo, con contacto con gatos de vida libre o camadas.",
    especie: "Gato",
    edad_minima_meses: 2,
    intervalo_dias: 365,
    dosis_recomendada: "1 ml SC",
  },
  {
    nombre: "Mixomatosis",
    descripcion: "Prevención de la mixomatosis en conejos.",
    especie: "Conejo",
    edad_minima_meses: 2,
    intervalo_dias: 365,
    dosis_recomendada: "1 ml SC",
  },
  {
    nombre: "Hemorragia Viral del Conejo (Heno)",
    descripcion: "Prevención de la enfermedad hemorrágica viral del conejo.",
    especie: "Conejo",
    edad_minima_meses: 2,
    intervalo_dias: 365,
    dosis_recomendada: "1 ml SC",
  },
  {
    nombre: "Newcastle (Bronquitis Infecciosa)",
    descripcion: "Prevención de la enfermedad de Newcastle en aves.",
    taxonomia: "Aves",
    edad_minima_meses: 1,
    intervalo_dias: 180,
    dosis_recomendada: "0.5 ml SC",
  },
];

type MedicamentoCatalogo = {
  nombre: string;
  descripcion: string;
  vias: string;
};

const MEDICAMENTOS: MedicamentoCatalogo[] = [
  {
    nombre: "Ivermectina (Inyectable)",
    descripcion: "Antiparasitario de amplio espectro para uso_parenteral.",
    vias: "Inyectable",
  },
  {
    nombre: "Ivermectina (Spot On)",
    descripcion: "Antiparasitario externo de aplicación cutánea.",
    vias: "Tópico",
  },
  {
    nombre: "Moxidectina (Inyectable)",
    descripcion: "Antiparasitario inyectable de acción prolongada.",
    vias: "Inyectable",
  },
  {
    nombre: "Selamectina (Spot On)",
    descripcion: "Antiparasitario externo (piojos, garrapatas, ácaros).",
    vias: "Tópico",
  },
  {
    nombre: "Fipronil (Spot On)",
    descripcion: "Antiparasitario externo (pulgas y garrapatas).",
    vias: "Tópico",
  },
  {
    nombre: "Pyrantel Pamoato (Oral)",
    descripcion: "Antiparasitario intestinal de amplio espectro.",
    vias: "Oral",
  },
  {
    nombre: "Milbemycina Oxima (Oral)",
    descripcion: "Antiparasitario oral (gusanos, ácaros, piojos).",
    vias: "Oral",
  },
  {
    nombre: "Febantel (Oral)",
    descripcion: "Antiparasitario oral de amplio espectro.",
    vias: "Oral",
  },
  {
    nombre: "Oxibendazol (Oral)",
    descripcion: "Antiparasitario benzimidazol.",
    vias: "Oral",
  },
  {
    nombre: "Amoxicilina (Oral)",
    descripcion: "Antibiótico betalactámico de amplio espectro.",
    vias: "Oral",
  },
  {
    nombre: "Amoxicilina + Ácido Clavulánico (Oral)",
    descripcion: "Antibiótico de amplio espectro con inhibidor de beta-lactamasa.",
    vias: "Oral",
  },
  {
    nombre: "Doxiciclina (Oral)",
    descripcion: "Antibiótico tetraciclina indicado en enfermedades infecciosas.",
    vias: "Oral",
  },
  {
    nombre: "Enrofloxacina (Oral)",
    descripcion: "Antibiótico fluoroquinolona.",
    vias: "Oral",
  },
  {
    nombre: "Metronidazol (Oral)",
    descripcion: "Antibiótico y antiprotozoario.",
    vias: "Oral",
  },
  {
    nombre: "Azitromicina (Oral)",
    descripcion: "Antibiótico macrólido.",
    vias: "Oral",
  },
  {
    nombre: "Trimetoprim-Sulfametoxazol (Oral)",
    descripcion: "Antibiótico de amplio espectro.",
    vias: "Oral",
  },
  {
    nombre: "Ceftriaxona (Inyectable)",
    descripcion: "Antibiótico cefalosporina de tercera generación.",
    vias: "Inyectable",
  },
  {
    nombre: "Penicilina G (Inyectable)",
    descripcion: "Antibiótico penicilinico.",
    vias: "Inyectable",
  },
  {
    nombre: "Itraconazol (Oral)",
    descripcion: "Antifúngico triazol.",
    vias: "Oral",
  },
  {
    nombre: "Ketoconazol (Oral)",
    descripcion: "Antifúngico imidazol.",
    vias: "Oral",
  },
  {
    nombre: "Terbinafina (Oral)",
    descripcion: "Antifúngico indicado en dermatofitosis.",
    vias: "Oral",
  },
  {
    nombre: "Prednisolona (Oral)",
    descripcion: "Antiinflamatorio corticoesteroide.",
    vias: "Oral",
  },
  {
    nombre: "Meloxicam (Oral)",
    descripcion: "Antiinflamatorio no esteroideo (AINE).",
    vias: "Oral",
  },
  {
    nombre: "Meloxicam (Inyectable)",
    descripcion: "Antiinflamatorio no esteroideo (AINE).",
    vias: "Inyectable",
  },
  {
    nombre: "Flunixin (Inyectable)",
    descripcion: "Analgésico y antiinflamatorio no esteroideo.",
    vias: "Inyectable",
  },
  {
    nombre: "Dexametasona (Inyectable)",
    descripcion: "Corticoesteroide.",
    vias: "Inyectable",
  },
  {
    nombre: "Ketamina (Inyectable)",
    descripcion: "Anestésico y sedante.",
    vias: "Inyectable",
  },
  {
    nombre: "Propofol (Inyectable)",
    descripcion: "Anestésico general de inicio y mantenimiento rápido.",
    vias: "Inyectable",
  },
  {
    nombre: "Atropina (Inyectable)",
    descripcion: "Anticolinérgico y antiespasmódico.",
    vias: "Inyectable",
  },
  {
    nombre: "Ondansetrón (Inyectable)",
    descripcion: "Antioclásico para el control de vómitos.",
    vias: "Inyectable",
  },
  {
    nombre: "Tramadol (Oral)",
    descripcion: "Analgésico opioide para dolor moderado a intenso.",
    vias: "Oral",
  },
  {
    nombre: "Gabapentina (Oral)",
    descripcion: "Analgésico y modulador del dolor crónico.",
    vias: "Oral",
  },
  {
    nombre: "Complejo B (Inyectable)",
    descripcion: "Suplemento vitamínico del complejo B.",
    vias: "Inyectable",
  },
  {
    nombre: "Vitaminas Multivitamínicas (Inyectable)",
    descripcion: "Suplemento vitamínico general.",
    vias: "Inyectable",
  },
  {
    nombre: "Tiamina (Vitamina B1) (Inyectable)",
    descripcion: "Suplemento de tiamina.",
    vias: "Inyectable",
  },
  {
    nombre: "Suero Fisiológico 0.9% (Inyectable)",
    descripcion: "Fluidoterapia: reposición de volumen.",
    vias: "Inyectable",
  },
  {
    nombre: "Ringer Lactato (Inyectable)",
    descripcion: "Fluidoterapia: reposición de volumen y electrolitos.",
    vias: "Inyectable",
  },
  {
    nombre: "Dextrosa 5% (Inyectable)",
    descripcion: "Fluidoterapia: aporte de glucosa.",
    vias: "Inyectable",
  },
  {
    nombre: "Gluconato de Calcio (Inyectable)",
    descripcion: "Suplemento de calcio.",
    vias: "Inyectable",
  },
  {
    nombre: "Adrenalina (Epinefrina) (Inyectable)",
    descripcion: "Uso en emergencias (shock anafiláctico, parada cardiaca).",
    vias: "Inyectable",
  },
];

type EnfermedadCatalogo = {
  nombre: string;
  descripcion: string;
  es_contagiosa?: boolean;
  requiere_aislamiento?: boolean;
};

const ENFERMEDADES: EnfermedadCatalogo[] = [
  {
    nombre: "Parvovirus Canino",
    descripcion: "Enteritis viral hemorrágica, requiere aislamiento estricto.",
    es_contagiosa: true,
    requiere_aislamiento: true,
  },
  {
    nombre: "Distemper Canino",
    descripcion: "Enfermedad viral multisistémica.",
    es_contagiosa: true,
    requiere_aislamiento: true,
  },
  {
    nombre: "Parainfluenza Canina",
    descripcion: "Infección respiratoria superior.",
    es_contagiosa: true,
  },
  {
    nombre: "Bordetellosis",
    descripcion: "Tos de las perreras.",
    es_contagiosa: true,
  },
  {
    nombre: "Leptospirosis",
    descripcion: "Enfermedad bacteriana con afectación renal y hepática.",
    es_contagiosa: true,
  },
  {
    nombre: "Rabia",
    descripcion: "Enfermedad viralzoozoótica, requiere notificación y aislamiento.",
    es_contagiosa: true,
    requiere_aislamiento: true,
  },
  {
    nombre: "Moquillo Felino (FVRCP)",
    descripcion: "Rinoconjuntivitis y estomatitis felina.",
    es_contagiosa: true,
  },
  {
    nombre: "Panleucopenia Felina",
    descripcion: "Parvovirus felino, enteritis infecciosa.",
    es_contagiosa: true,
    requiere_aislamiento: true,
  },
  {
    nombre: "Leucemia Felina (FeLV)",
    descripcion: "Retrovirus felino, requiere aislamiento.",
    es_contagiosa: true,
    requiere_aislamiento: true,
  },
  {
    nombre: "Mixomatosis",
    descripcion: "Enfermedad viral del conejo con不完encias.",
    es_contagiosa: true,
  },
  {
    nombre: "Hemorragia Viral del Conejo (Heno)",
    descripcion: "Enfermedad hemorrágica viral del conejo.",
    es_contagiosa: true,
  },
  {
    nombre: "Newcastle (Bronquitis Infecciosa)",
    descripcion: "Enfermedad viral de las aves.",
    es_contagiosa: true,
    requiere_aislamiento: true,
  },
  {
    nombre: "Dermatofitosis (Tiña)",
    descripcion: "Infección por hongos dermatofitos con lesiones cutáneas.",
    es_contagiosa: true,
  },
  {
    nombre: "Sarna (Ácaros)",
    descripcion: "Parasitosis cutánea por ácaros.",
    es_contagiosa: true,
  },
  {
    nombre: "Otitis Externa",
    descripcion: "Inflamación del conducto auditivo externo.",
  },
  {
    nombre: "Gastroenteritis Infecciosa",
    descripcion: "Diarrea aguda de origen infeccioso.",
  },
  {
    nombre: "Infección Urinaria / Cistitis",
    descripcion: "Afectación del tracto urinario inferior.",
  },
  {
    nombre: "Ectoparásitos (Pulgas y Garrapatas)",
    descripcion: "Infestación por ectoparásitos.",
  },
  {
    nombre: "Anemia",
    descripcion: "Disminución de la concentración de hemoglobina.",
  },
  {
    nombre: "Deshidratación",
    descripcion: "Déficit de líquidos corporales.",
  },
  {
    nombre: "Heridas y Traumatismos",
    descripcion: "Lesiones por mordedura, atropello o caída.",
  },
  {
    nombre: "Fracturas",
    descripcion: "Ruptura de hueso por traumatismo.",
  },
  {
    nombre: "Neoplasia / Tumores",
    descripcion: "Crecimiento celular anómalo.",
  },
  {
    nombre: "Convulsiones",
    descripcion: "Alteración neurologica con movimientos involuntarios.",
  },
  {
    nombre: "Dermatitis Alérgica",
    descripcion: "Reacción inflamatoria de la piel de origen alergénico.",
  },
  {
    nombre: "Asma Felino",
    descripcion: "Bronquitis crónica hipersensible en gatos.",
  },
  {
    nombre: "Enfermedad Renal Crónica",
    descripcion: "Pérdida progresiva de la función renal.",
  },
  {
    nombre: "Diabetes Mellitus",
    descripcion: "Alteración del metabolismo de la glucosa.",
  },
  {
    nombre: "Pancreatitis",
    descripcion: "Inflamación del páncreas.",
  },
  {
    nombre: "Mastitis",
    descripcion: "Inflamación de la ubre o glándula mamaria.",
  },
  {
    nombre: "Obesidad",
    descripcion: "Exceso de grasa corporal.",
  },
  {
    nombre: "Hernia Umbilical",
    descripcion: "Protrusión de vísceras a través del ombligo.",
  },
  {
    nombre: "Coccidiosis",
    descripcion: "Parasitosis intestinal por coccidios.",
  },
];

async function sembrarCatalogos() {
  const especies = await prisma.especie.findMany({
    select: { id_especie: true, nombre_comun: true },
  });
  const taxonomias = await prisma.taxonomia.findMany({
    select: { id_taxonomia: true, nombre_clase: true },
  });

  const idEspecie = new Map(
    especies.map((e) => [e.nombre_comun.toLowerCase(), e.id_especie]),
  );
  const idTaxonomia = new Map(
    taxonomias.map((t) => [t.nombre_clase.toLowerCase(), t.id_taxonomia]),
  );

  let vacunasCreadas = 0;
  for (const vacuna of VACUNAS) {
    const especie = vacuna.especie
      ? idEspecie.get(vacuna.especie.toLowerCase())
      : undefined;
    const taxonomia = vacuna.taxonomia
      ? idTaxonomia.get(vacuna.taxonomia.toLowerCase())
      : undefined;

    if (vacuna.especie && !especie) {
      console.warn(`Especie no encontrada para la vacuna: ${vacuna.especie}`);
      continue;
    }
    if (vacuna.taxonomia && !taxonomia) {
      console.warn(`Taxonomía no encontrada para la vacuna: ${vacuna.taxonomia}`);
      continue;
    }

    await prisma.vacuna.upsert({
      where: { nombre: vacuna.nombre },
      create: {
        nombre: vacuna.nombre,
        descripcion: vacuna.descripcion,
        id_especie: especie ?? null,
        id_taxonomia: taxonomia ?? null,
        edad_minima_meses: vacuna.edad_minima_meses,
        intervalo_dias: vacuna.intervalo_dias,
        dosis_recomendada: vacuna.dosis_recomendada,
        activa: true,
      },
      update: {
        descripcion: vacuna.descripcion,
        id_especie: especie ?? null,
        id_taxonomia: taxonomia ?? null,
        edad_minima_meses: vacuna.edad_minima_meses,
        intervalo_dias: vacuna.intervalo_dias,
        dosis_recomendada: vacuna.dosis_recomendada,
        activa: true,
      },
    });
    vacunasCreadas += 1;
  }

  let medicamentosCreados = 0;
  for (const medicamento of MEDICAMENTOS) {
    await prisma.medicamento.upsert({
      where: { nombre: medicamento.nombre },
      create: {
        nombre: medicamento.nombre,
        descripcion: medicamento.descripcion,
        vias: medicamento.vias,
        activo: true,
      },
      update: {
        descripcion: medicamento.descripcion,
        vias: medicamento.vias,
        activo: true,
      },
    });
    medicamentosCreados += 1;
  }

  let enfermedadesCreadas = 0;
  for (const enfermedad of ENFERMEDADES) {
    await prisma.enfermedad.upsert({
      where: { nombre: enfermedad.nombre },
      create: {
        nombre: enfermedad.nombre,
        descripcion: enfermedad.descripcion,
        es_contagiosa: enfermedad.es_contagiosa ?? false,
        requiere_aislamiento: enfermedad.requiere_aislamiento ?? false,
        activa: true,
      },
      update: {
        descripcion: enfermedad.descripcion,
        es_contagiosa: enfermedad.es_contagiosa ?? false,
        requiere_aislamiento: enfermedad.requiere_aislamiento ?? false,
        activa: true,
      },
    });
    enfermedadesCreadas += 1;
  }

  console.log(
    `Catálogos: ${vacunasCreadas} vacunas, ${medicamentosCreados} medicamentos, ${enfermedadesCreadas} enfermedades.`,
  );
}

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
  } else {
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

  await sembrarCatalogos();
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
