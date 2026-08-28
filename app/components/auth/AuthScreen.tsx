"use client";

/* ============================================================================
   Auth screen (Userflow Flows 1-3). Login / sign up / 6-digit OTP / forgot
   password, plus "Continue as guest". Full-screen, over the wallpaper, matches
   the mockup's neobrutalist card.

   Sign-up sends a 6-digit code (Supabase must have its confirmation email
   template set to use {{ .Token }} rather than {{ .ConfirmationURL }} — see
   supabase/README.md). Without custom SMTP, the built-in sender throttles at a
   few emails per hour.
   ========================================================================== */
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/session/SessionProvider";
import { Wallpaper } from "@/components/wallpaper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type View = "login" | "signup" | "otp" | "forgot";

export function AuthScreen() {
  const { continueAsGuest, onSignedUp, configured } = useSession();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const supabase = configured ? createClient() : null;

  const run = async (fn: () => Promise<void>) => {
    setErr(null);
    setNotice(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const login = () =>
    run(async () => {
      if (!supabase) throw new Error("Accounts are not configured yet.");
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // session change is picked up by SessionProvider
    });

  const signup = () =>
    run(async () => {
      if (!supabase) throw new Error("Accounts are not configured yet.");
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (password !== confirm) throw new Error("Passwords do not match.");
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setView("otp");
      setNotice(`Enter the 6-digit code sent to ${email}.`);
    });

  const verify = () =>
    run(async () => {
      if (!supabase) throw new Error("Accounts are not configured yet.");
      const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: "signup" });
      if (error) throw error;
      await onSignedUp();
    });

  const forgot = () =>
    run(async () => {
      if (!supabase) throw new Error("Accounts are not configured yet.");
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      setNotice("If that email has an account, a reset link is on its way.");
    });

  return (
    <div className="fixed inset-0 z-[500] grid place-items-center overflow-hidden bg-background">
      <Wallpaper id="starfield" theme="dark" />
      <div
        className="relative z-10 w-[380px] max-w-[90vw] bg-surface p-10"
        style={{ border: "var(--bd)", borderRadius: "var(--radius)", boxShadow: "var(--shadow)" }}
      >
        <div className="font-mono text-2xl font-bold tracking-tight text-primary">DA // LEARNING OS</div>
        <div className="mt-1 text-[13px] font-light text-muted-foreground">Data Analyst Operating System</div>

        <div className="mt-8 flex flex-col gap-3">
          {view !== "otp" && (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
          )}

          {(view === "login" || view === "signup") && (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={view === "login" ? "current-password" : "new-password"}
              />
            </label>
          )}

          {view === "signup" && (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Confirm password</span>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </label>
          )}

          {view === "otp" && (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">6-digit code</span>
              <Input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center font-mono text-lg tracking-[0.4em]"
              />
            </label>
          )}

          {view === "login" && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me for 30 days
            </label>
          )}

          {err && <p className="text-xs text-[#e5484d]">{err}</p>}
          {notice && <p className="text-xs text-brand-green">{notice}</p>}

          <Button
            className="mt-1 w-full uppercase tracking-wide"
            disabled={busy}
            onClick={view === "login" ? login : view === "signup" ? signup : view === "otp" ? verify : forgot}
          >
            {busy
              ? "…"
              : view === "login"
                ? "Sign in"
                : view === "signup"
                  ? "Create account"
                  : view === "otp"
                    ? "Verify"
                    : "Send reset link"}
          </Button>
        </div>

        <div className="mt-5 flex flex-col items-center gap-2 text-xs">
          {view === "login" && (
            <>
              <button type="button" className="text-primary hover:underline" onClick={() => setView("signup")}>
                Create account
              </button>
              <button type="button" className="text-muted-foreground hover:underline" onClick={() => setView("forgot")}>
                Forgot password?
              </button>
            </>
          )}
          {(view === "signup" || view === "forgot" || view === "otp") && (
            <button type="button" className="text-muted-foreground hover:underline" onClick={() => setView("login")}>
              Back to sign in
            </button>
          )}
          <button type="button" className="mt-2 text-muted-foreground hover:text-foreground hover:underline" onClick={continueAsGuest}>
            Continue as guest
          </button>
        </div>

        {!configured && (
          <p className="mt-4 text-[10px] text-brand-amber">
            Accounts need the Supabase env vars set on this deploy. Guest mode works now; progress saves to this browser.
          </p>
        )}
      </div>
    </div>
  );
}
