/*
  Warnings:

  - Added the required column `userId` to the `Quotation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quotation" ADD COLUMN     "userId" TEXT NOT NULL;
