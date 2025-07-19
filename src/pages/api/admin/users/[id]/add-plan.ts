import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { id } = req.query;
  const { packageId } = req.body;
  if (!id || typeof id !== "string" || !packageId) {
    return res.status(400).json({ error: "Missing user id or package id" });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  const pkg = await prisma.bloggingPackage.findUnique({ where: { id: packageId } });
  if (!pkg) return res.status(404).json({ error: "Package not found" });
  // Check if user already has an active subscription
  const now = new Date();
  const active = await prisma.userSubscription.findFirst({
    where: { userId: id, packageId, endDate: { gte: now } }
  });
  if (active) return res.status(400).json({ error: "User already has this plan active" });
  const endDate = new Date(now);
  if (pkg.durationType === 'months') {
    endDate.setMonth(endDate.getMonth() + pkg.durationValue);
  } else {
    endDate.setDate(endDate.getDate() + pkg.durationValue);
  }
  const sub = await prisma.userSubscription.create({
    data: {
      userId: id,
      packageId,
      startDate: now,
      endDate,
      paymentId: "admin-manual",
    }
  });
  res.status(200).json({ success: true, subscription: sub });
} 