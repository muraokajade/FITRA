import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // =========================
  // 全削除
  // =========================

  await prisma.trainingRow.deleteMany();
  await prisma.trainingRecord.deleteMany();
  await prisma.exerciseLog.deleteMany();

  // =========================================================
  // NORMAL
  // =========================================================

  await prisma.trainingRecord.createMany({
    data: [
      // =========================
      // ベンチプレス
      // =========================

      {
        userId: "demo",
        date: "2026-05-01",
        exercise: "ベンチプレス",
        weight: 80,
        reps: 8,
        sets: 3,
        volume: 1920,
        createdAt: new Date("2026-05-01"),
      },

      {
        userId: "demo",
        date: "2026-05-03",
        exercise: "ベンチプレス",
        weight: 82.5,
        reps: 8,
        sets: 3,
        volume: 1980,
        createdAt: new Date("2026-05-03"),
      },

      // LIVEと同日なので除外される想定
      {
        userId: "demo",
        date: "2026-05-06",
        exercise: "ベンチプレス",
        weight: 90,
        reps: 5,
        sets: 3,
        volume: 1350,
        createdAt: new Date("2026-05-06"),
      },

      // =========================
      // スクワット
      // =========================

      {
        userId: "demo",
        date: "2026-05-01",
        exercise: "スクワット",
        weight: 100,
        reps: 5,
        sets: 3,
        volume: 1500,
        createdAt: new Date("2026-05-01"),
      },

      {
        userId: "demo",
        date: "2026-05-03",
        exercise: "スクワット",
        weight: 102.5,
        reps: 5,
        sets: 3,
        volume: 1537.5,
        createdAt: new Date("2026-05-03"),
      },

      {
        userId: "demo",
        date: "2026-05-05",
        exercise: "スクワット",
        weight: 102.5,
        reps: 6,
        sets: 3,
        volume: 1845,
        createdAt: new Date("2026-05-05"),
      },

      {
        userId: "demo",
        date: "2026-05-07",
        exercise: "スクワット",
        weight: 105,
        reps: 6,
        sets: 3,
        volume: 1890,
        createdAt: new Date("2026-05-07"),
      },
    ],
  });

  // =========================================================
  // LIVE
  // =========================================================

  // =========================
  // ベンチプレス
  // 2026-05-06 は NORMAL より優先される
  // =========================

  for (let i = 1; i <= 3; i++) {
    await prisma.exerciseLog.create({
      data: {
        sessionId: 100,
        exerciseName: "ベンチプレス",
        weight: 85,
        reps: 8,
        setNumber: i,
        volume: 680,
        createdAt: new Date("2026-05-06"),
        memo: null,
      },
    });
  }

  // =========================
  // ラットプルダウン
  // LIVEのみ
  // =========================

  for (let i = 1; i <= 3; i++) {
    await prisma.exerciseLog.create({
      data: {
        sessionId: 101,
        exerciseName: "ラットプルダウン",
        weight: 55,
        reps: 10,
        setNumber: i,
        volume: 550,
        createdAt: new Date("2026-05-02"),
        memo: null,
      },
    });
  }

  for (let i = 1; i <= 3; i++) {
    await prisma.exerciseLog.create({
      data: {
        sessionId: 102,
        exerciseName: "ラットプルダウン",
        weight: 57.5,
        reps: 10,
        setNumber: i,
        volume: 575,
        createdAt: new Date("2026-05-04"),
        memo: null,
      },
    });
  }

  for (let i = 1; i <= 3; i++) {
    await prisma.exerciseLog.create({
      data: {
        sessionId: 103,
        exerciseName: "ラットプルダウン",
        weight: 60,
        reps: 10,
        setNumber: i,
        volume: 600,
        createdAt: new Date("2026-05-06"),
        memo: null,
      },
    });
  }

  for (let i = 1; i <= 3; i++) {
    await prisma.exerciseLog.create({
      data: {
        sessionId: 104,
        exerciseName: "ラットプルダウン",
        weight: 60,
        reps: 11,
        setNumber: i,
        volume: 660,
        createdAt: new Date("2026-05-07"),
        memo: null,
      },
    });
  }

  console.log("4days mixed seed completed");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });