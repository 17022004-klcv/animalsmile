/*
  Warnings:

  - You are about to alter the column `peso_kg` on the `consultas` table. The data in that column could be lost. The data in that column will be cast from `Decimal(6,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "consultas" ALTER COLUMN "peso_kg" SET DATA TYPE DOUBLE PRECISION;
