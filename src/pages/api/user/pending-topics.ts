import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getTopicApprovalModel() {
  if ((prisma as any).topicApproval) return (prisma as any).topicApproval;
  if ((prisma as any).topic_approval) return (prisma as any).topic_approval;
  throw new Error("Prisma TopicApproval model not found");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const topicApprovalModel = getTopicApprovalModel();

  if (req.method === "POST") {
    const { userId, topics } = req.body;
    if (!userId || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({ error: "Missing userId or topics" });
    }
    await topicApprovalModel.create({
      data: {
        userId,
        topics,
      },
    });
    return res.status(200).json({ success: true });
  }
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") return res.status(400).json({ error: "Missing userId" });
    const approval = await topicApprovalModel.findFirst({
      where: { userId, approved: null },
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ topics: approval ? approval.topics : [] });
  }
  return res.status(405).end();
} 