/*
  Warnings:

  - The values [REQUEST,RETURNED] on the enum `asset_histories_type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `adminId` on the `asset_requests` table. All the data in the column will be lost.
  - You are about to drop the column `assetId` on the `asset_requests` table. All the data in the column will be lost.
  - You are about to drop the column `hrId` on the `asset_requests` table. All the data in the column will be lost.
  - You are about to drop the column `adminId` on the `asset_returned` table. All the data in the column will be lost.
  - You are about to drop the column `assetId` on the `asset_returned` table. All the data in the column will be lost.
  - You are about to drop the column `hrId` on the `asset_returned` table. All the data in the column will be lost.
  - You are about to drop the column `returnDate` on the `asset_returned` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `categories` table. All the data in the column will be lost.
  - Added the required column `bastId` to the `asset_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bastId` to the `asset_returned` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `asset_requests` DROP FOREIGN KEY `asset_requests_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `asset_requests` DROP FOREIGN KEY `asset_requests_assetId_fkey`;

-- DropForeignKey
ALTER TABLE `asset_requests` DROP FOREIGN KEY `asset_requests_hrId_fkey`;

-- DropForeignKey
ALTER TABLE `asset_returned` DROP FOREIGN KEY `asset_returned_adminId_fkey`;

-- DropForeignKey
ALTER TABLE `asset_returned` DROP FOREIGN KEY `asset_returned_assetId_fkey`;

-- DropForeignKey
ALTER TABLE `asset_returned` DROP FOREIGN KEY `asset_returned_hrId_fkey`;

-- AlterTable
ALTER TABLE `asset_histories` MODIFY `type` ENUM('CHECKOUT', 'CREATE', 'UPDATE', 'OTHER') NOT NULL;

-- AlterTable
ALTER TABLE `asset_requests` DROP COLUMN `adminId`,
    DROP COLUMN `assetId`,
    DROP COLUMN `hrId`,
    ADD COLUMN `assignToUser` VARCHAR(191) NULL,
    ADD COLUMN `bastId` INTEGER NOT NULL,
    ADD COLUMN `notes` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `asset_returned` DROP COLUMN `adminId`,
    DROP COLUMN `assetId`,
    DROP COLUMN `hrId`,
    DROP COLUMN `returnDate`,
    ADD COLUMN `bastId` INTEGER NOT NULL,
    ADD COLUMN `notes` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `assets` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `categories` DROP COLUMN `type`,
    ADD COLUMN `image` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `bast` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bastNo` VARCHAR(191) NOT NULL,
    `type` ENUM('REQUEST', 'RETURN') NOT NULL,
    `isCheckedByAdmin` BOOLEAN NOT NULL DEFAULT false,
    `isCheckedByUser` BOOLEAN NOT NULL DEFAULT false,
    `hrId` INTEGER NULL,
    `adminId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bast_bastNo_key`(`bastNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bast_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bastId` INTEGER NOT NULL,
    `assetId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_request_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assetRequestId` INTEGER NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assets` ADD CONSTRAINT `assets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bast` ADD CONSTRAINT `bast_hrId_fkey` FOREIGN KEY (`hrId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bast` ADD CONSTRAINT `bast_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bast_items` ADD CONSTRAINT `bast_items_bastId_fkey` FOREIGN KEY (`bastId`) REFERENCES `bast`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bast_items` ADD CONSTRAINT `bast_items_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_requests` ADD CONSTRAINT `asset_requests_bastId_fkey` FOREIGN KEY (`bastId`) REFERENCES `bast`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_request_items` ADD CONSTRAINT `asset_request_items_assetRequestId_fkey` FOREIGN KEY (`assetRequestId`) REFERENCES `asset_requests`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_request_items` ADD CONSTRAINT `asset_request_items_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_returned` ADD CONSTRAINT `asset_returned_bastId_fkey` FOREIGN KEY (`bastId`) REFERENCES `bast`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
