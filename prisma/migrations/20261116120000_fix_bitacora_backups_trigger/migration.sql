-- El trigger trg_bitacora_backups duplicaba las entradas de bitácora que la
-- aplicación ya registra (con el usuario correcto) y además fallaba en los
-- UPDATE: su expresión CASE devolvía `text` sin cast al enum "AccionBitacora"
-- (error PostgreSQL 42804), impidiendo cambiar el estado de un backup.
-- Se elimina el trigger y su función; la app es la única responsable de la
-- bitácora de backups.

DROP TRIGGER IF EXISTS trg_bitacora_backups ON backups;

DROP FUNCTION IF EXISTS fn_bitacora_backups();
