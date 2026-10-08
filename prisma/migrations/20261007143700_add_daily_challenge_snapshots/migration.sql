/*
  Warnings:

  - Added the required column `answers` to the `DailyChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageStorageKey` to the `DailyChallenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `DailyChallenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `DailyChallenge` ADD COLUMN `answers` JSON NOT NULL,
    ADD COLUMN `imageStorageKey` VARCHAR(512) NOT NULL,
    ADD COLUMN `title` VARCHAR(255) NOT NULL;
