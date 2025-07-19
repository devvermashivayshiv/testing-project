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
    console.log('=== GOOGLE SIGN IN STARTED ===');
    console.log('Current URL:', window.location.href);
    console.log('Session status:', status);
    
    setIsLoading(true);
    setError("");
    
    try {
      console.log('Calling signIn with google...');
      const result = await signIn("google", { 
        callbackUrl: "/",
        redirect: false 
      });
      
      console.log('SignIn result:', result);
      console.log('Result error:', result?.error);
      console.log('Result ok:', result?.ok);
      console.log('Result url:', result?.url);
      
      if (result?.error) {
        console.error('ERROR: Login failed with error:', result.error);
        setError("Login failed. Please try again.");
        console.error("Login error:", result.error);
      } else if (result?.ok) {
        console.log('SUCCESS: Login successful, redirecting to:', result.url);
      } else {
        console.log('UNKNOWN: Login result:', result);
      }
    } catch (err) {
      console.error('EXCEPTION: Login error:', err);
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      console.log('=== GOOGLE SIGN IN COMPLETED ===');
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