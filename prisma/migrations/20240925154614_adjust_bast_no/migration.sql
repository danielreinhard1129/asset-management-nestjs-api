/*
  Warnings:

  - You are about to alter the column `bastNo` on the `bast` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.

*/
-- AlterTable
ALTER TABLE `bast` MODIFY `bastNo` VARCHAR(20) NOT NULL;
