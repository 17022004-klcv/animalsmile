-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('Administrador', 'Veterinario', 'Encargado_Adopciones', 'Voluntario');

-- CreateEnum
CREATE TYPE "EstadoAnimal" AS ENUM ('En_Cuarentena', 'Disponible_Adopcion', 'En_Tratamiento', 'Trasladado', 'Adoptado', 'Fallecido');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('Pendiente', 'En_Evaluacion', 'Entrevista_Domiciliaria', 'Aprobada', 'Rechazada');

-- CreateEnum
CREATE TYPE "TipoDonacion" AS ENUM ('Financiera', 'Alimentos', 'Medicamentos', 'Higiene_Limpieza', 'Equipamiento_Otros');

-- CreateEnum
CREATE TYPE "TipoEventoAcceso" AS ENUM ('Login', 'Logout', 'Login_Fallido', 'Bloqueo_Cuenta', 'Cambio_Password');

-- CreateEnum
CREATE TYPE "OperacionAuditoria" AS ENUM ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE');

-- CreateEnum
CREATE TYPE "TipoBackup" AS ENUM ('Completo', 'Incremental', 'Diferencial');

-- CreateEnum
CREATE TYPE "EstadoBackup" AS ENUM ('En_Proceso', 'Completado', 'Fallido', 'Restaurado');

-- CreateEnum
CREATE TYPE "AccionBitacora" AS ENUM ('Creacion', 'Actualizacion', 'Cambio_Estado', 'Asignacion_Animal', 'Adjunto_Foto', 'Eliminacion', 'Restauracion', 'Verificacion', 'Descarga');

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'Voluntario',
    "telefono" VARCHAR(20),
    "activo" BOOLEAN DEFAULT true,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "taxonomias" (
    "id_taxonomia" SERIAL NOT NULL,
    "nombre_clase" VARCHAR(50) NOT NULL,

    CONSTRAINT "taxonomias_pkey" PRIMARY KEY ("id_taxonomia")
);

-- CreateTable
CREATE TABLE "especies" (
    "id_especie" SERIAL NOT NULL,
    "id_taxonomia" INTEGER NOT NULL,
    "nombre_comun" VARCHAR(100) NOT NULL,
    "es_domestico" BOOLEAN DEFAULT true,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "especies_pkey" PRIMARY KEY ("id_especie")
);

-- CreateTable
CREATE TABLE "rescates" (
    "id_rescate" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fecha_rescate" DATE NOT NULL,
    "ubicacion_hallazgo" TEXT NOT NULL,
    "nombre_rescatista" VARCHAR(150),
    "contacto_rescatista" VARCHAR(100),
    "condicion_inicial" TEXT NOT NULL,
    "fotos_ingreso" JSONB,
    "creado_por" UUID,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rescates_pkey" PRIMARY KEY ("id_rescate")
);

-- CreateTable
CREATE TABLE "animales" (
    "id_animal" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo_identificador" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "id_especie" INTEGER NOT NULL,
    "id_rescate" UUID,
    "raza_variedad" VARCHAR(100) DEFAULT 'Mestizo / No especificada',
    "edad_estimada_meses" INTEGER,
    "temperamento" TEXT,
    "nivel_energia" VARCHAR(30),
    "compatibilidad" JSONB,
    "estado" "EstadoAnimal" NOT NULL DEFAULT 'En_Cuarentena',
    "foto_principal" VARCHAR(255),
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "animales_pkey" PRIMARY KEY ("id_animal")
);

-- CreateTable
CREATE TABLE "expedientes_medicos" (
    "id_expediente" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_animal" UUID NOT NULL,
    "esterilizado" BOOLEAN DEFAULT false,
    "fecha_esterilizacion" DATE,
    "observaciones_generales" TEXT,
    "actualizado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expedientes_medicos_pkey" PRIMARY KEY ("id_expediente")
);

-- CreateTable
CREATE TABLE "historial_clinico" (
    "id_historial" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_expediente" UUID NOT NULL,
    "id_veterinario" UUID,
    "fecha_consulta" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "tipo_registro" VARCHAR(50) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "diagnostico" TEXT,
    "tratamiento" TEXT,
    "proxima_cita" DATE,

    CONSTRAINT "historial_clinico_pkey" PRIMARY KEY ("id_historial")
);

-- CreateTable
CREATE TABLE "solicitantes" (
    "id_solicitante" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documento_identidad" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "apellido" VARCHAR(100) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "direccion" TEXT NOT NULL,
    "tipo_vivienda" VARCHAR(50),
    "tiene_mascotas" BOOLEAN DEFAULT false,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitantes_pkey" PRIMARY KEY ("id_solicitante")
);

-- CreateTable
CREATE TABLE "solicitudes_adopcion" (
    "id_solicitud" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_solicitante" UUID NOT NULL,
    "id_animal" UUID NOT NULL,
    "fecha_solicitud" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoSolicitud" NOT NULL DEFAULT 'Pendiente',
    "evaluador_id" UUID,
    "notas_evaluacion" TEXT,
    "actualizado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_adopcion_pkey" PRIMARY KEY ("id_solicitud")
);

-- CreateTable
CREATE TABLE "adopciones" (
    "id_adopcion" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_solicitud" UUID NOT NULL,
    "fecha_adopcion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contrato_firmado_url" VARCHAR(255),
    "encargado_id" UUID,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adopciones_pkey" PRIMARY KEY ("id_adopcion")
);

-- CreateTable
CREATE TABLE "seguimientos_post_adopcion" (
    "id_seguimiento" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_adopcion" UUID NOT NULL,
    "num_mes" INTEGER NOT NULL,
    "fecha_programada" DATE NOT NULL,
    "fecha_realizada" DATE,
    "estado_evaluacion" VARCHAR(50),
    "observaciones" TEXT,
    "evidencias_fotos" JSONB,
    "realizado_por" UUID,

    CONSTRAINT "seguimientos_post_adopcion_pkey" PRIMARY KEY ("id_seguimiento")
);

-- CreateTable
CREATE TABLE "santuarios" (
    "id_santuario" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(150) NOT NULL,
    "contacto_principal" VARCHAR(100),
    "telefono" VARCHAR(20),
    "email" VARCHAR(150),
    "direccion" TEXT,
    "tipo_fauna_permitida" TEXT,
    "creado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "santuarios_pkey" PRIMARY KEY ("id_santuario")
);

-- CreateTable
CREATE TABLE "traslados" (
    "id_traslado" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_animal" UUID NOT NULL,
    "id_santuario" UUID NOT NULL,
    "fecha_traslado" TIMESTAMP NOT NULL,
    "motivo" TEXT NOT NULL,
    "responsable_transporte" VARCHAR(150),
    "estado_salida" TEXT,
    "estado_llegada" TEXT,
    "registrado_por" UUID,

    CONSTRAINT "traslados_pkey" PRIMARY KEY ("id_traslado")
);

-- CreateTable
CREATE TABLE "donaciones" (
    "id_donacion" UUID NOT NULL DEFAULT gen_random_uuid(),
    "donante_nombre" VARCHAR(150) DEFAULT 'Anónimo',
    "donante_email" VARCHAR(150),
    "tipo" "TipoDonacion" NOT NULL,
    "monto" DECIMAL(10,2),
    "metodo_pago" VARCHAR(50),
    "cantidad" DECIMAL(10,2),
    "unidad_medida" VARCHAR(30),
    "descripcion_detalle" TEXT,
    "comprobante_url" VARCHAR(255),
    "fecha_donacion" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "registrado_por" UUID,

    CONSTRAINT "donaciones_pkey" PRIMARY KEY ("id_donacion")
);

-- CreateTable
CREATE TABLE "bitacora_accesos" (
    "id_acceso" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_usuario" UUID,
    "email_intentado" VARCHAR(150),
    "tipo_evento" "TipoEventoAcceso" NOT NULL,
    "ip_origen" VARCHAR(45),
    "user_agent" TEXT,
    "exito" BOOLEAN NOT NULL DEFAULT true,
    "detalle" TEXT,
    "fecha_evento" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_accesos_pkey" PRIMARY KEY ("id_acceso")
);

-- CreateTable
CREATE TABLE "bitacora_rescates" (
    "id_bitacora_rescate" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_rescate" UUID NOT NULL,
    "id_usuario" UUID,
    "accion" "AccionBitacora" NOT NULL,
    "descripcion" TEXT,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "fecha_evento" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_rescates_pkey" PRIMARY KEY ("id_bitacora_rescate")
);

-- CreateTable
CREATE TABLE "bitacora_auditoria" (
    "id_auditoria" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_usuario" UUID,
    "tabla_afectada" VARCHAR(100) NOT NULL,
    "id_registro_afectado" UUID,
    "operacion" "OperacionAuditoria" NOT NULL,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "ip_origen" VARCHAR(45),
    "fecha_evento" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_auditoria_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "backups" (
    "id_backup" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "ruta_almacenamiento" VARCHAR(500) NOT NULL,
    "tipo_backup" "TipoBackup" NOT NULL,
    "tamano_bytes" BIGINT,
    "hash_checksum" VARCHAR(128),
    "estado" "EstadoBackup" NOT NULL DEFAULT 'En_Proceso',
    "ejecutado_por" UUID,
    "es_automatico" BOOLEAN DEFAULT true,
    "fecha_inicio" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP,
    "detalle_error" TEXT,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id_backup")
);

-- CreateTable
CREATE TABLE "bitacora_backups" (
    "id_bitacora_backup" UUID NOT NULL DEFAULT gen_random_uuid(),
    "id_backup" UUID NOT NULL,
    "id_usuario" UUID,
    "accion" "AccionBitacora" NOT NULL,
    "descripcion" TEXT,
    "ip_origen" VARCHAR(45),
    "fecha_evento" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_backups_pkey" PRIMARY KEY ("id_bitacora_backup")
);

-- CreateTable
CREATE TABLE "configuracion_sistema" (
    "id_config" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clave" VARCHAR(100) NOT NULL,
    "valor" TEXT NOT NULL,
    "tipo_dato" VARCHAR(30) NOT NULL DEFAULT 'string',
    "descripcion" TEXT,
    "modulo" VARCHAR(50),
    "editable" BOOLEAN DEFAULT true,
    "actualizado_por" UUID,
    "actualizado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_sistema_pkey" PRIMARY KEY ("id_config")
);

-- CreateTable
CREATE TABLE "configuracion_sitio" (
    "id_config_sitio" UUID NOT NULL DEFAULT gen_random_uuid(),
    "clave" VARCHAR(100) NOT NULL,
    "valor" TEXT,
    "tipo_dato" VARCHAR(30) DEFAULT 'string',
    "seccion" VARCHAR(50),
    "descripcion" TEXT,
    "actualizado_por" UUID,
    "actualizado_en" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_sitio_pkey" PRIMARY KEY ("id_config_sitio")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "taxonomias_nombre_clase_key" ON "taxonomias"("nombre_clase");

-- CreateIndex
CREATE UNIQUE INDEX "animales_codigo_identificador_key" ON "animales"("codigo_identificador");

-- CreateIndex
CREATE UNIQUE INDEX "expedientes_medicos_id_animal_key" ON "expedientes_medicos"("id_animal");

-- CreateIndex
CREATE UNIQUE INDEX "solicitantes_documento_identidad_key" ON "solicitantes"("documento_identidad");

-- CreateIndex
CREATE UNIQUE INDEX "adopciones_id_solicitud_key" ON "adopciones"("id_solicitud");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sistema_clave_key" ON "configuracion_sistema"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sitio_clave_key" ON "configuracion_sitio"("clave");

-- AddForeignKey
ALTER TABLE "especies" ADD CONSTRAINT "especies_id_taxonomia_fkey" FOREIGN KEY ("id_taxonomia") REFERENCES "taxonomias"("id_taxonomia") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rescates" ADD CONSTRAINT "rescates_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animales" ADD CONSTRAINT "animales_id_especie_fkey" FOREIGN KEY ("id_especie") REFERENCES "especies"("id_especie") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "animales" ADD CONSTRAINT "animales_id_rescate_fkey" FOREIGN KEY ("id_rescate") REFERENCES "rescates"("id_rescate") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expedientes_medicos" ADD CONSTRAINT "expedientes_medicos_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "animales"("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_clinico" ADD CONSTRAINT "historial_clinico_id_expediente_fkey" FOREIGN KEY ("id_expediente") REFERENCES "expedientes_medicos"("id_expediente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_clinico" ADD CONSTRAINT "historial_clinico_id_veterinario_fkey" FOREIGN KEY ("id_veterinario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_adopcion" ADD CONSTRAINT "solicitudes_adopcion_id_solicitante_fkey" FOREIGN KEY ("id_solicitante") REFERENCES "solicitantes"("id_solicitante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_adopcion" ADD CONSTRAINT "solicitudes_adopcion_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "animales"("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_adopcion" ADD CONSTRAINT "solicitudes_adopcion_evaluador_id_fkey" FOREIGN KEY ("evaluador_id") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adopciones" ADD CONSTRAINT "adopciones_id_solicitud_fkey" FOREIGN KEY ("id_solicitud") REFERENCES "solicitudes_adopcion"("id_solicitud") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adopciones" ADD CONSTRAINT "adopciones_encargado_id_fkey" FOREIGN KEY ("encargado_id") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_post_adopcion" ADD CONSTRAINT "seguimientos_post_adopcion_id_adopcion_fkey" FOREIGN KEY ("id_adopcion") REFERENCES "adopciones"("id_adopcion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos_post_adopcion" ADD CONSTRAINT "seguimientos_post_adopcion_realizado_por_fkey" FOREIGN KEY ("realizado_por") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslados" ADD CONSTRAINT "traslados_id_animal_fkey" FOREIGN KEY ("id_animal") REFERENCES "animales"("id_animal") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslados" ADD CONSTRAINT "traslados_id_santuario_fkey" FOREIGN KEY ("id_santuario") REFERENCES "santuarios"("id_santuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslados" ADD CONSTRAINT "traslados_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_registrado_por_fkey" FOREIGN KEY ("registrado_por") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora_accesos" ADD CONSTRAINT "bitacora_accesos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora_rescates" ADD CONSTRAINT "bitacora_rescates_id_rescate_fkey" FOREIGN KEY ("id_rescate") REFERENCES "rescates"("id_rescate") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora_rescates" ADD CONSTRAINT "bitacora_rescates_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora_auditoria" ADD CONSTRAINT "bitacora_auditoria_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_ejecutado_por_fkey" FOREIGN KEY ("ejecutado_por") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora_backups" ADD CONSTRAINT "bitacora_backups_id_backup_fkey" FOREIGN KEY ("id_backup") REFERENCES "backups"("id_backup") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bitacora_backups" ADD CONSTRAINT "bitacora_backups_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_sistema" ADD CONSTRAINT "configuracion_sistema_actualizado_por_fkey" FOREIGN KEY ("actualizado_por") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_sitio" ADD CONSTRAINT "configuracion_sitio_actualizado_por_fkey" FOREIGN KEY ("actualizado_por") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- =============================================================================
-- FUNCIÓN GENÉRICA DE AUDITORÍA Y TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_auditar_cambio()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id uuid;
    v_ip text;
BEGIN
    BEGIN
        v_usuario_id := current_setting('app.current_user_id', true)::uuid;
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    BEGIN
        v_ip := current_setting('app.current_ip', true);
    EXCEPTION WHEN OTHERS THEN
        v_ip := NULL;
    END;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO bitacora_auditoria (
            id_usuario, tabla_afectada, id_registro_afectado,
            operacion, datos_nuevos, ip_origen
        ) VALUES (
            v_usuario_id, TG_TABLE_NAME, NEW.id_animal,
            'INSERT', to_jsonb(NEW), v_ip
        );
        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO bitacora_auditoria (
            id_usuario, tabla_afectada, id_registro_afectado,
            operacion, datos_anteriores, datos_nuevos, ip_origen
        ) VALUES (
            v_usuario_id, TG_TABLE_NAME, NEW.id_animal,
            'UPDATE', to_jsonb(OLD), to_jsonb(NEW), v_ip
        );
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO bitacora_auditoria (
            id_usuario, tabla_afectada, id_registro_afectado,
            operacion, datos_anteriores, ip_origen
        ) VALUES (
            v_usuario_id, TG_TABLE_NAME, OLD.id_animal,
            'DELETE', to_jsonb(OLD), v_ip
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql; 

CREATE OR REPLACE FUNCTION fn_auditar_cambio_generico()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id uuid;
    v_ip text;
    v_pk_field text := TG_ARGV[0];
    v_pk_value uuid;
    v_old jsonb;
    v_new jsonb;
BEGIN
    BEGIN
        v_usuario_id := current_setting('app.current_user_id', true)::uuid;
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    BEGIN
        v_ip := current_setting('app.current_ip', true);
    EXCEPTION WHEN OTHERS THEN
        v_ip := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        v_old := to_jsonb(OLD);
        v_pk_value := (v_old ->> v_pk_field)::uuid;
        INSERT INTO bitacora_auditoria (
            id_usuario, tabla_afectada, id_registro_afectado,
            operacion, datos_anteriores, ip_origen
        ) VALUES (
            v_usuario_id, TG_TABLE_NAME, v_pk_value,
            'DELETE', v_old, v_ip
        );
        RETURN OLD;
    ELSE
        v_new := to_jsonb(NEW);
        v_pk_value := (v_new ->> v_pk_field)::uuid;
        IF (TG_OP = 'INSERT') THEN
            INSERT INTO bitacora_auditoria (
                id_usuario, tabla_afectada, id_registro_afectado,
                operacion, datos_nuevos, ip_origen
            ) VALUES (
                v_usuario_id, TG_TABLE_NAME, v_pk_value,
                'INSERT', v_new, v_ip
            );
        ELSE
            v_old := to_jsonb(OLD);
            INSERT INTO bitacora_auditoria (
                id_usuario, tabla_afectada, id_registro_afectado,
                operacion, datos_anteriores, datos_nuevos, ip_origen
            ) VALUES (
                v_usuario_id, TG_TABLE_NAME, v_pk_value,
                'UPDATE', v_old, v_new, v_ip
            );
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auditoria_animales
AFTER INSERT OR UPDATE OR DELETE ON animales
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_animal');

CREATE TRIGGER trg_auditoria_solicitudes
AFTER INSERT OR UPDATE OR DELETE ON solicitudes_adopcion
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_solicitud');

CREATE TRIGGER trg_auditoria_adopciones
AFTER INSERT OR UPDATE OR DELETE ON adopciones
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_adopcion');

CREATE TRIGGER trg_auditoria_donaciones
AFTER INSERT OR UPDATE OR DELETE ON donaciones
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_donacion');

CREATE TRIGGER trg_auditoria_usuarios
AFTER INSERT OR UPDATE OR DELETE ON usuarios
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_usuario');

CREATE TRIGGER trg_auditoria_traslados
AFTER INSERT OR UPDATE OR DELETE ON traslados
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_traslado');

CREATE TRIGGER trg_auditoria_historial
AFTER INSERT OR UPDATE OR DELETE ON historial_clinico
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_historial');

CREATE TRIGGER trg_auditoria_seguimientos
AFTER INSERT OR UPDATE OR DELETE ON seguimientos_post_adopcion
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_seguimiento');

CREATE TRIGGER trg_auditoria_config_sistema
AFTER INSERT OR UPDATE OR DELETE ON configuracion_sistema
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_config');

CREATE TRIGGER trg_auditoria_config_sitio
AFTER INSERT OR UPDATE OR DELETE ON configuracion_sitio
FOR EACH ROW EXECUTE FUNCTION fn_auditar_cambio_generico('id_config_sitio');

CREATE OR REPLACE FUNCTION fn_bitacora_rescates()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id uuid;
BEGIN
    BEGIN
        v_usuario_id := current_setting('app.current_user_id', true)::uuid;
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO bitacora_rescates (
            id_rescate, id_usuario, accion, descripcion, datos_nuevos
        ) VALUES (
            NEW.id_rescate, v_usuario_id, 'Creacion',
            'Rescate registrado en el sistema', to_jsonb(NEW)
        );
        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO bitacora_rescates (
            id_rescate, id_usuario, accion, descripcion,
            datos_anteriores, datos_nuevos
        ) VALUES (
            NEW.id_rescate, v_usuario_id, 'Actualizacion',
            'Rescate actualizado', to_jsonb(OLD), to_jsonb(NEW)
        );
        RETURN NEW;

    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO bitacora_rescates (
            id_rescate, id_usuario, accion, descripcion, datos_anteriores
        ) VALUES (
            OLD.id_rescate, v_usuario_id, 'Eliminacion',
            'Rescate eliminado', to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bitacora_rescates
AFTER INSERT OR UPDATE OR DELETE ON rescates
FOR EACH ROW EXECUTE FUNCTION fn_bitacora_rescates();

CREATE OR REPLACE FUNCTION fn_bitacora_cambio_estado_animal()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id uuid;
BEGIN
    IF (OLD.estado IS DISTINCT FROM NEW.estado) THEN
        BEGIN
            v_usuario_id := current_setting('app.current_user_id', true)::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_usuario_id := NULL;
        END;

        INSERT INTO bitacora_rescates (
            id_rescate, id_usuario, accion, descripcion,
            datos_anteriores, datos_nuevos
        ) VALUES (
            NEW.id_rescate,
            v_usuario_id,
            'Cambio_Estado',
            format('Animal %s cambió de %s a %s', NEW.nombre, OLD.estado, NEW.estado),
            jsonb_build_object('estado', OLD.estado),
            jsonb_build_object('estado', NEW.estado)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bitacora_cambio_estado_animal
AFTER UPDATE ON animales
FOR EACH ROW EXECUTE FUNCTION fn_bitacora_cambio_estado_animal();

CREATE OR REPLACE FUNCTION fn_normalizar_acceso()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ip_origen IS NULL THEN
        BEGIN
            NEW.ip_origen := current_setting('app.current_ip', true);
        EXCEPTION WHEN OTHERS THEN
            NEW.ip_origen := NULL;
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_normalizar_acceso
BEFORE INSERT ON bitacora_accesos
FOR EACH ROW EXECUTE FUNCTION fn_normalizar_acceso();

CREATE OR REPLACE FUNCTION fn_bitacora_backups()
RETURNS TRIGGER AS $$
DECLARE
    v_usuario_id uuid;
BEGIN
    BEGIN
        v_usuario_id := current_setting('app.current_user_id', true)::uuid;
    EXCEPTION WHEN OTHERS THEN
        v_usuario_id := NULL;
    END;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO bitacora_backups (
            id_backup, id_usuario, accion, descripcion
        ) VALUES (
            NEW.id_backup, v_usuario_id, 'Creacion',
            format('Backup %s iniciado (%s)', NEW.nombre_archivo, NEW.tipo_backup)
        );
        RETURN NEW;

    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.estado IS DISTINCT FROM NEW.estado) THEN
            INSERT INTO bitacora_backups (
                id_backup, id_usuario, accion, descripcion
            ) VALUES (
                NEW.id_backup, v_usuario_id,
                CASE
                    WHEN NEW.estado = 'Completado' THEN 'Verificacion'
                    WHEN NEW.estado = 'Restaurado' THEN 'Restauracion'
                    ELSE 'Actualizacion'
                END,
                format('Backup %s cambió de %s a %s',
                       NEW.nombre_archivo, OLD.estado, NEW.estado)
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_bitacora_backups
AFTER INSERT OR UPDATE ON backups
FOR EACH ROW EXECUTE FUNCTION fn_bitacora_backups();

CREATE OR REPLACE FUNCTION fn_actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_upd_expedientes
BEFORE UPDATE ON expedientes_medicos
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER trg_upd_solicitudes
BEFORE UPDATE ON solicitudes_adopcion
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER trg_upd_config_sistema
BEFORE UPDATE ON configuracion_sistema
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE TRIGGER trg_upd_config_sitio
BEFORE UPDATE ON configuracion_sitio
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_timestamp();

CREATE OR REPLACE FUNCTION fn_crear_expediente_animal()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO expedientes_medicos (id_animal)
    VALUES (NEW.id_animal);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_crear_expediente_animal
AFTER INSERT ON animales
FOR EACH ROW EXECUTE FUNCTION fn_crear_expediente_animal();

CREATE OR REPLACE FUNCTION fn_actualizar_estado_animal_adopcion()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE animales
    SET estado = 'Adoptado'
    WHERE id_animal = (
        SELECT id_animal FROM solicitudes_adopcion
        WHERE id_solicitud = NEW.id_solicitud
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_estado_animal_adopcion
AFTER INSERT ON adopciones
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_estado_animal_adopcion();

CREATE OR REPLACE FUNCTION fn_actualizar_estado_animal_traslado()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE animales
    SET estado = 'Trasladado'
    WHERE id_animal = NEW.id_animal;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_estado_animal_traslado
AFTER INSERT ON traslados
FOR EACH ROW EXECUTE FUNCTION fn_actualizar_estado_animal_traslado();