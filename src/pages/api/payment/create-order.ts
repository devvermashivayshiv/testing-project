import type { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { amount, packageId, email, name } = req.body;
  if (!amount || !packageId || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // Validate package and amount
  const pkg = await prisma.bloggingPackage.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) {
    return res.status(404).json({ error: "Package not found" });
  }
  if (Number(pkg.price) !== Number(amount)) {
    return res.status(400).json({ error: "Invalid amount" });
  }
  // Fetch user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // INR paise
      currency: "INR",
      receipt: `receipt_${packageId}_${Date.now()}`,
      notes: {
        email,
        name,
        packageId,
      },
    });
    // Log order in Payment table
    await prisma.payment.create({
      data: {
        orderId: order.id,
        userId: user.id,
        packageId,
        amount: pkg.price,
        status: "created",
        event: "order.created",
        rawPayload: JSON.parse(JSON.stringify(order)),
      },
    });
    res.status(200).json({ orderId: order.id, amount: order.amount });
  } catch {
    res.status(500).json({ error: "Failed to create order" });
  }
} 