export enum RolUsuario {
  Administrador = "Administrador",
  Veterinario = "Veterinario",
  Encargado_Adopciones = "Encargado_Adopciones",
  Voluntario = "Voluntario",
}

export enum EstadoAnimal {
  En_Cuarentena = "En_Cuarentena",
  Disponible_Adopcion = "Disponible_Adopcion",
  En_Tratamiento = "En_Tratamiento",
  Trasladado = "Trasladado",
  Adoptado = "Adoptado",
  Fallecido = "Fallecido",
}

export enum EstadoSolicitud {
  Pendiente = "Pendiente",
  En_Evaluacion = "En_Evaluacion",
  Entrevista_Domiciliaria = "Entrevista_Domiciliaria",
  Aprobada = "Aprobada",
  Rechazada = "Rechazada",
}

export enum TipoDonacion {
  Financiera = "Financiera",
  Alimentos = "Alimentos",
  Medicamentos = "Medicamentos",
  Higiene_Limpieza = "Higiene_Limpieza",
  Equipamiento_Otros = "Equipamiento_Otros",
}

export enum TipoEventoAcceso {
  Login = "Login",
  Logout = "Logout",
  Login_Fallido = "Login_Fallido",
  Bloqueo_Cuenta = "Bloqueo_Cuenta",
  Cambio_Password = "Cambio_Password",
}

export enum OperacionAuditoria {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  SOFT_DELETE = "SOFT_DELETE",
}

export enum TipoBackup {
  Completo = "Completo",
  Incremental = "Incremental",
  Diferencial = "Diferencial",
}

export enum EstadoBackup {
  En_Proceso = "En_Proceso",
  Completado = "Completado",
  Fallido = "Fallido",
  Restaurado = "Restaurado",
}

export enum AccionBitacora {
  Creacion = "Creacion",
  Actualizacion = "Actualizacion",
  Cambio_Estado = "Cambio_Estado",
  Asignacion_Animal = "Asignacion_Animal",
  Adjunto_Foto = "Adjunto_Foto",
  Eliminacion = "Eliminacion",
  Restauracion = "Restauracion",
  Verificacion = "Verificacion",
  Descarga = "Descarga",
}
