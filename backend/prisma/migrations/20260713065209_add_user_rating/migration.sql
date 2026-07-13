/*
  Warnings:

  - You are about to drop the column `highestRating` on the `UserStats` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `UserStats` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "RatingType" AS ENUM ('RANKED_3X3', 'RANKED_4X4', 'RANKED_5X5', 'RANKED_6X6');

-- AlterTable
ALTER TABLE "UserStats" DROP COLUMN "highestRating",
DROP COLUMN "rating";

-- CreateTable
CREATE TABLE "UserRating" (
    "id" TEXT NOT NULL,
    "type" "RatingType" NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1000,
    "peakRating" INTEGER NOT NULL DEFAULT 1000,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "lastPlayedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserRating_type_idx" ON "UserRating"("type");

-- CreateIndex
CREATE INDEX "UserRating_rating_idx" ON "UserRating"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "UserRating_userId_type_key" ON "UserRating"("userId", "type");

-- AddForeignKey
ALTER TABLE "UserRating" ADD CONSTRAINT "UserRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
