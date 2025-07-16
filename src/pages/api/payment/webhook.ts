import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

export const config = {
  api: { bodyParser: false }, // Required for raw body
};

const prisma = new PrismaClient();

function buffer(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const rawBody = await buffer(req);
  const signature = req.headers["x-razorpay-signature"] as string;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  if (signature !== expectedSignature) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(rawBody.toString());

  // Log all events for audit
  await prisma.payment.create({
    data: {
      orderId: event.payload?.payment?.entity?.order_id || event.payload?.order?.entity?.id || "unknown",
      paymentId: event.payload?.payment?.entity?.id || null,
      userId: "webhook", // Not always available, for audit only
      packageId: "webhook", // Not always available, for audit only
      amount: event.payload?.payment?.entity?.amount ? event.payload.payment.entity.amount / 100 : 0,
      status: event.event,
      event: event.event,
      rawPayload: JSON.parse(JSON.stringify(event)),
    },
  });

  // Example: handle payment.captured
  if (event.event === "payment.captured") {
    const paymentId = event.payload.payment.entity.id;
    const orderId = event.payload.payment.entity.order_id;
    // Update Payment table to mark as paid
    await prisma.payment.updateMany({
      where: { orderId },
      data: { status: "paid", paymentId, event: event.event, rawPayload: JSON.parse(JSON.stringify(event)) },
    });
    // TODO: Optionally, activate subscription if not already done
  }

  res.status(200).json({ received: true });
} 