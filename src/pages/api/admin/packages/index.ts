import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const {
        name,
        price,
        description,
        postsPerMonth,
        postsPerDay,
        maxWordCountPerPost,
        maxWebsites,
        plagiarismCheck,
        seoOptimization,
        aiDetectionBypass,
        withImages,
        manualReview,
        analyticsReport,
        adsenseReadinessReport,
        prioritySupport,
        customOptions,
        isActive,
        sortOrder
      } = req.body;

      if (!name || !price) {
        return res.status(400).json({ error: "Name and price are required." });
      }

      const pkg = await prisma.bloggingPackage.create({
        data: {
          name,
          price: parseFloat(price),
          description: description || "",
          postsPerMonth: parseInt(postsPerMonth) || 0,
          postsPerDay: parseInt(postsPerDay) || 0,
          maxWordCountPerPost: parseInt(maxWordCountPerPost) || 0,
          maxWebsites: parseInt(maxWebsites) || 0,
          plagiarismCheck: !!plagiarismCheck,
          seoOptimization: !!seoOptimization,
          aiDetectionBypass: !!aiDetectionBypass,
          withImages: !!withImages,
          manualReview: !!manualReview,
          analyticsReport: !!analyticsReport,
          adsenseReadinessReport: !!adsenseReadinessReport,
          prioritySupport: !!prioritySupport,
          customOptions: customOptions ? customOptions : {},
          isActive: typeof isActive === 'boolean' ? isActive : true,
          sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        },
      });
      return res.status(201).json({ package: pkg });
    } catch (err) {
      return res.status(500).json({ error: "Failed to create package", details: err });
    }
  } else if (req.method === "GET") {
    try {
      const packages = await prisma.bloggingPackage.findMany({
        where: { isActive: true },
        orderBy: [
          { sortOrder: "asc" },
          { createdAt: "desc" }
        ]
      });
      return res.status(200).json({ packages });
    } catch (err) {
      return res.status(500).json({ error: "Failed to fetch packages", details: err });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 