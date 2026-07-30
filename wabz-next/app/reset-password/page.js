"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, AlertTriangle, Eye, EyeOff, ShieldCheck, ShieldAlert, ShieldMinus, ShieldX, Sparkles } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ResetPassword() {
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  /* ── Password strength calculator ── */
  const calcStrength = (pw) => {
    if (!pw) return { score: 0, level: "", color: "", textColor: "", width: "0%", icon: null };
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (pw.length >= 10) score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
    if (/\d/.test(pw)) score += 1;
    if (/[^a-zA-Z0-9]/.test(pw)) score += 1;
    if (pw.length >= 14) score += 1;
    const levels = [
      { min: 5, level: "Strong", color: "bg-emerald-500", textColor: "text-emerald-500", width: "100%", icon: ShieldCheck },
      { min: 4, level: "Good", color: "bg-emerald-400", textColor: "text-emerald-400", width: "80%", icon: ShieldCheck },
      { min: 3, level: "Fair", color: "bg-amber-400", textColor: "text-amber-500", width: "60%", icon: ShieldAlert },
      { min: 2, level: "Weak", color: "bg-orange-400", textColor: "text-orange-500", width: "40%", icon: ShieldMinus },
      { min: 1, level: "Weak", color: "bg-red-500", textColor: "text-red-500", width: "20%", icon: ShieldX },
      { min: 0, level: "", color: "", textColor: "", width: "0%", icon: null },
    ];
    return levels.find((l) => score >= l.min) || levels[levels.length - 1];
  };

  const strength = calcStrength(newPassword);
  const StrengthIcon = strength.icon;
  /* ── Password generator ── */
  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "!@#$%^&";
    const all = upper + lower + digits + special;
    let pw = "";
    pw += upper[Math.floor(Math.random() * upper.length)];
    pw += lower[Math.floor(Math.random() * lower.length)];
    pw += digits[Math.floor(Math.random() * digits.length)];
    pw += special[Math.floor(Math.random() * special.length)];
    for (let i = pw.length; i < 16; i++) {
      pw += all[Math.floor(Math.random() * all.length)];
    }
    return pw.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGenerate = () => {
    const pw = generatePassword();
    setNewPassword(pw);
    setConfirmPassword(pw);
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setResetToken(urlParams.get("token"));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await supabase.auth.updateUser({ password: newPassword });
      window.location.href = "/login";
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthLayout
        icon={AlertTriangle}
        title="Invalid reset link"
        subtitle="This password reset link is missing or invalid"
        footer={
          <Link href="/forgot-password" className="text-primary font-medium hover:underline">
            Request a new link
          </Link>
        }
      >
        <p className="text-sm text-foreground text-center">
          The link you used appears to be incomplete. Please request a new password reset email.
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={Lock}
      title="New password"
      subtitle="Enter your new password below"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              autoFocus
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-10 pr-12 h-12"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={handleGenerate}
                className="text-muted-foreground hover:text-emerald-500 transition-colors"
                aria-label="Generate strong password"
                tabIndex={-1}
                title="Generate strong password"
              >
                <Sparkles size={16} />
              </button>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password strength indicator */}
          {newPassword && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-400 ease-out ${strength.color}`}
                    style={{ width: strength.width }}
                  />
                </div>
                {StrengthIcon && (
                  <span className={`flex items-center gap-1 text-[11px] font-medium ${strength.textColor}`}>
                    <StrengthIcon size={12} />
                    {strength.level}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-stone-400">
                <span className={newPassword.length >= 6 ? "text-emerald-500" : ""}>
                  {newPassword.length >= 6 ? "✓" : "•"} 6+ characters
                </span>
                <span className={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? "text-emerald-500" : ""}>
                  {/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword) ? "✓" : "•"} Upper & lower
                </span>
                <span className={/\d/.test(newPassword) ? "text-emerald-500" : ""}>
                  {/\d/.test(newPassword) ? "✓" : "•"} Number
                </span>
                <span className={/[^a-zA-Z0-9]/.test(newPassword) ? "text-emerald-500" : ""}>
                  {/[^a-zA-Z0-9]/.test(newPassword) ? "✓" : "•"} Special char
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 pr-12 h-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirm ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Resetting...
            </>
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
