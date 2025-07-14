import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { userId, title, content, pdfUrl } = req.body;
    if (!userId || !title || !content) return res.status(400).json({ error: "Missing fields" });
    try {
      const blog = await prisma.blog.create({
        data: { userId, title, content, pdfUrl },
      });
      return res.status(200).json({ success: true, blog });
    } catch (e) {
      return res.status(500).json({ error: "Failed to save blog" });
    }
  }
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") return res.status(400).json({ error: "Missing userId" });
    try {
      const blogs = await prisma.blog.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
      return res.status(200).json({ blogs });
    } catch (e) {
      return res.status(500).json({ error: "Failed to fetch blogs" });
    }
  }
  return res.status(405).end();
} 