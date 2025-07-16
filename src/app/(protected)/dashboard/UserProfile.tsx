import React, { useEffect, useState } from "react";
import Link from "next/link";

interface UserProfileData {
  name?: string;
  email?: string;
  createdAt?: string;
  isAdmin?: boolean;
  subscriptions?: Array<{
    package: { name: string; price: number; durationMonths: number };
    endDate: string;
  }>;
}

export default function UserProfile() {
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const res = await fetch("/api/user/me");
      const data = await res.json();
      if (data.user) {
        // Fetch active subscription
        const subRes = await fetch(`/api/admin/users/${data.user.id}`);
        const subData = await subRes.json();
        setUser({
          name: data.user.name,
          email: data.user.email,
          createdAt: data.user.createdAt,
          isAdmin: data.user.isAdmin,
          subscriptions: subData.user?.subscriptions || [],
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <div>Loading profile...</div>;
  if (!user) return <div>Could not load user profile.</div>;

  const activePlan = user.subscriptions && user.subscriptions.length > 0 ? user.subscriptions[0] : null;

  return (
    <div style={{ maxWidth: 480, margin: "2em auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", padding: "2.5em 2em" }}>
      <h2 style={{ marginBottom: 18 }}>Profile</h2>
      <div style={{ marginBottom: 10 }}><b>Name:</b> {user.name || "-"}</div>
      <div style={{ marginBottom: 10 }}><b>Email:</b> {user.email || "-"}</div>
      <div style={{ marginBottom: 10 }}><b>Account Created:</b> {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</div>
      <div style={{ marginBottom: 10 }}><b>Admin:</b> {user.isAdmin ? "Yes" : "No"}</div>
      {activePlan ? (
        <div style={{ marginTop: 18, background: "#f9f9f9", borderRadius: 8, padding: 16 }}>
          <b>Active Plan:</b> {activePlan.package.name} <br />
          <b>Price:</b> ₹{activePlan.package.price} <br />
          <b>Duration:</b> {activePlan.package.durationMonths} month{activePlan.package.durationMonths > 1 ? "s" : ""} <br />
          <b>Expires:</b> {activePlan.endDate ? new Date(activePlan.endDate).toLocaleString() : "-"}
        </div>
      ) : (
        <div style={{ marginTop: 18, background: "#fff3cd", borderRadius: 8, padding: 16, color: "#856404" }}>
          <b>No active plan found.</b>
          <div style={{ marginTop: 10 }}>
            <Link href="/plans">
              <button style={{ background: "#0070f3", color: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontWeight: 500, cursor: "pointer" }}>
                Purchase a Plan
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 