"use client";
import React, { useEffect, useState } from "react";
import "../../../cssdesign/dashboard.css";
import { useRouter } from "next/navigation";

function safeValue(val: unknown): string | number {
  if (typeof val === 'string' || typeof val === 'number') return val;
  return '';
}

const ONBOARDING_FIELDS = [
  { name: "blogNiche", label: "Blog Niche/Category", required: true },
  { name: "experience", label: "Blogging Experience", required: true },
  { name: "contentGoals", label: "Content Goals", required: true },
  { name: "blogUrl", label: "WordPress Blog URL", required: true },
  { name: "languages", label: "Languages (optional)", required: false },
  { name: "postingFreq", label: "Posting Frequency (optional)", required: false },
  { name: "targetAudience", label: "Target Audience (optional)", required: false },
  { name: "socialHandles", label: "Social Media Handles (optional)", required: false },
];

type OnboardingType = {
  blogNiche: string;
  experience: string;
  contentGoals: string;
  blogUrl: string;
  languages?: string;
  targetAudience?: string;
  socialHandles?: string;
  websiteCreationDate?: string;
  websitePurpose?: string;
  hasWebsite?: string;
  numBlogs?: number;
  monthlyReach?: number;
  editLocked?: boolean;
  [key: string]: string | number | boolean | undefined;
};

function OverviewTab({ onboarding }: { onboarding: OnboardingType | null }) {
  if (!onboarding) {
    return (
      <div>
        <h2>Overview</h2>
        <p>Welcome to your dashboard. Use the Onboarding tab to set up your blogging automation profile.</p>
        <div className="dashboard-onboarding">
          <i>No onboarding data found.</i>
        </div>
      </div>
    );
  }
  return (
    <div>
      <h2>Overview</h2>
      <p>Welcome to your dashboard. Here is your onboarding summary:</p>
      <div className="dashboard-onboarding">
        <h3 style={{ marginBottom: 10 }}>Website Information</h3>
        <ul style={{ marginBottom: 18 }}>
          <li><b>Do you already have a website?</b> {onboarding.hasWebsite || <i>Not provided</i>}</li>
          {onboarding.hasWebsite === "Yes" && <>
            <li><b>Website URL:</b> {onboarding.blogUrl || <i>Not provided</i>}</li>
            <li><b>Website Creation Date:</b> {onboarding.websiteCreationDate || <i>Not provided</i>}</li>
            <li><b>Number of Blogs/Articles:</b> {typeof onboarding.numBlogs === 'number' ? onboarding.numBlogs : <i>Not provided</i>}</li>
            <li><b>Monthly Reach/Traffic:</b> {typeof onboarding.monthlyReach === 'number' ? onboarding.monthlyReach : <i>Not provided</i>}</li>
            <li><b>Purpose of Website:</b> {onboarding.websitePurpose || <i>Not provided</i>}</li>
          </>}
        </ul>
        <h3 style={{ marginBottom: 10 }}>Blogging & Automation Preferences</h3>
        <ul>
          <li><b>Blog Niche/Category:</b> {onboarding.blogNiche || <i>Not provided</i>}</li>
          <li><b>Blogging Experience:</b> {onboarding.experience || <i>Not provided</i>}</li>
          <li><b>Content Goals:</b> {onboarding.contentGoals || <i>Not provided</i>}</li>
          <li><b>Languages:</b> {onboarding.languages || <i>Not provided</i>}</li>
          <li><b>Target Audience:</b> {onboarding.targetAudience || <i>Not provided</i>}</li>
          <li><b>Social Media Handles:</b> {onboarding.socialHandles || <i>Not provided</i>}</li>
        </ul>
      </div>
    </div>
  );
}

const CATEGORY_OPTIONS = [
  "Technology", "Finance", "Travel", "Health", "Education", "Food", "Fashion", "Lifestyle", "Business", "Personal Development", "Other"
];
const EXPERIENCE_OPTIONS = [
  "Beginner", "Intermediate", "Expert", "Other"
];

const ONBOARDING_STEPS = [
  {
    name: "hasWebsite",
    label: "Do you already have a website?",
    required: true,
    type: "radio",
    options: ["Yes", "No"],
    help: "If you don't have a website, we can help you build one!",
  },
  {
    name: "blogUrl",
    label: "Website URL (WordPress only)",
    required: true,
    type: "text",
    help: "We connect to your blog for direct publishing and analytics.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "websiteCreationDate",
    label: "Website Creation Date (estimate allowed)",
    required: true,
    type: "date",
    help: "Knowing your website's age helps us understand its authority. You can pick a date or type an estimate.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "numBlogs",
    label: "Number of Blogs/Articles",
    required: true,
    type: "number",
    help: "We'll use this to analyze your existing content.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "monthlyReach",
    label: "Monthly Reach/Traffic",
    required: true,
    type: "number",
    help: "This helps us tailor automation to your audience size.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "websitePurpose",
    label: "Purpose of the Website",
    required: true,
    type: "textarea",
    help: "Tell us why you created your website. We'll use this to align automation with your goals.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "blogNiche",
    label: "Blog Niche/Category",
    required: true,
    type: "select",
    options: CATEGORY_OPTIONS,
    help: "We use your niche to find the best topics and trends for your blog.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "experience",
    label: "Blogging Experience",
    required: true,
    type: "select",
    options: EXPERIENCE_OPTIONS,
    help: "Experience level helps us tailor content and automation complexity for you.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "contentGoals",
    label: "Content Goals",
    required: true,
    type: "textarea",
    help: "Your goals guide our automation to focus on traffic, monetization, or branding.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "languages",
    label: "Languages (optional)",
    required: false,
    type: "text",
    help: "We generate content in your preferred languages.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "targetAudience",
    label: "Target Audience (optional)",
    required: false,
    type: "text",
    help: "We optimize topics and style for your audience.",
    dependsOn: { hasWebsite: "Yes" },
  },
  {
    name: "socialHandles",
    label: "Social Media Handles (optional)",
    required: false,
    type: "text",
    help: "(Optional) For future social automation and cross-promotion.",
    dependsOn: { hasWebsite: "Yes" },
  },
];

function OnboardingTab({ onboarding, editable, refresh }: { onboarding: OnboardingType | null, editable: boolean, refresh: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState(() => ({ ...onboarding }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(0);
  const [showCustom, setShowCustom] = useState<{ [key: string]: boolean }>({});
  const [showNoWebsiteModal, setShowNoWebsiteModal] = useState(false);

  useEffect(() => {
    setForm({ ...onboarding });
    setStep(0);
    setShowCustom({
      blogNiche: !!(onboarding?.blogNiche && !CATEGORY_OPTIONS.includes(onboarding.blogNiche)),
      experience: !!(onboarding?.experience && !EXPERIENCE_OPTIONS.includes(onboarding.experience)),
    });
  }, [onboarding]);

  // Filter steps based on dependsOn
  const filteredSteps = ONBOARDING_STEPS.filter(s => {
    if (!s.dependsOn) return true;
    return Object.entries(s.dependsOn).every(([k, v]) => form[k] === v);
  });
  const current = filteredSteps[step];
  const totalSteps = filteredSteps.length;
  const percent = Math.round(((step + 1) / totalSteps) * 100);

  // In handleChange, show modal if user selects No for hasWebsite
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm(f => {
      if (type === "number") {
        return { ...f, [name]: value === "" ? undefined : Number(value) };
      }
      return { ...f, [name]: value };
    });
    if (name === "hasWebsite" && value === "No") {
      setShowNoWebsiteModal(true);
    }
    if (current.type === "select" && value === "Other") {
      setShowCustom(sc => ({ ...sc, [name]: true }));
    } else if (current.type === "select") {
      setShowCustom(sc => ({ ...sc, [name]: false }));
    }
  };

  const handleCustomInput = (name: string, value: string) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleNext = () => {
    setError("");
    if (current.required && !form[current.name]) {
      setError("This field is required.");
      return;
    }
    // If website step and answer is No, redirect
    if (current.name === "hasWebsite" && form.hasWebsite === "No") {
      router.push("/website-builder");
      return;
    }
    setStep(s => s + 1);
  };
  const handleBack = () => {
    setError("");
    setStep(s => s - 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const method = onboarding ? "PUT" : "POST";
      const res = await fetch("/api/user/onboarding", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSuccess("Onboarding saved successfully.");
      refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Move NoWebsiteModal here so it has access to setShowNoWebsiteModal and router
  const NoWebsiteModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 380, width: '90vw', padding: '2rem 1.5rem', boxShadow: '0 4px 32px rgba(0,0,0,0.18)', textAlign: 'center', position: 'relative' }}>
        <button onClick={() => setShowNoWebsiteModal(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
        <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 12 }}>Why Blogging Automation?</h2>
        <ul style={{ textAlign: 'left', margin: '0 0 1.2em 0', padding: 0, listStyle: 'disc inside', color: '#333', fontSize: 15 }}>
          <li>Save hours every week with automated content publishing</li>
          <li>Grow your audience and traffic with consistent posting</li>
          <li>Unlock passive income opportunities</li>
          <li>Focus on strategy, not manual work</li>
        </ul>
        <div style={{ color: '#1976d2', fontWeight: 500, marginBottom: 18 }}>To use automation, a WordPress website is required.</div>
        <button
          onClick={() => router.push('/website-builder')}
          style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '0.9em 2em', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer', marginBottom: 8 }}
        >
          Get your website under 10 minutes
        </button>
      </div>
    </div>
  );

  if (!editable && onboarding) {
    return (
      <div className="dashboard-onboarding">
        <h2>Onboarding Summary</h2>
        <ul>
          {ONBOARDING_FIELDS.map(f => (
            <li key={f.name}><b>{f.label}:</b> {onboarding[f.name] || <i>Not provided</i>}</li>
          ))}
        </ul>
        <div className="success">Onboarding is locked after plan purchase.</div>
      </div>
    );
  }

  // Multi-step wizard UI
  return (
    <>
      {showNoWebsiteModal && <NoWebsiteModal />}
      <div className="dashboard-onboarding" style={{ maxWidth: 480, margin: "2rem auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", padding: "2rem 1.5rem 1.5rem 1.5rem" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Onboarding Progress</div>
          <div style={{ background: "#f2f2f2", borderRadius: 8, height: 10, width: "100%", overflow: "hidden" }}>
            <div style={{ width: `${percent}%`, background: "#1976d2", height: 10, borderRadius: 8, transition: "width 0.3s" }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "#1976d2", fontWeight: 500 }}>{`Step ${step + 1} of ${totalSteps}`}</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Step field */}
          <label style={{ fontWeight: 500, marginBottom: 4 }}>{current.label}{current.required && " *"}</label>
          {current.type === "select" ? (
            <>
              <select
                name={current.name}
                value={showCustom[current.name] ? 'Other' : safeValue(form[current.name])}
                onChange={handleChange}
                required={current.required}
                disabled={loading}
                style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", marginBottom: showCustom[current.name] ? 8 : 18 }}
              >
                <option value="" disabled>Select {current.label.toLowerCase()}</option>
                {(current.options || []).map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              {showCustom[current.name] && (
                <input
                  type="text"
                  name={current.name}
                  placeholder={`Enter your ${current.label.toLowerCase()}`}
                  value={safeValue(form[current.name])}
                  onChange={e => handleCustomInput(current.name, e.target.value)}
                  required={current.required}
                  disabled={loading}
                  style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", marginBottom: 18 }}
                />
              )}
            </>
          ) : current.type === "radio" ? (
            <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
              {(current.options || []).map((opt: string) => (
                <label key={opt} style={{ fontWeight: 400, fontSize: 15 }}>
                  <input
                    type="radio"
                    name={current.name}
                    value={opt}
                    checked={form[current.name] === opt}
                    onChange={handleChange}
                    required={current.required}
                    disabled={loading}
                    style={{ marginRight: 6 }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          ) : current.type === "textarea" ? (
            <textarea
              name={current.name}
              value={safeValue(form[current.name])}
              onChange={handleChange}
              required={current.required}
              disabled={loading}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", minHeight: 60, marginBottom: 18 }}
            />
          ) : current.type === "number" ? (
            <input
              type="number"
              name={current.name}
              value={safeValue(form[current.name])}
              onChange={handleChange}
              required={current.required}
              disabled={loading}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", marginBottom: 18 }}
            />
          ) : current.type === "date" ? (
            <input
              type="date"
              name={current.name}
              value={safeValue(form[current.name])}
              onChange={handleChange}
              required={current.required}
              disabled={loading}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", marginBottom: 18 }}
              pattern="\\d{4}-\\d{2}-\\d{2}"
              placeholder="YYYY-MM-DD or estimate"
            />
          ) : (
            <input
              type="text"
              name={current.name}
              value={safeValue(form[current.name])}
              onChange={handleChange}
              required={current.required}
              disabled={loading}
              style={{ padding: 8, borderRadius: 6, border: "1px solid #ccc", marginBottom: 18 }}
            />
          )}
          {/* Help text */}
          <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{current.help}</div>
          {error && <div className="dashboard-error">{error}</div>}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <button type="button" className="dashboard-btn" onClick={handleBack} disabled={loading || step === 0} style={{ opacity: step === 0 ? 0.5 : 1 }}>Back</button>
            {step < totalSteps - 1 ? (
              <button type="button" className="dashboard-btn" onClick={handleNext} disabled={loading}>Next</button>
            ) : (
              <button className="dashboard-btn" type="submit" disabled={loading} style={{ fontWeight: 600, fontSize: "1.1rem", padding: "0.9em 2.5em" }}>{onboarding ? "Update" : "Submit"}</button>
            )}
          </div>
          {success && <div className="success">{success}</div>}
        </form>
      </div>
    </>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [onboarding, setOnboarding] = useState<OnboardingType | null>(null);
  const [editable, setEditable] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchOnboarding = async () => {
    setLoading(true);
    const res = await fetch("/api/user/onboarding");
    const data = await res.json();
    setOnboarding(data.onboarding);
    setEditable(!data.onboarding?.editLocked);
    setLoading(false);
  };

  useEffect(() => { fetchOnboarding(); }, []);

  return (
    <main className="dashboard-main">
      <div className="dashboard-tabs">
        <button className={`dashboard-tab${tab === "overview" ? " active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
        <button className={`dashboard-tab${tab === "onboarding" ? " active" : ""}`} onClick={() => setTab("onboarding")}>Onboarding</button>
      </div>
      <div className="dashboard-tab-content">
        {loading ? <div>Loading...</div> : (
          tab === "overview"
            ? <OverviewTab onboarding={onboarding} />
            : <OnboardingTab onboarding={onboarding} editable={editable} refresh={fetchOnboarding} />
        )}
      </div>
    </main>
  );
} 