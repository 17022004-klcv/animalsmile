-- CreateEnum
CREATE TYPE "TipoConsulta" AS ENUM ('Vacunacion', 'Desparasitacion', 'Medicacion', 'Enfermedad', 'Consulta_General', 'Cirugia', 'Examen', 'Seguimiento', 'Otro');

-- CreateTable
CREATE TABLE "vacunas" (
    "id_vacuna" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "id_especie" INTEGER,
    "id_taxonomia" INTEGER,
    "descripcion" TEXT,
    "edad_minima_meses" INTEGER,
    "intervalo_dias" INTEGER,
    "dosis_recomendada" VARCHAR(120),
    "activa" BOOLEAN DEFAULT true,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacunas_pkey" PRIMARY KEY ("id_vacuna")
);

-- CreateTable
CREATE TABLE "vacunas_aplicadas" (
    "id_aplicacion" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_consulta" UUID NOT NULL,
    "id_vacuna" INTEGER NOT NULL,
    "lote" VARCHAR(60),
    "fecha_aplicacion" DATE,
    "proxima_dosis" DATE,
    "observaciones" TEXT,

    CONSTRAINT "vacunas_aplicadas_pkey" PRIMARY KEY ("id_aplicacion")
);

-- CreateTable
CREATE TABLE "medicamentos" (
    "id_medicamento" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" TEXT,
    "vias" VARCHAR(150),
    "activo" BOOLEAN DEFAULT true,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicamentos_pkey" PRIMARY KEY ("id_medicamento")
);

-- CreateTable
CREATE TABLE "medicamentos_aplicados" (
    "id_aplicacion" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_consulta" UUID NOT NULL,
    "id_medicamento" INTEGER NOT NULL,
    "dosis" VARCHAR(100),
    "via_administracion" VARCHAR(50),
    "fecha_aplicacion" DATE,
    "observaciones" TEXT,

    CONSTRAINT "medicamentos_aplicados_pkey" PRIMARY KEY ("id_aplicacion")
);

-- CreateTable
CREATE TABLE "enfermedades" (
    "id_enfermedad" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" TEXT,
    "es_contagiosa" BOOLEAN DEFAULT false,
    "requiere_aislamiento" BOOLEAN DEFAULT false,
    "activa" BOOLEAN DEFAULT true,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "enfermedades_pkey" PRIMARY KEY ("id_enfermedad")
);

-- CreateTable
CREATE TABLE "consultas" (
    "id_consulta" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_expediente" UUID NOT NULL,
    "id_veterinario" UUID,
    "id_enfermedad" INTEGER,
    "fecha_consulta" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "tipo_consulta" "TipoConsulta" NOT NULL DEFAULT 'Consulta_General',
    "motivo" TEXT NOT NULL,
    "diagnostico" TEXT,
    "tratamiento" TEXT,
    "peso_kg" DECIMAL(6,2),
    "proxima_cita" DATE,
    "observaciones" TEXT,
    "registrado_por" UUID,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id_consulta")
);

-- CreateIndex
CREATE UNIQUE INDEX "vacunas_nombre_key" ON "vacunas"("nombre");

-- CreateIndex
CREATE INDEX "vacunas_aplicadas_id_consulta_idx" ON "vacunas_aplicadas"("id_consulta");

-- CreateIndex
CREATE UNIQUE INDEX "medicamentos_nombre_key" ON "medicamentos"("nombre");

-- CreateIndex
CREATE INDEX "medicamentos_aplicados_id_consulta_idx" ON "medicamentos_aplicados"("id_consulta");

-- CreateIndex
CREATE UNIQUE INDEX "enfermedades_nombre_key" ON "enfermedades"("nombre");

-- CreateIndex
CREATE INDEX "consultas_id_expediente_idx" ON "consultas"("id_expediente");

-- CreateIndex
CREATE INDEX "consultas_fecha_consulta_idx" ON "consultas"("fecha_consulta");

-- AddForeignKey
ALTER TABLE "vacunas" ADD CONSTRAINT "vacunas_id_especie_fkey" FOREIGN KEY ("id_especie") REFERENCES "especies"("id_especie") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacunas" ADD CONSTRAINT "vacunas_id_taxonomia_fkey" FOREIGN KEY ("id_taxonomia") REFERENCES "taxonomias"("id_taxonomia") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacunas_aplicadas" ADD CONSTRAINT "vacunas_aplicadas_id_consulta_fkey" FOREIGN KEY ("id_consulta") REFERENCES "consultas"("id_consulta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacunas_aplicadas" ADD CONSTRAINT "vacunas_aplicadas_id_vacuna_fkey" FOREIGN KEY ("id_vacuna") REFERENCES "vacunas"("id_vacuna") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos_aplicados" ADD CONSTRAINT "medicamentos_aplicados_id_consulta_fkey" FOREIGN KEY ("id_consulta") REFERENCES "consultas"("id_consulta") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicamentos_aplicados" ADD CONSTRAINT "medicamentos_aplicados_id_medicamento_fkey" FOREIGN KEY ("id_medicamento") REFERENCES "medicamentos"("id_medicamento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_id_expediente_fkey" FOREIGN KEY ("id_expediente") REFERENCES "expedientes_medicos"("id_expediente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_id_veterinario_fkey" FOREIGN KEY ("id_veterinario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_id_enfermedad_fkey" FOREIGN KEY ("id_enfermedad") REFERENCES "enfermedades"("id_enfermedad") ON DELETE SET NULL ON UPDATE CASCADE;
