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
    const { userId, banned } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    try {
      const user = await prisma.user.update({ where: { id: userId }, data: { banned: !!banned } });
      return res.status(200).json({ user });
    } catch {
      return res.status(500).json({ error: "Failed to update user status" });
    }
  }
  return res.status(405).end();
} 