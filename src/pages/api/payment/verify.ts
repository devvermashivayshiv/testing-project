import type { NextApiRequest, NextApiResponse } from "next";
import Razorpay from "razorpay";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !packageId) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  // Verify signature
  const generated_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");
  if (generated_signature !== razorpay_signature) {
    return res.status(400).json({ error: "Invalid payment signature" });
  }
  try {
    // Fetch order from Razorpay to get user email from notes
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const email = order.notes?.email;
    if (!email || typeof email !== "string") return res.status(400).json({ error: "User email not found in order notes" });
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });
    // Find package
    const pkg = await prisma.bloggingPackage.findUnique({ where: { id: packageId } });
    if (!pkg) return res.status(404).json({ error: "Package not found" });
    // Calculate endDate
    const startDate = new Date();
    const endDate = new Date(startDate);
    if (pkg.durationType === 'months') {
      endDate.setMonth(endDate.getMonth() + pkg.durationValue);
    } else {
      endDate.setDate(endDate.getDate() + pkg.durationValue);
    }
    // Save subscription
    await prisma.userSubscription.create({
      data: {
        userId: user.id,
        packageId: pkg.id,
        startDate,
        endDate,
        paymentId: razorpay_payment_id,
      },
    });
    // Update Payment table
    await prisma.payment.update({
      where: { orderId: razorpay_order_id },
      data: {
        paymentId: razorpay_payment_id,
        status: "paid",
        event: "payment.verified",
        rawPayload: JSON.parse(JSON.stringify(order)),
      },
    });
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to verify payment and save subscription" });
  }
} 