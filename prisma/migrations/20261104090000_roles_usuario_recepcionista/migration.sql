-- Reemplaza el rol Encargado_Adopciones por Recepcionista conservando los datos existentes.
ALTER TYPE "RolUsuario" RENAME VALUE 'Encargado_Adopciones' TO 'Recepcionista';
