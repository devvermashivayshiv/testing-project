import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") return res.status(400).json({ error: "Invalid user id" });

  if (req.method === "GET") {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { onboarding: true, subscriptions: { where: { endDate: { gte: new Date() } }, include: { package: true } } },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json({ user });
  }

  if (req.method === "PATCH") {
    const { isAdmin, banned }: Record<string, unknown> = req.body;
    const data: Record<string, boolean> = {};
    if (typeof isAdmin === "boolean") data.isAdmin = isAdmin;
    if (typeof banned === "boolean") data.banned = banned;
    const user = await prisma.user.update({ where: { id }, data });
    return res.status(200).json({ user });
  }

  if (req.method === "DELETE") {
    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ success: true });
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 