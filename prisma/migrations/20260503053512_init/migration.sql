/*
  Warnings:

  - You are about to drop the column `totalReps` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `totalSets` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `totalVolume` on the `TrainingRecord` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `TrainingRow` table. All the data in the column will be lost.
  - Added the required column `exercise` to the `TrainingRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reps` to the `TrainingRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sets` to the `TrainingRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volume` to the `TrainingRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `TrainingRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TrainingRecord" DROP COLUMN "totalReps",
DROP COLUMN "totalSets",
DROP COLUMN "totalVolume",
ADD COLUMN     "exercise" TEXT NOT NULL,
ADD COLUMN     "reps" INTEGER NOT NULL,
ADD COLUMN     "sets" INTEGER NOT NULL,
ADD COLUMN     "volume" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "TrainingRow" DROP COLUMN "userId";
