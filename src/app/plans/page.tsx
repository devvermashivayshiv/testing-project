"use client";
import React, { useEffect, useState } from "react";
import "../../cssdesign/plans.css";
import { BloggingPackage } from "../(protected)/admin-panel/CreatePackage";
import { useSession } from "next-auth/react";

// Add Razorpay type declaration

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export default function PlansPage() {
  const [plans, setPlans] = useState<BloggingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userActivePlanId, setUserActivePlanId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      setLoading(true);
      const res = await fetch("/api/admin/packages");
      const data = await res.json();
      setPlans(data.packages || []);
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const { data: session } = useSession();

  useEffect(() => {
    const fetchActivePlan = async () => {
      if (!session || !session.user) return;
      const res = await fetch(`/api/user/me`);
      const data = await res.json();
      if (data.user) {
        const subRes = await fetch(`/api/admin/users/${data.user.id}`);
        const subData = await subRes.json();
        const active = subData.user?.subscriptions?.[0];
        setUserActivePlanId(active?.package?.id || null);
      }
    };
    fetchActivePlan();
  }, [session]);

  // Razorpay script loader
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleBuyNow = async (plan: BloggingPackage) => {
    if (!session || !session.user?.email) {
      alert("Please login to purchase a plan.");
      return;
    }
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          packageId: plan.id,
          email: session.user.email,
          name: session.user.name || "User"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: "INR",
        name: "AutoEarn",
        description: plan.name,
        order_id: data.orderId,
        handler: async function (response: unknown) {
          if (
            typeof response === 'object' &&
            response !== null &&
            'razorpay_order_id' in response &&
            'razorpay_payment_id' in response &&
            'razorpay_signature' in response
          ) {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: (response as { razorpay_order_id: string }).razorpay_order_id,
                razorpay_payment_id: (response as { razorpay_payment_id: string }).razorpay_payment_id,
                razorpay_signature: (response as { razorpay_signature: string }).razorpay_signature,
                packageId: plan.id
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              alert("Payment successful!");
              window.location.reload();
            } else {
              alert("Payment verification failed: " + (verifyData.error || "Unknown error"));
            }
          } else {
            alert("Payment response invalid.");
          }
        },
        prefill: {
          email: session.user.email,
          name: session.user.name || "User"
        },
        theme: { color: "#0070f3" }
      };
      
      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert("Razorpay is not loaded.");
      }
    } catch (err) {
      alert("Payment error: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  return (
    <main className="plans-main">
      <h1 className="plans-title">Choose Your Plan</h1>
      {loading ? <div className="plans-loading">Loading plans...</div> : (
        <div className="plans-grid">
          {plans.length === 0 ? <div>No plans available.</div> : plans.map(plan => (
            <div className="plan-card" key={plan.id}>
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">₹{plan.price}</div>
              <div className="plan-desc">{plan.description}</div>
              <div className="plan-meta">
                <span><b>{plan.postsPerMonth}</b> posts/month</span>
                <span><b>{plan.maxWebsites}</b> website{plan.maxWebsites > 1 ? 's' : ''}</span>
              </div>
              <ul className="plan-features">
                {plan.plagiarismCheck && <li>Plagiarism Check</li>}
                {plan.seoOptimization && <li>SEO Optimization</li>}
                {plan.aiDetectionBypass && <li>AI Detection Bypass</li>}
                {plan.withImages && <li>With Images</li>}
                {plan.manualReview && <li>Manual Review</li>}
                {plan.analyticsReport && <li>Analytics Report</li>}
                {plan.adsenseReadinessReport && <li>AdSense Readiness Report</li>}
                {plan.prioritySupport && <li>Priority Support</li>}
              </ul>
              {userActivePlanId === plan.id ? (
                <button className="plan-buy-btn" disabled style={{ background: '#28a745' }}>Active Now</button>
              ) : (
                <button className="plan-buy-btn" onClick={() => handleBuyNow(plan)}>Buy Now</button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
} 