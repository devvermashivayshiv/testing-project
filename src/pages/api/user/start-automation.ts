import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../lib/authOptions";

const prisma = new PrismaClient();

const N8N_WEBHOOK_URL = 'https://devtesting.app.n8n.cloud/webhook-test/blogging-automation'; // Replace with your actual n8n URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('=== START AUTOMATION API CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  if (req.method !== "POST") {
    console.log('ERROR: Method not allowed -', req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }
  console.log('Getting session...');
  const session = await getServerSession(req, res, authOptions);
  console.log('Session:', session ? 'exists' : 'null');
  console.log('Session user:', session?.user);
  
  if (!session || !session.user?.email) {
    console.log('ERROR: Unauthorized - no session or email');
    return res.status(401).json({ error: "Unauthorized" });
  }
  console.log('Finding user with email:', session.user.email);
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  console.log('User found:', user ? 'yes' : 'no');
  console.log('User ID:', user?.id);
  
  if (!user) {
    console.log('ERROR: User not found');
    return res.status(404).json({ error: "User not found" });
  }

  console.log('Action:', req.body.action);
  
  if (req.body.action === 'stop') {
    console.log('Stopping automation for user:', user.id);
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { 
        automationActive: false,
        automationStatus: "paused"
      } 
    });
    console.log('Automation stopped successfully');
    return res.status(200).json({ success: true, stopped: true });
  }

  // Check onboarding
  console.log('Checking onboarding for user:', user.id);
  const onboarding = await prisma.onboarding.findUnique({ where: { userId: user.id } });
  console.log('Onboarding found:', onboarding ? 'yes' : 'no');
  
  if (!onboarding) {
    console.log('ERROR: Onboarding not complete');
    return res.status(400).json({ error: "Complete onboarding first." });
  }
  
  // Check plan
  console.log('Checking plan for user:', user.id);
  console.log('User freeTrialActive:', user.freeTrialActive);
  const subscriptionCount = await prisma.userSubscription.count({ where: { userId: user.id, endDate: { gte: new Date() } } });
  console.log('Active subscriptions count:', subscriptionCount);
  const hasPlan = user.freeTrialActive || subscriptionCount > 0;
  console.log('Has active plan:', hasPlan);
  
  if (!hasPlan) {
    console.log('ERROR: No active plan');
    return res.status(400).json({ error: "Activate a plan first." });
  }
  // Set automationActive
  console.log('Starting automation for user:', user.id);
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
  console.log('User updated successfully');

  // Trigger n8n workflow with userId and email
  console.log('Triggering n8n webhook:', N8N_WEBHOOK_URL);
  try {
    const n8nResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, email: user.email })
    });
    console.log('n8n response status:', n8nResponse.status);
    console.log('n8n response ok:', n8nResponse.ok);
  } catch (err) {
    // Optionally log error, but don't block user
    console.error('Failed to trigger n8n:', err);
  }

  console.log('=== START AUTOMATION SUCCESS ===');
  return res.status(200).json({ success: true });
} 