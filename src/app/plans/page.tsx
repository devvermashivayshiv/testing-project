"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import "../../cssdesign/plans.css";

interface Plan {
  id: string;
  name: string;
  features: Record<string, any>;
  price: number;
  duration: number;
  isActive: boolean;
}

interface PremiumUser {
  id: string;
  userId: string;
  planId: string;
  accessType: string;
  startDate: string;
  endDate: string | null;
  plan: Plan;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Plans() {
  return <main><h1>Plans</h1></main>;
} 