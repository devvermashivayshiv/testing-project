import React, { useEffect, useState, useCallback } from "react";
import { BloggingPackage } from "./CreatePackage";

// Define User and Onboarding types
interface Onboarding {
  id: string;
  userId: string;
  hasWebsite: string;
  websiteCreationDate: string;
  numBlogs: number;
  monthlyReach: number;
  websitePurpose: string;
  blogNiche: string;
  experience: string;
  contentGoals: string;
  blogUrl: string;
  languages?: string;
  targetAudience?: string;
  socialHandles?: string;
  editLocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: string | number | boolean | undefined;
}
interface User {
  id: string;
  name?: string;
  email?: string;
  isAdmin: boolean;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
  onboarding?: Onboarding[];
}

interface UserActivePlan {
  package?: { name: string };
  endDate?: string;
}

export default function UserManagement() {
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState<boolean>(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [allPackages, setAllPackages] = useState<BloggingPackage[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [userActivePlan, setUserActivePlan] = useState<UserActivePlan | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Action handlers
  const handleBan = async (user: User) => {
    setActionLoading("ban");
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banned: !user.banned }),
      });
      setModalUser({ ...user, banned: !user.banned });
      fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };
  const handleAdmin = async (user: User) => {
    setActionLoading("admin");
    try {
      await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: !user.isAdmin }),
      });
      setModalUser({ ...user, isAdmin: !user.isAdmin });
      fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };
  const handleDelete = async (user: User) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    setActionLoading("delete");
    try {
      await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      setModalUser(null);
      fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };
  const handleViewOnboarding = async (user: User) => {
    setOnboardingLoading(true);
    setOnboarding(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`);
      const data = await res.json();
      setOnboarding(data.user?.onboarding?.[0] || null);
    } finally {
      setOnboardingLoading(false);
    }
  };

  const fetchAllPackages = async () => {
    const res = await fetch("/api/admin/packages");
    const data = await res.json();
    setAllPackages(data.packages || []);
  };

  const fetchUserActivePlan = async (userId: string) => {
    setPlanLoading(true);
    const res = await fetch(`/api/admin/users/${userId}`);
    const data = await res.json();
    setUserActivePlan(data.user?.subscriptions?.[0] || null);
    setPlanLoading(false);
  };

  const openPlanModal = (user: User) => {
    setModalUser(user);
    setPlanModalOpen(true);
    setSelectedPlan("");
    setUserActivePlan(null);
    fetchAllPackages();
    fetchUserActivePlan(user.id);
  };

  const handleAssignPlan = async () => {
    if (!modalUser || !selectedPlan) return;
    setActionLoading("assign-plan");
    try {
      const res = await fetch(`/api/admin/users/${modalUser.id}/add-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: selectedPlan })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to assign plan");
      } else {
        fetchUserActivePlan(modalUser.id);
        fetchUsers();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemovePlan = async () => {
    if (!modalUser) return;
    setActionLoading("remove-plan");
    try {
      const res = await fetch(`/api/admin/users/${modalUser.id}/remove-plan`, {
        method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to remove plan");
      } else {
        setUserActivePlan(null);
        fetchUsers();
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', padding: 24 }}>
      <h2 style={{ marginBottom: 18 }}>User Management</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
        />
      </div>
      {error && <div style={{ color: '#d32f2f', marginBottom: 10 }}>{error}</div>}
      {loading ? <div>Loading users...</div> : (
        <>
          <table className="admin-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Admin</th>
                <th>Banned</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center' }}>No users found.</td></tr>
              ) : users.map(user => (
                <tr key={user.id}>
                  <td>{user.name || '-'}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? "Yes" : "No"}</td>
                  <td>{user.banned ? "Yes" : "No"}</td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <button style={{ marginRight: 6 }} onClick={() => setModalUser(user)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        </>
      )}
      {/* User Details Modal */}
      {modalUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: '0 2px 16px rgba(0,0,0,0.13)' }}>
            <h3>User Details</h3>
            <div><b>Name:</b> {modalUser.name}</div>
            <div><b>Email:</b> {modalUser.email}</div>
            <div><b>Admin:</b> {modalUser.isAdmin ? "Yes" : "No"}</div>
            <div><b>Banned:</b> {modalUser.banned ? "Yes" : "No"}</div>
            <div><b>Created:</b> {modalUser.createdAt ? new Date(modalUser.createdAt).toLocaleString() : '-'}</div>
            <div><b>Updated:</b> {modalUser.updatedAt ? new Date(modalUser.updatedAt).toLocaleString() : '-'}</div>
            <hr style={{ margin: '18px 0' }} />
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Actions</div>
            <button style={{ marginRight: 8, marginBottom: 8 }} onClick={() => handleBan(modalUser)} disabled={!!actionLoading}>{modalUser.banned ? "Unban (w)" : "Ban (w)"}</button>
            <button style={{ marginRight: 8, marginBottom: 8 }} onClick={() => handleAdmin(modalUser)} disabled={!!actionLoading}>{modalUser.isAdmin ? "Remove Admin (w)" : "Make Admin (w)"}</button>
            <button style={{ marginRight: 8, marginBottom: 8 }} onClick={() => handleViewOnboarding(modalUser)} disabled={onboardingLoading}>{onboardingLoading ? "Loading..." : "View Onboarding (w)"}</button>
            <button style={{ marginRight: 8, marginBottom: 8 }} onClick={() => openPlanModal(modalUser)}>Add/Remove Plan</button>
            <button style={{ marginRight: 8, marginBottom: 8 }}>View Automation Usage (n)</button>
            <button style={{ marginRight: 8, marginBottom: 8, background: '#c0392b', color: '#fff' }} onClick={() => handleDelete(modalUser)} disabled={!!actionLoading}>Delete (w)</button>
            <button style={{ marginRight: 8, marginBottom: 8 }}>Manual Expiry/Extension (n)</button>
            <button style={{ marginRight: 8, marginBottom: 8 }}>View Login History (n)</button>
            {onboarding && (
              <div style={{ marginTop: 18, background: '#f9f9f9', borderRadius: 8, padding: 16 }}>
                <h4 style={{ marginBottom: 8 }}>Onboarding Data</h4>
                {Object.entries(onboarding).map(([k, v]) => (
                  <div key={k}><b>{k}:</b> {String(v)}</div>
                ))}
              </div>
            )}
            {onboarding === null && !onboardingLoading && (
              <div style={{ marginTop: 18, color: '#888' }}>No onboarding data found.</div>
            )}
            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <button onClick={() => { setModalUser(null); setOnboarding(null); }} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 500, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
      {planModalOpen && modalUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 32, minWidth: 340, maxWidth: 420, boxShadow: '0 2px 16px rgba(0,0,0,0.13)' }}>
            <h3>Manage Plan for {modalUser.name || modalUser.email}</h3>
            {planLoading ? <div>Loading...</div> : userActivePlan ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <b>Active Plan:</b> {userActivePlan.package?.name} <br />
                  <b>Expires:</b> {userActivePlan.endDate ? new Date(userActivePlan.endDate).toLocaleString() : "-"}
                </div>
                <button onClick={handleRemovePlan} disabled={!!actionLoading} style={{ background: '#c0392b', color: '#fff', borderRadius: 6, padding: '8px 20px', fontWeight: 500, marginBottom: 12 }}>Remove Plan</button>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label>Select Plan:</label>
                  <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }}>
                    <option value="">-- Select --</option>
                    {allPackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>{pkg.name} (₹{pkg.price}, {pkg.durationValue} {pkg.durationType}{pkg.durationValue > 1 ? 's' : ''})</option>
                    ))}
                  </select>
                </div>
                <button onClick={handleAssignPlan} disabled={!selectedPlan || !!actionLoading} style={{ background: '#0070f3', color: '#fff', borderRadius: 6, padding: '8px 20px', fontWeight: 500 }}>Assign Plan</button>
              </>
            )}
            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <button onClick={() => { setPlanModalOpen(false); setUserActivePlan(null); }} style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 500, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 