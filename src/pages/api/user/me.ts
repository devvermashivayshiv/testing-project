import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../lib/authOptions";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  let user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  // Auto-update freeTrialActive if trial has expired
  if (user.freeTrialActive && user.freeTrialEndsAt && new Date(user.freeTrialEndsAt) <= new Date()) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { freeTrialActive: false }
    });
  }

  return res.status(200).json({ user });
} 