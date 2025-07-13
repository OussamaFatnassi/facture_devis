/*
  Warnings:

  - You are about to drop the column `totalHT` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `totalTTC` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `totalExcludingTax` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalIncludingTax` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Step 1: Add new columns with default values
ALTER TABLE "Invoice" ADD COLUMN "totalExcludingTax" DOUBLE PRECISION DEFAULT 0 NOT NULL,
ADD COLUMN "totalIncludingTax" DOUBLE PRECISION DEFAULT 0 NOT NULL;

-- Step 2: Copy data from old columns to new columns
UPDATE "Invoice" SET "totalExcludingTax" = "totalHT", "totalIncludingTax" = "totalTTC";

-- Step 3: Remove default values
ALTER TABLE "Invoice" ALTER COLUMN "totalExcludingTax" DROP DEFAULT,
ALTER COLUMN "totalIncludingTax" DROP DEFAULT;

-- Step 4: Drop old columns
ALTER TABLE "Invoice" DROP COLUMN "totalHT",
DROP COLUMN "totalTTC";
