import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid package id" });
  }

  if (req.method === "PUT") {
    try {
      const data = req.body;
      const pkg = await prisma.bloggingPackage.update({
        where: { id },
        data: {
          ...data,
          price: data.price ? parseFloat(data.price) : undefined,
          postsPerMonth: data.postsPerMonth ? parseInt(data.postsPerMonth) : undefined,
          postsPerDay: data.postsPerDay ? parseInt(data.postsPerDay) : undefined,
          maxWordCountPerPost: data.maxWordCountPerPost ? parseInt(data.maxWordCountPerPost) : undefined,
          maxWebsites: data.maxWebsites ? parseInt(data.maxWebsites) : undefined,
          customOptions: data.customOptions ? data.customOptions : undefined,
        },
      });
      return res.status(200).json({ package: pkg });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update package", details: err });
    }
  } else if (req.method === "DELETE") {
    try {
      const pkg = await prisma.bloggingPackage.update({
        where: { id },
        data: { isActive: false },
      });
      return res.status(200).json({ package: pkg });
    } catch (err) {
      return res.status(500).json({ error: "Failed to soft delete package", details: err });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 