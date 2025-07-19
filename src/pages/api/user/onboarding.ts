import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../lib/authOptions";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, automationActive: true, name: true, email: true, emailVerified: true, image: true, createdAt: true, updatedAt: true, isAdmin: true, banned: true } });
  if (!user) return res.status(401).json({ error: "User not found" });

  if (req.method === "GET") {
    const onboarding = await prisma.onboarding.findUnique({ where: { userId: user.id } });
    return res.status(200).json({ onboarding });
  }

  if (req.method === "POST") {
    // Only allow if onboarding does not exist
    const exists = await prisma.onboarding.findUnique({ where: { userId: user.id } });
    if (exists) return res.status(400).json({ error: "Onboarding already exists" });
    const {
      hasWebsite,
      websiteCreationDate,
      numBlogs,
      monthlyReach,
      websitePurpose,
      blogNiche,
      experience,
      contentGoals,
      blogUrl,
      languages,
      targetAudience,
      socialHandles
    } = req.body;
    const isNoWebsite = hasWebsite === "No";
    const onboarding = await prisma.onboarding.create({
      data: {
        userId: user.id,
        hasWebsite,
        websiteCreationDate: isNoWebsite ? "" : websiteCreationDate,
        numBlogs: isNoWebsite ? 0 : numBlogs,
        monthlyReach: isNoWebsite ? 0 : monthlyReach,
        websitePurpose: isNoWebsite ? "" : websitePurpose,
        blogNiche: isNoWebsite ? "" : blogNiche,
        experience: isNoWebsite ? "" : experience,
        contentGoals: isNoWebsite ? "" : contentGoals,
        blogUrl: isNoWebsite ? "" : blogUrl,
        languages,
        targetAudience,
        socialHandles,
      },
    });
    return res.status(201).json({ onboarding });
  }

  if (req.method === "PUT") {
    // Only allow if not locked and automation not active
    const onboarding = await prisma.onboarding.findUnique({ where: { userId: user.id } });
    if (!onboarding) return res.status(404).json({ error: "Onboarding not found" });
    if (onboarding.editLocked) return res.status(403).json({ error: "Onboarding is locked and cannot be edited" });
    if (user.automationActive) return res.status(403).json({ error: "Onboarding cannot be edited while automation is running." });
    const {
      hasWebsite,
      websiteCreationDate,
      numBlogs,
      monthlyReach,
      websitePurpose,
      blogNiche,
      experience,
      contentGoals,
      blogUrl,
      languages,
      targetAudience,
      socialHandles
    } = req.body;
    const isNoWebsite = hasWebsite === "No";
    const updated = await prisma.onboarding.update({
      where: { userId: user.id },
      data: {
        hasWebsite,
        websiteCreationDate: isNoWebsite ? "" : websiteCreationDate,
        numBlogs: isNoWebsite ? 0 : numBlogs,
        monthlyReach: isNoWebsite ? 0 : monthlyReach,
        websitePurpose: isNoWebsite ? "" : websitePurpose,
        blogNiche: isNoWebsite ? "" : blogNiche,
        experience: isNoWebsite ? "" : experience,
        contentGoals: isNoWebsite ? "" : contentGoals,
        blogUrl: isNoWebsite ? "" : blogUrl,
        languages,
        targetAudience,
        socialHandles,
      },
    });
    return res.status(200).json({ onboarding: updated });
  }

  return res.status(405).end();
} 