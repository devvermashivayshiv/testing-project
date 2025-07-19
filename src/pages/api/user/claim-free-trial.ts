import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../lib/authOptions";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.freeTrialStartedAt) {
    return res.status(400).json({ error: "You have already claimed a free trial." });
  }
  const { packageId } = req.body;
  if (!packageId) return res.status(400).json({ error: "Missing package id" });
  const pkg = await prisma.bloggingPackage.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) return res.status(404).json({ error: "Free trial package not found" });
  if (pkg.price !== 0) return res.status(400).json({ error: "Selected package is not a free trial." });
  // Set trial duration (e.g. 2 days)
  const now = new Date();
  const endsAt = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      freeTrialActive: true,
      freeTrialStartedAt: now,
      freeTrialEndsAt: endsAt,
    },
  });
  await prisma.userSubscription.create({
    data: {
      userId: user.id,
      packageId: pkg.id,
      startDate: now,
      endDate: endsAt,
      paymentId: "free-trial",
    },
  });
  return res.status(200).json({ success: true });
} 