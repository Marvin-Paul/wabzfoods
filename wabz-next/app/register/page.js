"use client";

import React, { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, User, Mail, Lock, Loader2, Eye, EyeOff, ShieldCheck, ShieldAlert, ShieldMinus, ShieldX, Sparkles } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  /* ── Password strength calculator ── */
  const calcStrength = (pw) => {
    if (!pw) return { score: 0, level: "", color: "", width: "0%", icon: null };
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

  const strength = calcStrength(password);
  const StrengthIcon = strength.icon;

  /* ── Password generator ── */
  const generatePassword = () => {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const special = "!@#$%^&";
    const all = upper + lower + digits + special;
    let pw = "";
    // Ensure at least one of each type
    pw += upper[Math.floor(Math.random() * upper.length)];
    pw += lower[Math.floor(Math.random() * lower.length)];
    pw += digits[Math.floor(Math.random() * digits.length)];
    pw += special[Math.floor(Math.random() * special.length)];
    // Fill remaining to reach 16 chars
    for (let i = pw.length; i < 16; i++) {
      pw += all[Math.floor(Math.random() * all.length)];
    }
    // Shuffle
    return pw.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGenerate = () => {
    const pw = generatePassword();
    setPassword(pw);
    setConfirmPassword(pw);
    toast({ title: "Password generated", description: "A strong password has been created and filled in." });
  };

  /* ── Friendly Supabase auth error messages ── */
  const friendlyAuthError = (msg) => {
    if (!msg) return "An unexpected error occurred. Please try again.";
    const lower = msg.toLowerCase();
    if (lower.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
    if (lower.includes("email not confirmed")) return "Please verify your email address before signing in. Check your inbox for the confirmation link.";
    if (lower.includes("user already registered")) return "An account with this email already exists. Try logging in instead.";
    if (lower.includes("invalid login credentials")) return "Invalid email or password. Please check your credentials and try again.";
    if (lower.includes("password should be at least")) return "Password must be at least 6 characters long.";
    if (lower.includes("unable to validate email")) return "That email address appears to be invalid. Please check and try again.";
    if (lower.includes("email rate limit")) return "Too many sign-up attempts. Please wait a moment and try again.";
    if (lower.includes("invalid verification code")) return "The verification code you entered is incorrect. Please check and try again.";
    if (lower.includes("otp has expired")) return "The verification code has expired. Request a new one and try again.";
    if (lower.includes("network error")) return "A network error occurred. Please check your internet connection and try again.";
    if (lower.includes("email")) return msg; // Show raw email-related errors as-is
    return msg;
  };

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });
      if (signUpError) throw signUpError;

      // In local dev, skip OTP — auto-verify
      if (isLocal) {
        const { data: verifyData } = await supabase.auth.verifyOtp({
          email,
          token: "000000",
          type: "signup",
        });
        if (verifyData?.session?.access_token) {
          await supabase.auth.setSession({
            access_token: verifyData.session.access_token,
            refresh_token: verifyData.session.refresh_token,
          });
        }
        window.location.href = "/";
      } else {
        setShowOtp(true);
      }
    } catch (err) {
      setError(friendlyAuthError(err.message || "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup",
      });
      if (verifyError) throw verifyError;
      if (verifyData?.session?.access_token) {
        await supabase.auth.setSession({
          access_token: verifyData.session.access_token,
          refresh_token: verifyData.session.refresh_token,
        });
      }
      window.location.href = "/";
    } catch (err) {
      setError(friendlyAuthError(err.message || "Invalid verification code"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await supabase.auth.resend({ type: "signup", email });
      toast({
        title: "Code sent",
        description: "Check your email for the new code.",
      });
    } catch (err) {
      setError(friendlyAuthError(err.message || "Failed to resend code"));
    }
  };

  const handleGoogle = () => {
    supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin + "/" } });
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn&apos;t receive the code?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      icon={UserPlus}
      title="Create your account"
      subtitle="Sign up to get started"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Log in
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
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {password && (
            <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2 mb-1.5">
                {/* Bar */}
                <div className="flex-1 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-400 ease-out ${strength.color}`}
                    style={{ width: strength.width }}
                  />
                </div>
                {/* Label + icon */}
                {StrengthIcon && (
                  <span className={`flex items-center gap-1 text-[11px] font-medium ${strength.textColor}`}>
                    <StrengthIcon size={12} />
                    {strength.level}
                  </span>
                )}
              </div>
              {/* Requirements checklist */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-stone-400">
                <span className={password.length >= 6 ? "text-emerald-500" : ""}>
                  {password.length >= 6 ? "✓" : "•"} 6+ characters
                </span>
                <span className={/[a-z]/.test(password) && /[A-Z]/.test(password) ? "text-emerald-500" : ""}>
                  {/[a-z]/.test(password) && /[A-Z]/.test(password) ? "✓" : "•"} Upper & lower
                </span>
                <span className={/\d/.test(password) ? "text-emerald-500" : ""}>
                  {/\d/.test(password) ? "✓" : "•"} Number
                </span>
                <span className={/[^a-zA-Z0-9]/.test(password) ? "text-emerald-500" : ""}>
                  {/[^a-zA-Z0-9]/.test(password) ? "✓" : "•"} Special char
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
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
