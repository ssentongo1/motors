"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/admin/dashboard");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", paddingTop: "60px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ 
          width: "60px", 
          height: "60px", 
          margin: "0 auto 16px auto",
          background: "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#000" }}>M</span>
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "8px" }}>Admin Login</h1>
        <p style={{ color: "#888888", fontSize: "13px" }}>Enter your credentials to access the dashboard</p>
      </div>

      {error && (
        <div style={{ background: "rgba(255,59,48,0.1)", border: "1px solid #ff3b30", color: "#ff3b30", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "#111111",
            border: "1px solid #222222",
            borderRadius: "12px",
            color: "#ffffff",
            fontSize: "14px",
            marginBottom: "16px",
            outline: "none"
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = "#ffd700"}
          onBlur={(e) => e.currentTarget.style.borderColor = "#222222"}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "14px 16px",
            background: "#111111",
            border: "1px solid #222222",
            borderRadius: "12px",
            color: "#ffffff",
            fontSize: "14px",
            marginBottom: "24px",
            outline: "none"
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = "#ffd700"}
          onBlur={(e) => e.currentTarget.style.borderColor = "#222222"}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            background: loading ? "#666666" : "#ffd700",
            border: "none",
            borderRadius: "12px",
            color: "#000000",
            fontSize: "14px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}