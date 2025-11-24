-- AlterTable
ALTER TABLE `image` ADD COLUMN `sectionTemplateId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Image` ADD CONSTRAINT `Image_sectionTemplateId_fkey` FOREIGN KEY (`sectionTemplateId`) REFERENCES `SectionTemplate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
