import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

// ここで . を打って補完チェック

type MealItemInput = {
  name: string;
  amount: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

type MealLogInput = {
  name: string;
  mealType: string;
  timestamp: string; // JSONで送られてくるのは文字列
  items: MealItemInput[];
};

export async function POST(req: Request) {
  try {
    //フロントから送られてきたJSONをparse 何か何にparse?
    const body = (await req.json()) as MealLogInput;
    //bodyは1次元オブジェクトなのでそのまま分割代入
    const { name, mealType, timestamp, items } = body;
    //ざっくりバリデーション（最低限）
    if (!mealType || !timestamp || !items || items.length === 0) {
      return NextResponse.json(
        { error: "mealType / timestamp / items は必須です" },
        { status: 400 }
      );
    }

    //受け取った値をprismaでDBに保存

    const meal = await prisma.mealLog.create({
      data: {
        name,
        mealType,
        timestamp: new Date(timestamp),
        totalCalories: items.reduce((sum, i) => sum + (i.calories || 0), 0),
        totalProtein: items.reduce((sum, i) => sum + (i.protein || 0), 0),
        totalFat: items.reduce((sum, i) => sum + (i.fat || 0), 0),
        totalCarbs: items.reduce((sum, i) => sum + (i.carbs || 0), 0),
        items: {
          create: items.map((i) => ({
            name: i.name,
            amount: i.amount,
            calories: i.calories,
            protein: i.protein,
            fat: i.fat,
            carbs: i.carbs,
          })),
        },
      },
      include: { items: true },
    });
  } catch (e) {
    console.error(e);
  }
}
