/*
  Warnings:

  - You are about to drop the column `player1Games` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player1Points` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player2Games` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `player2Points` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "player1Games",
DROP COLUMN "player1Points",
DROP COLUMN "player2Games",
DROP COLUMN "player2Points";
