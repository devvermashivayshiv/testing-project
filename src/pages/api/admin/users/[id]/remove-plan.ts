import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing user id" });
  }
  const now = new Date();
  const active = await prisma.userSubscription.findFirst({
    where: { userId: id, endDate: { gte: now } }
  });
  if (!active) return res.status(404).json({ error: "No active plan found" });
  await prisma.userSubscription.update({
    where: { id: active.id },
    data: { endDate: now }
  });
  // If free trial, reset user.freeTrialActive, freeTrialStartedAt, freeTrialEndsAt
  const pkg = await prisma.bloggingPackage.findUnique({ where: { id: active.packageId } });
  if (pkg && pkg.price === 0) {
    await prisma.user.update({
      where: { id },
      data: {
        freeTrialActive: false,
        freeTrialStartedAt: null,
        freeTrialEndsAt: null,
      }
    });
  }
  res.status(200).json({ success: true });
} 