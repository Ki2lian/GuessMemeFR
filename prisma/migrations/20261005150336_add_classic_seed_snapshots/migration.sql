-- CreateTable
CREATE TABLE `ClassicSeed` (
    `seed` BIGINT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`seed`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassicSeedRound` (
    `id` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `seed` BIGINT NOT NULL,
    `effect` ENUM('ZOOMED_IN', 'PIXELATED', 'SCRAMBLED', 'DISTORTED', 'HIDDEN') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `imageStorageKey` VARCHAR(512) NOT NULL,
    `answers` JSON NOT NULL,
    `classicSeedValue` BIGINT NOT NULL,
    `memeId` VARCHAR(191) NOT NULL,

    INDEX `ClassicSeedRound_memeId_idx`(`memeId`),
    UNIQUE INDEX `ClassicSeedRound_classicSeedValue_position_key`(`classicSeedValue`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ClassicSeedRound` ADD CONSTRAINT `ClassicSeedRound_classicSeedValue_fkey` FOREIGN KEY (`classicSeedValue`) REFERENCES `ClassicSeed`(`seed`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassicSeedRound` ADD CONSTRAINT `ClassicSeedRound_memeId_fkey` FOREIGN KEY (`memeId`) REFERENCES `Meme`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
