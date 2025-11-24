/*
  Warnings:

  - You are about to drop the column `maxImages` on the `plan` table. All the data in the column will be lost.
  - You are about to drop the column `photoType` on the `plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `plan` DROP COLUMN `maxImages`,
    DROP COLUMN `photoType`,
    ADD COLUMN `hasAnalytics` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `maxHighlightImages` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `maxProductImages` INTEGER NULL;
