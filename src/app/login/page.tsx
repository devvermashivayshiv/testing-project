"use client";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "../../cssdesign/login.css";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  return (
    <main className="login-container">
      <h1>Login</h1>
      <button
        onClick={() => signIn("google")}
        className="login-btn"
      >
        Sign in with Google
      </button>
    </main>
  );
} 