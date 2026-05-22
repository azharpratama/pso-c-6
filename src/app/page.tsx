"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  ShieldIcon,
  UserIcon,
} from "@/components/icons";

export default function Home() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = identifier.trim().length > 0 && password.trim().length > 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loading) {
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result?.error ?? "Login gagal. Coba lagi.");
        return;
      }

      localStorage.setItem(
        "adminSession",
        JSON.stringify({
          id: result.admin.id,
          username: result.admin.username,
          email: result.admin.email,
          loginAt: Date.now(),
        })
      );

      router.push("/dashboard");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <header className="login-header">
        <h1 className="login-title">Mitra Magang ITS</h1>
        <p className="login-subtitle">Administrative Access Portal</p>
      </header>

      <main className="login-card">
        <div className="login-icon">
          <ShieldIcon className="icon-lg" aria-hidden="true" />
        </div>
        <h2 className="login-card-title">Admin Login</h2>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="form-label" htmlFor="identifier">
            Username or Email
          </label>
          <div className="input-field">
            <UserIcon className="icon-sm" aria-hidden="true" />
            <input
              id="identifier"
              type="text"
              placeholder="Enter your credentials"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
              suppressHydrationWarning
            />
          </div>

          <div className="form-row">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <button type="button" className="link-button">
              Forgot password?
            </button>
          </div>
          <div className="input-field">
            <LockIcon className="icon-sm" aria-hidden="true" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              suppressHydrationWarning
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOffIcon className="icon-sm" aria-hidden="true" />
              ) : (
                <EyeIcon className="icon-sm" aria-hidden="true" />
              )}
            </button>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <button
            type="submit"
            className="primary-btn full-width"
            disabled={!canSubmit || loading}
          >
            <span>{loading ? "Signing in..." : "Login to Dashboard"}</span>
            <ArrowRightIcon className="icon-sm" aria-hidden="true" />
          </button>
        </form>
      </main>

      <footer className="login-footer">
        Secure access for authorized ITS personnel only.
      </footer>
    </div>
  );
}
