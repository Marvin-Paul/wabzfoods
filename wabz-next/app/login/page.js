"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff, Check } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* ── Friendly Supabase auth error messages ── */
  const friendlyAuthError = (msg) => {
    if (!msg) return "An unexpected error occurred. Please try again.";
    const lower = msg.toLowerCase();
    if (lower.includes("rate limit"))
      return "Too many attempts. Please wait a moment and try again.";
    if (lower.includes("email not confirmed"))
      return "Please verify your email address first. Check your inbox for the confirmation link.";
    if (lower.includes("invalid login credentials"))
      return "Invalid email or password. Please check your credentials and try again.";
    if (lower.includes("email rate limit"))
      return "Too many sign-in attempts. Please wait a moment and try again.";
    if (lower.includes("network error"))
      return "A network error occurred. Please check your internet connection and try again.";
    return msg;
  };

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("wabz_remember_email");
      if (savedEmail) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restore Remember Me after hydration
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // localStorage unavailable (Safari private browsing, embedded views) — skip Remember Me
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (rememberMe) {
        try {
          localStorage.setItem("wabz_remember_email", email);
        } catch {
          /* ignore */
        }
      } else {
        try {
          localStorage.removeItem("wabz_remember_email");
        } catch {
          /* ignore */
        }
      }
      router.push("/");
    } catch (err) {
      setError(friendlyAuthError(err.message || "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
  };

  return (
    <AuthLayout
      icon={LogIn}
      title="Welcome back"
      subtitle="Log in to your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-12 h-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <button
          type="button"
          role="checkbox"
          aria-checked={rememberMe}
          onClick={() => setRememberMe(!rememberMe)}
          className="flex items-center gap-2.5 w-auto group cursor-pointer text-left"
        >
          <span
            className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all duration-150 shrink-0 ${
              rememberMe
                ? "bg-primary border-primary text-primary-foreground"
                : "border-muted-foreground/40 group-hover:border-muted-foreground/70"
            }`}
          >
            {rememberMe && <Check size={12} strokeWidth={3} />}
          </span>
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors select-none">
            Remember me
          </span>
        </button>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Logging in...
            </>
          ) : (
            "Log in"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
