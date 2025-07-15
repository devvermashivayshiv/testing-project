"use client";
import "../../../cssdesign/admin.css";
import React, { useEffect, useState } from "react";
import CreatePackage, { BloggingPackage } from "./CreatePackage";
import { useSession } from "next-auth/react";
import UserManagement from "./UserManagement";

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [key, setKey] = useState("");
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyError, setKeyError] = useState("");
  const [tab, setTab] = useState("packages");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<BloggingPackage> | null>(null);
  const [packages, setPackages] = useState<BloggingPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Fetch user info to check isAdmin
  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.email) return;
      const res = await fetch("/api/user/me");
      const data = await res.json();
      setIsAdmin(!!data.user?.isAdmin);
    };
    if (status === "authenticated") fetchUser();
  }, [session, status]);

  // Handle admin key submit
  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setKeyLoading(true);
    setKeyError("");
    try {
      const res = await fetch("/api/admin/make-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid key");
      setIsAdmin(true);
      setKey("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setKeyError(err.message || "Invalid key");
      } else {
        setKeyError("Invalid key");
      }
    } finally {
      setKeyLoading(false);
    }
  };

  // Fetch packages logic
  const fetchPackages = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/packages");
    const data = await res.json();
    setPackages(data.packages || []);
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, []);

  const handleCreated = () => {
    setShowForm(false);
    setEditId(null);
    setEditData(null);
    fetchPackages();
  };

  const handleEdit = (pkg: BloggingPackage) => {
    setEditId(pkg.id);
    setEditData(pkg);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    setActionLoading(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchPackages();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to delete");
      } else {
        setError("Failed to delete");
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <main style={{ maxWidth: isAdmin === false ? 400 : 800, margin: isAdmin === false ? "4em auto" : "0 auto", background: isAdmin === false ? "#fff" : undefined, borderRadius: isAdmin === false ? 10 : undefined, boxShadow: isAdmin === false ? "0 2px 16px rgba(0,0,0,0.07)" : undefined, padding: isAdmin === false ? 32 : undefined }}>
      {isAdmin === null ? (
        <div style={{textAlign: 'center', marginTop: '4em', fontSize: 20}}>Loading...</div>
      ) : isAdmin === false ? (
        <>
          <h2 style={{ textAlign: "center", marginBottom: 24 }}>Admin Access Required</h2>
          <form onSubmit={handleKeySubmit}>
            <label htmlFor="admin-key">Enter Admin Key</label>
            <input
              id="admin-key"
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              style={{ width: "100%", padding: 10, margin: "12px 0 18px 0", borderRadius: 6, border: "1px solid #ddd" }}
              autoFocus
            />
            <button type="submit" style={{ width: "100%", background: "#0070f3", color: "#fff", border: "none", borderRadius: 6, padding: "10px 0", fontWeight: 500 }} disabled={keyLoading}>
              {keyLoading ? "Checking..." : "Unlock Admin Panel"}
            </button>
            {keyError && <div style={{ color: "#d32f2f", marginTop: 12, textAlign: "center" }}>{keyError}</div>}
          </form>
        </>
      ) : (
        <>
          <h1 style={{ margin: "1.5em 0 1em 0" }}>Admin Panel</h1>
          <div className="admin-tabs">
            <button className={tab === "packages" ? "admin-tab active" : "admin-tab"} style={{ border: "none" }} onClick={() => setTab("packages")}>Packages</button>
            <button className={tab === "users" ? "admin-tab active" : "admin-tab"} style={{ border: "none" }} onClick={() => setTab("users")}>User Management</button>
          </div>
          <div>
            {tab === "packages" ? (
              <>
                <button onClick={() => { setEditId(null); setEditData(null); setShowForm(true); }} style={{ background: '#0070f3', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 500, marginBottom: 24, cursor: 'pointer' }}>Create Package</button>
                <CreatePackage
                  open={showForm}
                  onClose={() => setShowForm(false)}
                  onCreated={handleCreated}
                  mode={editId ? 'edit' : 'create'}
                  initialData={editData || undefined}
                  packageId={editId || undefined}
                />
                {error && <div style={{ color: '#d32f2f', marginBottom: 10 }}>{error}</div>}
                {loading ? <div>Loading packages...</div> : (
                  <div style={{ marginTop: 18 }}>
                    {packages.length === 0 ? <div>No packages found.</div> : (
                      <table className="admin-table" style={{ width: '100%', marginTop: 10 }}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Posts/Month</th>
                            <th>Features</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {packages.map(pkg => (
                            <tr key={pkg.id}>
                              <td>{pkg.name}</td>
                              <td>{pkg.price}</td>
                              <td>{pkg.postsPerMonth}</td>
                              <td style={{ fontSize: 13 }}>
                                {pkg.plagiarismCheck && <span>Plagiarism, </span>}
                                {pkg.seoOptimization && <span>SEO, </span>}
                                {pkg.aiDetectionBypass && <span>AI-Free, </span>}
                                {pkg.withImages && <span>Images, </span>}
                                {pkg.manualReview && <span>Manual, </span>}
                                {pkg.analyticsReport && <span>Analytics, </span>}
                                {pkg.adsenseReadinessReport && <span>AdSense, </span>}
                                {pkg.prioritySupport && <span>Priority, </span>}
                              </td>
                              <td>
                                <button
                                  style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, marginRight: 8, cursor: 'pointer' }}
                                  onClick={() => handleEdit(pkg)}
                                  disabled={!!actionLoading}
                                >
                                  Edit
                                </button>
                                <button
                                  style={{ background: '#c0392b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 500, cursor: 'pointer' }}
                                  onClick={() => handleDelete(pkg.id)}
                                  disabled={!!actionLoading}
                                >
                                  {actionLoading === pkg.id ? 'Deleting...' : 'Delete'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </>
            ) : (
              <UserManagement />
            )}
          </div>
        </>
      )}
    </main>
  );
} 