-- CreateTable
CREATE TABLE "DietAnalysis" (
    "id" TEXT NOT NULL,
    "mealLogId" TEXT NOT NULL,
    "userId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "summary" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DietAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "sleepHours" DOUBLE PRECISION,
    "fatigue" INTEGER,
    "stress" INTEGER,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeAnalysis" (
    "id" TEXT NOT NULL,
    "lifeLogId" TEXT NOT NULL,
    "userId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "label" TEXT,
    "sleepPoint" DOUBLE PRECISION,
    "fatiguePoint" DOUBLE PRECISION,
    "stressPoint" DOUBLE PRECISION,
    "summary" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LifeAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "mode" TEXT NOT NULL,
    "totalVolume" DOUBLE PRECISION,
    "memo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingEntry" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exercise" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "sets" INTEGER NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingAnalysis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "totalVolume" DOUBLE PRECISION NOT NULL,
    "topExercise" TEXT,
    "summary" TEXT,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DietAnalysis_date_idx" ON "DietAnalysis"("date");

-- CreateIndex
CREATE INDEX "DietAnalysis_mealLogId_idx" ON "DietAnalysis"("mealLogId");

-- CreateIndex
CREATE INDEX "LifeLog_userId_idx" ON "LifeLog"("userId");

-- CreateIndex
CREATE INDEX "LifeLog_date_idx" ON "LifeLog"("date");

-- CreateIndex
CREATE INDEX "LifeAnalysis_userId_idx" ON "LifeAnalysis"("userId");

-- CreateIndex
CREATE INDEX "LifeAnalysis_date_idx" ON "LifeAnalysis"("date");

-- CreateIndex
CREATE INDEX "LifeAnalysis_lifeLogId_idx" ON "LifeAnalysis"("lifeLogId");

-- CreateIndex
CREATE INDEX "TrainingSession_userId_idx" ON "TrainingSession"("userId");

-- CreateIndex
CREATE INDEX "TrainingSession_date_idx" ON "TrainingSession"("date");

-- CreateIndex
CREATE INDEX "TrainingEntry_sessionId_idx" ON "TrainingEntry"("sessionId");

-- CreateIndex
CREATE INDEX "TrainingEntry_exercise_idx" ON "TrainingEntry"("exercise");

-- CreateIndex
CREATE INDEX "TrainingAnalysis_sessionId_idx" ON "TrainingAnalysis"("sessionId");

-- CreateIndex
CREATE INDEX "TrainingAnalysis_userId_idx" ON "TrainingAnalysis"("userId");

-- CreateIndex
CREATE INDEX "TrainingAnalysis_date_idx" ON "TrainingAnalysis"("date");

-- AddForeignKey
ALTER TABLE "DietAnalysis" ADD CONSTRAINT "DietAnalysis_mealLogId_fkey" FOREIGN KEY ("mealLogId") REFERENCES "MealLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeAnalysis" ADD CONSTRAINT "LifeAnalysis_lifeLogId_fkey" FOREIGN KEY ("lifeLogId") REFERENCES "LifeLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingEntry" ADD CONSTRAINT "TrainingEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAnalysis" ADD CONSTRAINT "TrainingAnalysis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
