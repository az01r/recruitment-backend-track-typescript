/*
  Warnings:

  - Added the required column `amount` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `TaxProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `TaxProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `TaxProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `legalName` to the `TaxProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vatNumber` to the `TaxProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `TaxProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `amount` DOUBLE NOT NULL,
    ADD COLUMN `currency` ENUM('EUR', 'USD', 'GBP') NOT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'PAID', 'CANCELLED') NOT NULL;

-- AlterTable
ALTER TABLE `TaxProfile` ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `city` VARCHAR(191) NOT NULL,
    ADD COLUMN `country` VARCHAR(191) NOT NULL,
    ADD COLUMN `legalName` VARCHAR(191) NOT NULL,
    ADD COLUMN `vatNumber` VARCHAR(191) NOT NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NOT NULL;
