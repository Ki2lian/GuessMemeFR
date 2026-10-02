-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `event` ENUM('AUTH_SIGNED_IN', 'AUTH_SIGNED_OUT') NOT NULL,
    `metadata` JSON NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `subjectUserId` VARCHAR(191) NULL,
    `actorUserId` VARCHAR(191) NULL,

    INDEX `AuditLog_subjectUserId_occurredAt_idx`(`subjectUserId`, `occurredAt`),
    INDEX `AuditLog_actorUserId_occurredAt_idx`(`actorUserId`, `occurredAt`),
    INDEX `AuditLog_event_occurredAt_idx`(`event`, `occurredAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meme` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `difficulty` ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL,
    `origin` VARCHAR(255) NULL,
    `sourceUrl` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `publishedAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NULL,
    `coverAssetId` VARCHAR(191) NULL,

    UNIQUE INDEX `Meme_coverAssetId_key`(`coverAssetId`),
    INDEX `Meme_status_publishedAt_idx`(`status`, `publishedAt`),
    INDEX `Meme_difficulty_status_idx`(`difficulty`, `status`),
    INDEX `Meme_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MemeAnswer` (
    `id` VARCHAR(191) NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `normalizedValue` VARCHAR(255) NOT NULL,
    `type` ENUM('CANONICAL', 'ALIAS') NOT NULL,
    `memeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MemeAnswer_memeId_type_idx`(`memeId`, `type`),
    UNIQUE INDEX `MemeAnswer_memeId_normalizedValue_key`(`memeId`, `normalizedValue`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `storageKey` VARCHAR(512) NOT NULL,
    `mimeType` VARCHAR(127) NOT NULL,
    `byteSize` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `sha256` CHAR(64) NOT NULL,
    `status` ENUM('PENDING', 'READY', 'DELETED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deletedAt` DATETIME(3) NULL,
    `uploadedById` VARCHAR(191) NULL,
    `memeId` VARCHAR(191) NULL,

    UNIQUE INDEX `MediaAsset_storageKey_key`(`storageKey`),
    UNIQUE INDEX `MediaAsset_sha256_key`(`sha256`),
    INDEX `MediaAsset_memeId_status_idx`(`memeId`, `status`),
    INDEX `MediaAsset_uploadedById_idx`(`uploadedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyChallenge` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `effect` ENUM('ZOOMED_IN', 'PIXELATED', 'SCRAMBLED', 'DISTORTED', 'HIDDEN') NOT NULL,
    `seed` BIGINT NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `memeId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `DailyChallenge_date_key`(`date`),
    INDEX `DailyChallenge_status_date_idx`(`status`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameSession` (
    `id` VARCHAR(191) NOT NULL,
    `mode` ENUM('CLASSIC', 'DAILY') NOT NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'ABANDONED') NOT NULL DEFAULT 'ACTIVE',
    `seed` BIGINT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `userId` VARCHAR(191) NULL,
    `dailyChallengeId` VARCHAR(191) NULL,

    INDEX `GameSession_userId_startedAt_idx`(`userId`, `startedAt`),
    INDEX `GameSession_mode_seed_idx`(`mode`, `seed`),
    INDEX `GameSession_dailyChallengeId_idx`(`dailyChallengeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameRound` (
    `id` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `seed` BIGINT NOT NULL,
    `effect` ENUM('ZOOMED_IN', 'PIXELATED', 'SCRAMBLED', 'DISTORTED', 'HIDDEN') NOT NULL,
    `revealLevel` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('ACTIVE', 'CORRECT', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'ACTIVE',
    `completedAt` DATETIME(3) NULL,
    `gameSessionId` VARCHAR(191) NOT NULL,
    `memeId` VARCHAR(191) NOT NULL,

    INDEX `GameRound_memeId_idx`(`memeId`),
    UNIQUE INDEX `GameRound_gameSessionId_position_key`(`gameSessionId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameGuess` (
    `id` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `kind` ENUM('GUESS', 'REVEAL') NOT NULL,
    `result` ENUM('CORRECT', 'INCORRECT') NULL,
    `value` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `gameRoundId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `GameGuess_gameRoundId_position_key`(`gameRoundId`, `position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ClassicResult` (
    `id` VARCHAR(191) NOT NULL,
    `seed` BIGINT NOT NULL,
    `score` INTEGER NOT NULL,
    `solvedRounds` INTEGER NOT NULL,
    `totalAttempts` INTEGER NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `gameSessionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ClassicResult_gameSessionId_key`(`gameSessionId`),
    INDEX `ClassicResult_seed_completedAt_idx`(`seed`, `completedAt`),
    UNIQUE INDEX `ClassicResult_userId_seed_key`(`userId`, `seed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DailyResult` (
    `id` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `totalAttempts` INTEGER NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `gameSessionId` VARCHAR(191) NOT NULL,
    `dailyChallengeId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `DailyResult_gameSessionId_key`(`gameSessionId`),
    INDEX `DailyResult_dailyChallengeId_completedAt_idx`(`dailyChallengeId`, `completedAt`),
    UNIQUE INDEX `DailyResult_userId_dailyChallengeId_key`(`userId`, `dailyChallengeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` TEXT NOT NULL,
    `username` VARCHAR(32) NULL,
    `discordId` VARCHAR(20) NULL,
    `email` VARCHAR(191) NOT NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `image` TEXT NULL,
    `banner` TEXT NULL,
    `role` VARCHAR(64) NOT NULL DEFAULT 'user',
    `banned` BOOLEAN NOT NULL DEFAULT false,
    `banReason` TEXT NULL,
    `banExpires` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_discordId_key`(`discordId`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` TEXT NULL,
    `userAgent` TEXT NULL,
    `impersonatedBy` VARCHAR(64) NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `Session_userId_idx`(`userId`),
    UNIQUE INDEX `Session_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` TEXT NOT NULL,
    `providerId` TEXT NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NULL,
    `refreshToken` TEXT NULL,
    `idToken` TEXT NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` TEXT NULL,
    `password` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Account_userId_idx`(`userId`),
    UNIQUE INDEX `Account_providerId_accountId_key`(`providerId`(191), `accountId`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Verification` (
    `id` VARCHAR(191) NOT NULL,
    `identifier` TEXT NOT NULL,
    `value` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Verification_identifier_idx`(`identifier`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_subjectUserId_fkey` FOREIGN KEY (`subjectUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meme` ADD CONSTRAINT `Meme_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Meme` ADD CONSTRAINT `Meme_coverAssetId_fkey` FOREIGN KEY (`coverAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemeAnswer` ADD CONSTRAINT `MemeAnswer_memeId_fkey` FOREIGN KEY (`memeId`) REFERENCES `Meme`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_uploadedById_fkey` FOREIGN KEY (`uploadedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_memeId_fkey` FOREIGN KEY (`memeId`) REFERENCES `Meme`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyChallenge` ADD CONSTRAINT `DailyChallenge_memeId_fkey` FOREIGN KEY (`memeId`) REFERENCES `Meme`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameSession` ADD CONSTRAINT `GameSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameSession` ADD CONSTRAINT `GameSession_dailyChallengeId_fkey` FOREIGN KEY (`dailyChallengeId`) REFERENCES `DailyChallenge`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameRound` ADD CONSTRAINT `GameRound_gameSessionId_fkey` FOREIGN KEY (`gameSessionId`) REFERENCES `GameSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameRound` ADD CONSTRAINT `GameRound_memeId_fkey` FOREIGN KEY (`memeId`) REFERENCES `Meme`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GameGuess` ADD CONSTRAINT `GameGuess_gameRoundId_fkey` FOREIGN KEY (`gameRoundId`) REFERENCES `GameRound`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassicResult` ADD CONSTRAINT `ClassicResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ClassicResult` ADD CONSTRAINT `ClassicResult_gameSessionId_fkey` FOREIGN KEY (`gameSessionId`) REFERENCES `GameSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyResult` ADD CONSTRAINT `DailyResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyResult` ADD CONSTRAINT `DailyResult_gameSessionId_fkey` FOREIGN KEY (`gameSessionId`) REFERENCES `GameSession`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DailyResult` ADD CONSTRAINT `DailyResult_dailyChallengeId_fkey` FOREIGN KEY (`dailyChallengeId`) REFERENCES `DailyChallenge`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
