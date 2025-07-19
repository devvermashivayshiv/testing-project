"use client";
import React, { useState } from "react";
import Image from "next/image";

const slides = [
  {
    title: "Welcome to AutoEarn!",
    image: "/public/globe.svg",
    description: "AutoEarn helps you automate your blogging journey and earn online, even if you have no technical skills!"
  },
  {
    title: "How It Works",
    image: "/public/window.svg",
    description: "Connect your website, choose a plan, and let our automation engine handle content creation, SEO, and publishing."
  },
  {
    title: "Track Your Progress",
    image: "/public/file.svg",
    description: "Use your dashboard to monitor automation, view analytics, and manage your account."
  },
  {
    title: "Need Help?",
    image: "/public/vercel.svg",
    description: "This page will always have the latest guides, FAQs, and support for your journey."
  }
];

export default function TutorialPage() {
  const [step, setStep] = useState(0);

  const handleNext = () => setStep((s) => Math.min(s + 1, slides.length - 1));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 0));
  const handleFinish = () => {
    // In future: mark tutorial as seen, redirect, etc.
    window.history.back(); // Go back to previous page
  };

  const slide = slides[step];

  return (
    <main style={{ maxWidth: 420, margin: "3rem auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 16px rgba(0,0,0,0.07)", padding: "2.5rem 2rem", textAlign: "center" }}>
      <h1 style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 16 }}>{slide.title}</h1>
      <Image src={slide.image} alt={slide.title} width={120} height={120} style={{ margin: "0 auto 1.5rem auto" }} />
      <p style={{ color: "#555", fontSize: 17, marginBottom: 32 }}>{slide.description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={handlePrev} disabled={step === 0} style={{ opacity: step === 0 ? 0.5 : 1, background: "#eee", border: "none", borderRadius: 6, padding: "8px 18px", fontWeight: 500, fontSize: 16 }}>Previous</button>
        {step < slides.length - 1 ? (
          <button onClick={handleNext} style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, fontSize: 16 }}>Next</button>
        ) : (
          <button onClick={handleFinish} style={{ background: "#1976d2", color: "#fff", border: "none", borderRadius: 6, padding: "8px 24px", fontWeight: 600, fontSize: 16 }}>Finish</button>
        )}
      </div>
      <div style={{ marginTop: 24, fontSize: 14, color: "#888" }}>
        Step {step + 1} of {slides.length}
      </div>
    </main>
  );
} 