"use client";
import { useEffect, useState } from "react";
import "../../../cssdesign/admin.css";

interface Package {
  id: string;
  name: string;
  features: Record<string, any>;
  price: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
}

interface PremiumUser {
  id: string;
  userId: string;
  planId: string;
  accessType: string;
  startDate: string;
  endDate: string | null;
  plan: any;
}
interface User {
  id: string;
  name?: string;
  email?: string;
  banned?: boolean;
  payments?: any[];
  premiumUsers?: PremiumUser[];
}

const defaultFeatures: Record<string, any> = {
  postsPerDay: 1,
  postsPerMonth: 30,
  socialMediaIntegration: false,
  humanReview: false,
  seoAudit: false,
};

export default function AdminPanel() {
  return <main><h1>Admin Panel</h1></main>;
} 