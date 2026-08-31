"use client";

/* ============================================================================
   Auth screen (Userflow Flows 1-3). Login / sign up / 6-digit OTP / forgot
   password, plus "Continue as guest". Full-screen, over the wallpaper, matches
   the mockup's neobrutalist card.

   Sign-up sends a numeric code (Supabase confirmation email template set to
   {{ .Token }} rather than {{ .ConfirmationURL }} — see supabase/README.md).
   Code length is the "Email OTP Length" project setting (6-10); the input
   accepts up to 10. When "Confirm email" is off, signUp returns a live
   session and the code step is skipped.
   ========================================================================== */
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/lib/session/SessionProvider";
import { Wallpaper } from "@/components/wallpaper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type View = "login" | "signup" | "otp" | "forgot" | "mfa";

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  reveal,
  onToggleReveal,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  reveal: boolean;
  onToggleReveal: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="relative">
        <Input
          type={reveal ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          className="pr-10"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onToggleReveal}
          tabIndex={-1}
          aria-label={reveal ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 z-10 grid w-9 place-items-center text-muted-foreground transition-colors hover:text-primary"
        >
          {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

export function AuthScreen() {
  const { continueAsGuest, onSignedUp, configured } = useSession();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState("");
  const [mfaChallengeId, setMfaChallengeId] = useState("");
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
      // if the account has 2FA, ask for a code before SessionProvider proceeds
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2") {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totp = factors?.totp?.[0];
        if (totp) {
          const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
          if (chErr) throw chErr;
          setMfaFactorId(totp.id);
          setMfaChallengeId(ch.id);
          setCode("");
          setView("mfa");
          setNotice("Enter the 6-digit code from your authenticator app.");
        }
      }
      // otherwise the session change is picked up by SessionProvider
    });

  const verifyMfa = () =>
    run(async () => {
      if (!supabase) throw new Error("Accounts are not configured yet.");
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code: code.trim(),
      });
      if (error) throw error;
      // now at aal2 — SessionProvider proceeds
    });

  const signup = () =>
    run(async () => {
      if (!supabase) throw new Error("Accounts are not configured yet.");
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (password !== confirm) throw new Error("Passwords do not match.");
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // when email confirmation is disabled, signUp returns a live session and
      // there is no code to enter — go straight in
      if (data.session) {
        await onSignedUp();
        return;
      }
      setView("otp");
      setNotice(`Enter the code sent to ${email}.`);
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
          {view !== "otp" && view !== "mfa" && (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Email</span>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
          )}

          {(view === "login" || view === "signup") && (
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete={view === "login" ? "current-password" : "new-password"}
              reveal={showPw}
              onToggleReveal={() => setShowPw((s) => !s)}
            />
          )}

          {view === "signup" && (
            <PasswordField
              label="Confirm password"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
              reveal={showPw}
              onToggleReveal={() => setShowPw((s) => !s)}
            />
          )}

          {(view === "otp" || view === "mfa") && (
            <label className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {view === "mfa" ? "6-digit code" : "Verification code"}
              </span>
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                // MFA (TOTP) is always 6; the email OTP length is a Supabase
                // setting (6-10), so don't hard-cap it below what they receive
                maxLength={view === "mfa" ? 6 : 10}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="text-center font-mono text-lg tracking-[0.3em]"
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
            onClick={
              view === "login"
                ? login
                : view === "signup"
                  ? signup
                  : view === "otp"
                    ? verify
                    : view === "mfa"
                      ? verifyMfa
                      : forgot
            }
          >
            {busy
              ? "…"
              : view === "login"
                ? "Sign in"
                : view === "signup"
                  ? "Create account"
                  : view === "otp"
                    ? "Verify"
                    : view === "mfa"
                      ? "Verify code"
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
          {(view === "signup" || view === "forgot" || view === "otp" || view === "mfa") && (
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
