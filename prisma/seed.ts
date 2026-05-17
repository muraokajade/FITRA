import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const USER_ID = "M7L3q7e6MObQXccF8SneQa0XteD3";

const seedScores = [
  {
    daysAgo: 6,
    diet: 62,
    training: 68,
    life: 58,
    summary: "記録開始。全体的に改善余地あり。",
  },
  {
    daysAgo: 5,
    diet: 66,
    training: 72,
    life: 61,
    summary: "食事と運動が少し安定。",
  },
  {
    daysAgo: 4,
    diet: 71,
    training: 76,
    life: 64,
    summary: "トレーニングの継続で上昇傾向。",
  },
  {
    daysAgo: 3,
    diet: 68,
    training: 78,
    life: 60,
    summary: "疲労がやや残り、生活スコアが低下。",
  },
  {
    daysAgo: 2,
    diet: 74,
    training: 82,
    life: 66,
    summary: "食事バランスと運動量が改善。",
  },
  {
    daysAgo: 1,
    diet: 76,
    training: 86,
    life: 70,
    summary: "全体的に安定。成長傾向あり。",
  },
  {
    daysAgo: 0,
    diet: 79,
    training: 88,
    life: 73,
    summary: "身体状態は良好。継続しやすい状態。",
  },
];

function getDate(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(9, 0, 0, 0);
  return date;
}

async function main() {

  console.log("Seeding dashboard score trend...");

  for (const item of seedScores) {
    const date = getDate(item.daysAgo);

    const mealLog = await prisma.mealLog.create({
      data: {
        name: `Seed meal ${item.daysAgo}`,
        mealType: "day",
        timestamp: date,
        score: item.diet,
        totalCalories: 2100,
        totalProtein: 120,
        totalFat: 55,
        totalCarbs: 260,
      },
    });

    await prisma.dietAnalysis.create({
      data: {
        mealLogId: mealLog.id,
        userId: USER_ID,
        date,
        score: item.diet,
        summary: `食事スコア ${item.diet}`,
        feedback:
          "栄養バランスを確認し、たんぱく質と炭水化物の摂取量を意識するとさらに安定します。",
      },
    });

    const trainingSession = await prisma.trainingSession.create({
      data: {
        userId: USER_ID,
        date,
        mode: "NORMAL",
        totalVolume: 12000 + item.daysAgo * 300,
        memo: "READMEスクリーンショット用のseedデータ",
      },
    });

    await prisma.trainingEntry.createMany({
      data: [
        {
          sessionId: trainingSession.id,
          exercise: "ベンチプレス",
          weight: 70 + (6 - item.daysAgo),
          reps: 8,
          sets: 3,
          volume: (70 + (6 - item.daysAgo)) * 8 * 3,
        },
        {
          sessionId: trainingSession.id,
          exercise: "スクワット",
          weight: 100 + (6 - item.daysAgo) * 2,
          reps: 8,
          sets: 3,
          volume: (100 + (6 - item.daysAgo) * 2) * 8 * 3,
        },
      ],
    });

    await prisma.trainingAnalysis.create({
      data: {
        sessionId: trainingSession.id,
        userId: USER_ID,
        date,
        score: item.training,
        totalVolume: 12000 + item.daysAgo * 300,
        topExercise: "スクワット",
        summary: `トレーニングスコア ${item.training}`,
        feedback:
          "重量と総ボリュームは安定しており、継続的な成長傾向が見られます。",
      },
    });

    const lifeLog = await prisma.lifeLog.create({
      data: {
        userId: USER_ID,
        date,
        sleepHours: 6.5 + (item.life >= 70 ? 0.5 : 0),
        fatigue: item.life >= 70 ? 3 : 5,
        stress: item.life >= 70 ? 3 : 5,
        memo: "READMEスクリーンショット用のseedデータ",
      },
    });

    await prisma.lifeAnalysis.create({
      data: {
        lifeLogId: lifeLog.id,
        userId: USER_ID,
        date,
        score: item.life,
        label:
          item.life >= 70
            ? "攻めてもよい状態"
            : item.life >= 50
              ? "調整しながら進める"
              : "回復を優先する",
        sleepPoint: item.life >= 70 ? 36 : 30,
        fatiguePoint: item.life >= 70 ? 22 : 18,
        stressPoint: item.life >= 70 ? 20 : 15,
        summary: `生活スコア ${item.life}`,
        feedback:
          "睡眠・疲労・ストレスのバランスを確認し、回復状態を見ながら運動強度を調整します。",
      },
    });

    console.log(
      `Seeded ${date.toISOString().slice(0, 10)} / diet:${item.diet}, training:${item.training}, life:${item.life}`
    );
  }

  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });