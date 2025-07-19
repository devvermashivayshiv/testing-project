import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../lib/authOptions";

const prisma = new PrismaClient();

const N8N_WEBHOOK_URL = 'https://devtesting.app.n8n.cloud/webhook-test/blogging-automation'; // Replace with your actual n8n URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return res.status(404).json({ error: "User not found" });

  if (req.body.action === 'stop') {
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { 
        automationActive: false,
        automationStatus: "paused"
      } 
    });
    return res.status(200).json({ success: true, stopped: true });
  }

  // Check onboarding
  const onboarding = await prisma.onboarding.findUnique({ where: { userId: user.id } });
  if (!onboarding) return res.status(400).json({ error: "Complete onboarding first." });
  // Check plan
  const hasPlan = user.freeTrialActive || (await prisma.userSubscription.count({ where: { userId: user.id, endDate: { gte: new Date() } } })) > 0;
  if (!hasPlan) return res.status(400).json({ error: "Activate a plan first." });
  // Set automationActive
  await prisma.user.update({ 
    where: { id: user.id }, 
    data: { 
      automationActive: true,
      automationStartedAt: new Date(),
      automationStatus: "running",
      lastAutomationRun: new Date(),
      automationRunsCount: { increment: 1 }
    } 
  });

  // Trigger n8n workflow with userId and email
  try {
    await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email })
    });
  } catch (err) {
    // Optionally log error, but don't block user
    console.error('Failed to trigger n8n:', err);
  }

  return res.status(200).json({ success: true });
} 