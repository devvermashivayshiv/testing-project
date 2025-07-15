"use client";
import React, { useEffect, useState } from "react";
import "../../cssdesign/plans.css";
import { BloggingPackage } from "../(protected)/admin-panel/CreatePackage";

export default function PlansPage() {
  const [plans, setPlans] = useState<BloggingPackage[]>([]);
  const [loading, setLoading] = useState(true);

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
              <button className="plan-buy-btn">Buy Now</button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
} 