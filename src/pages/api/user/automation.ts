import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, action } = req.method === "POST" ? req.body : req.query;
  if (!userId || typeof userId !== "string") return res.status(400).json({ error: "Missing userId" });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (req.method === "GET") {
    // Return automation status
    return res.status(200).json({
      automationActive: user.automationActive,
    });
  }

  if (req.method === "POST") {
    if (!action) return res.status(400).json({ error: "Missing action" });
    if (action === "startAutomation") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          automationActive: true,
        },
      });
      return res.status(200).json({ success: true, automationActive: true });
    }
    if (action === "stopAutomation") {
      await prisma.user.update({ where: { id: userId }, data: { automationActive: false } });
      return res.status(200).json({ success: true, automationActive: false });
    }
    return res.status(400).json({ error: "Unknown action" });
  }

  return res.status(405).end();
} 