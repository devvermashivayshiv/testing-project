import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../../lib/authOptions";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { key } = req.body;
  if (!key || key !== process.env.ADMINKEY) {
    
    return res.status(403).json({ error: "Invalid admin key" });
  }
  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { isAdmin: true },
  });
  // DEBUG: Log user after making admin
 
  return res.status(200).json({ success: true, user });
} 