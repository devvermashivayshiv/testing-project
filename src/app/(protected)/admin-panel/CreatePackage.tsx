import React, { useState, useEffect } from "react";

// Define BloggingPackage type based on Prisma schema
export type BloggingPackage = {
  id: string;
  name: string;
  price: number;
  description: string;
  postsPerMonth: number;
  postsPerDay: number;
  maxWordCountPerPost: number;
  maxWebsites: number;
  plagiarismCheck: boolean;
  seoOptimization: boolean;
  aiDetectionBypass: boolean;
  withImages: boolean;
  manualReview: boolean;
  analyticsReport: boolean;
  adsenseReadinessReport: boolean;
  prioritySupport: boolean;
  customOptions?: Record<string, unknown>;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  mode?: 'create' | 'edit';
  initialData?: Partial<BloggingPackage>;
  packageId?: string;
};

const defaultFeatures = {
  plagiarismCheck: false,
  seoOptimization: false,
  aiDetectionBypass: false,
  withImages: false,
  manualReview: false,
  analyticsReport: false,
  adsenseReadinessReport: false,
  prioritySupport: false,
};
type FeatureKey = keyof typeof defaultFeatures;

export default function CreatePackage({ open, onClose, onCreated, mode = 'create', initialData, packageId }: Props) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [postsPerMonth, setPostsPerMonth] = useState("");
  const [postsPerDay, setPostsPerDay] = useState("");
  const [maxWordCountPerPost, setMaxWordCountPerPost] = useState("");
  const [maxWebsites, setMaxWebsites] = useState("");
  const [features, setFeatures] = useState({ ...defaultFeatures });
  const [jsonOptions, setJsonOptions] = useState("{}");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      setName(initialData.name || "");
      setPrice(initialData.price?.toString() || "");
      setDescription(initialData.description || "");
      setPostsPerMonth(initialData.postsPerMonth?.toString() || "");
      setPostsPerDay(initialData.postsPerDay?.toString() || "");
      setMaxWordCountPerPost(initialData.maxWordCountPerPost?.toString() || "");
      setMaxWebsites(initialData.maxWebsites?.toString() || "");
      setFeatures({
        plagiarismCheck: !!initialData.plagiarismCheck,
        seoOptimization: !!initialData.seoOptimization,
        aiDetectionBypass: !!initialData.aiDetectionBypass,
        withImages: !!initialData.withImages,
        manualReview: !!initialData.manualReview,
        analyticsReport: !!initialData.analyticsReport,
        adsenseReadinessReport: !!initialData.adsenseReadinessReport,
        prioritySupport: !!initialData.prioritySupport,
      });
      setJsonOptions(initialData.customOptions ? JSON.stringify(initialData.customOptions, null, 2) : "{}");
    } else if (open && mode === 'create') {
      setName(""); setPrice(""); setDescription(""); setPostsPerMonth(""); setPostsPerDay(""); setMaxWordCountPerPost(""); setMaxWebsites(""); setFeatures({ ...defaultFeatures }); setJsonOptions("{}");
    }
  }, [open, mode, initialData]);

  if (!open) return null;

  const handleFeatureChange = (key: FeatureKey) => {
    setFeatures(f => ({ ...f, [key]: !f[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    let parsedJson: Record<string, unknown> = {};
    try {
      parsedJson = jsonOptions ? JSON.parse(jsonOptions) : {};
    } catch {
      setError("Invalid JSON in custom options.");
      setLoading(false);
      return;
    }
    if (!name || !price) {
      setError("Name and price are required.");
      setLoading(false);
      return;
    }
    const body = {
      name,
      price,
      description,
      postsPerMonth,
      postsPerDay,
      maxWordCountPerPost,
      maxWebsites,
      ...features,
      customOptions: parsedJson,
    };
    try {
      const res = await fetch(
        mode === 'edit' && packageId ? `/api/admin/packages/${packageId}` : '/api/admin/packages',
        {
          method: mode === 'edit' ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save package');
      onCreated();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to save package');
      } else {
        setError('Failed to save package');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-package" style={{ maxWidth: 500, margin: "2em auto" }}>
      <h2 style={{ marginBottom: 16 }}>{mode === 'edit' ? 'Edit Package' : 'Create Package'}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Package Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter package name" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Price (INR)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Enter price" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter package description" style={{ width: "100%", padding: 8, marginTop: 4, minHeight: 60 }} />
        </div>
        <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Posts Per Month</label>
            <input type="number" value={postsPerMonth} onChange={e => setPostsPerMonth(e.target.value)} placeholder="e.g. 30" style={{ width: "100%", padding: 8, marginTop: 4 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Posts Per Day</label>
            <input type="number" value={postsPerDay} onChange={e => setPostsPerDay(e.target.value)} placeholder="e.g. 2" style={{ width: "100%", padding: 8, marginTop: 4 }} />
          </div>
        </div>
        <div style={{ marginBottom: 12, display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Max Word Count Per Post</label>
            <input type="number" value={maxWordCountPerPost} onChange={e => setMaxWordCountPerPost(e.target.value)} placeholder="e.g. 1200" style={{ width: "100%", padding: 8, marginTop: 4 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Max Websites</label>
            <input type="number" value={maxWebsites} onChange={e => setMaxWebsites(e.target.value)} placeholder="e.g. 1, 3, unlimited" style={{ width: "100%", padding: 8, marginTop: 4 }} />
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Features</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6 }}>
            {Object.keys(defaultFeatures).map((key) => (
              <label key={key} className="feature-checkbox" style={{ minWidth: 180, fontWeight: 400 }}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                <input type="checkbox" checked={features[key as FeatureKey]} onChange={() => handleFeatureChange(key as FeatureKey)} style={{ marginLeft: 7 }} />
              </label>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>Custom Options (JSON)</label>
          <textarea value={jsonOptions} onChange={e => setJsonOptions(e.target.value)} placeholder='e.g. { "extra": true }' style={{ width: "100%", padding: 8, marginTop: 4, minHeight: 50, fontFamily: 'monospace' }} />
        </div>
        <button type="submit" style={{ padding: "10px 24px", background: "#0070f3", color: "#fff", border: "none", borderRadius: 6, fontWeight: 500 }} disabled={loading}>
          {loading ? (mode === 'edit' ? 'Updating...' : 'Creating...') : (mode === 'edit' ? 'Update' : 'Create')}
        </button>
        {error && <div className="error" style={{ color: "#d32f2f", marginTop: 10 }}>{error}</div>}
      </form>
      <button onClick={onClose} style={{ marginTop: 18, background: '#eee', color: '#222', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
    </div>
  );
} 