"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import "../../../cssdesign/dashboard.css";
import { useRef } from "react";

interface AutomationStatus {
  automationActive: boolean;
  trialUsed: boolean;
  trialStartDate?: string | null;
  trialEndDate?: string | null;
}

const stepTabs = [
  { key: "how", label: "How It Works" },
  { key: "login", label: "Login" },
  { key: "onboarding", label: "Onboarding" },
  { key: "payment", label: "Payment" },
  { key: "topicApproval", label: "Topic Approval" },
  { key: "automation", label: "Automation" },
];

export default function Dashboard() {
  return <main><h1>Dashboard</h1></main>;
} 