import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ users });
  }
  if (req.method === "PUT") {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    try {
      // No updatable fields left, so just return the user as is
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return res.status(200).json({ user });
    } catch {
      return res.status(500).json({ error: "Failed to update user status" });
    }
  }
  return res.status(405).end();
} 