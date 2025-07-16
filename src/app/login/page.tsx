"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../cssdesign/login.css";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const result = await signIn("google", { 
        callbackUrl: "/",
        redirect: false 
      });
      
      if (result?.error) {
        setError("Login failed. Please try again.");
        console.error("Login error:", result.error);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-container">
      <h1>Login</h1>
      <button
        onClick={handleGoogleSignIn}
        className="login-btn"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in with Google"}
      </button>
      {error && (
        <div style={{ 
          color: "#d32f2f", 
          marginTop: 16, 
          textAlign: "center",
          padding: "8px 16px",
          background: "#ffebee",
          borderRadius: 4
        }}>
          {error}
        </div>
      )}
    </main>
  );
} 