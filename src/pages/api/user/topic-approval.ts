import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

function getTopicApprovalModel() {
  if ((prisma as any).topicApproval) return (prisma as any).topicApproval;
  if ((prisma as any).topic_approval) return (prisma as any).topic_approval;
  throw new Error("Prisma TopicApproval model not found");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const { userId, topic, auto } = req.body;
  if (!userId || !topic) return res.status(400).json({ error: "Missing userId or topic" });
  const topicApprovalModel = getTopicApprovalModel();
  // Find the latest unapproved TopicApproval for this user
  const approval = await topicApprovalModel.findFirst({
    where: { userId, approved: null },
    orderBy: { createdAt: "desc" },
  });
  if (!approval) return res.status(404).json({ error: "No pending topic approval found" });
  await topicApprovalModel.update({
    where: { id: approval.id },
    data: {
      approved: topic,
      auto: !!auto,
      approvedAt: new Date(),
    },
  });
  return res.status(200).json({ success: true });
} 