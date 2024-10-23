/*
  Warnings:

  - You are about to drop the `asset_assignments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `asset_assignments` DROP FOREIGN KEY `asset_assignments_grantedbyId_fkey`;

-- DropForeignKey
ALTER TABLE `asset_assignments` DROP FOREIGN KEY `asset_assignments_userId_fkey`;

-- AlterTable
ALTER TABLE `asset_requests` ADD COLUMN `adminId` INTEGER NULL,
    ADD COLUMN `hrId` INTEGER NULL,
    MODIFY `status` ENUM('PENDING', 'IN_PROGRESS', 'APPROVE', 'REJECT', 'CLAIMED') NOT NULL;

-- AlterTable
ALTER TABLE `assets` MODIFY `status` ENUM('AVAILABLE', 'IN_PROGRESS', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'MISSING', 'BROKEN') NOT NULL DEFAULT 'AVAILABLE';

-- DropTable
DROP TABLE `asset_assignments`;

-- CreateTable
CREATE TABLE `asset_histories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assetId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `adminId` INTEGER NOT NULL,
    `type` ENUM('REQUEST', 'RETURNED', 'CREATE', 'UPDATE', 'OTHER') NOT NULL,
    `notes` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_returned` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assetId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'IN_PROGRESS', 'APPROVE', 'REJECT', 'DONE') NOT NULL,
    `hrId` INTEGER NULL,
    `adminId` INTEGER NULL,
    `returnDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `asset_histories` ADD CONSTRAINT `asset_histories_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_histories` ADD CONSTRAINT `asset_histories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_histories` ADD CONSTRAINT `asset_histories_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_requests` ADD CONSTRAINT `asset_requests_hrId_fkey` FOREIGN KEY (`hrId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_requests` ADD CONSTRAINT `asset_requests_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_returned` ADD CONSTRAINT `asset_returned_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_returned` ADD CONSTRAINT `asset_returned_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_returned` ADD CONSTRAINT `asset_returned_hrId_fkey` FOREIGN KEY (`hrId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `asset_returned` ADD CONSTRAINT `asset_returned_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
