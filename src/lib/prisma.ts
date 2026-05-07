// lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// グローバルに PrismaClient をぶら下げるための型
// （Next.js の hot reload で毎回 new されるのを防ぐテクニック）
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// 既に global に prisma があればそれを使う。
// なければ new PrismaClient() する。
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // log: ["query"], // デバッグしたくなったらコメント外す
  });

// 開発環境のときだけ、global に保存して再利用可能にする
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
