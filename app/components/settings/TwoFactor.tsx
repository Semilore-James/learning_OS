"use client";

/* ============================================================================
   Two-factor auth (TOTP) enrolment, account phase only. Uses Supabase's built-in
   MFA: enroll -> show QR + secret -> challenge -> verify to activate. Once a
   verified factor exists, login (AuthScreen) asks for a code at aal1->aal2.
   ========================================================================== */
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Stage = "idle" | "pending" | "on";

export function TwoFactor() {
  const [supabase] = useState(() => createClient());
  const [stage, setStage] = useState<Stage>("idle");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      if (!alive) return;
      const verified = data?.totp?.find((f) => f.status === "verified");
      setStage(verified ? "on" : "idle");
      if (verified) setFactorId(verified.id);
    })();
    return () => {
      alive = false;
    };
  }, [supabase]);

  const run = async (fn: () => Promise<void>) => {
    setErr(null);
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const startEnrol = () =>
    run(async () => {
      // clear any half-finished factor so enroll doesn't collide
      const { data: existing } = await supabase.auth.mfa.listFactors();
      for (const f of existing?.totp ?? []) {
        if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setFactorId(data.id);
      setQr(data.totp.qr_code);
      setSecret(data.totp.secret);
      setCode("");
      setStage("pending");
    });

  const activate = () =>
    run(async () => {
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chErr) throw chErr;
      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: ch.id,
        code: code.trim(),
      });
      if (error) throw error;
      setQr("");
      setSecret("");
      setCode("");
      setStage("on");
    });

  const turnOff = () =>
    run(async () => {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      setFactorId("");
      setStage("idle");
    });

  return (
    <section className="flex flex-col gap-2 border-t border-border p-5">
      <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        Two-factor authentication
      </span>

      {stage === "on" ? (
        <>
          <span className="text-[11px] font-light text-brand-green">
            Two-factor is on. You&apos;ll enter a 6-digit code from your authenticator app
            each time you sign in.
          </span>
          {err && <p className="text-[11px] text-[#e5484d]">{err}</p>}
          <Button variant="outline" className="text-[#e5484d]" disabled={busy} onClick={turnOff}>
            Turn off two-factor
          </Button>
        </>
      ) : stage === "pending" ? (
        <>
          <span className="text-[11px] font-light text-muted-foreground">
            Scan this with Google Authenticator, 1Password, Authy, or similar. Then enter the
            6-digit code it shows to finish.
          </span>
          {qr && (
            // Supabase returns an SVG data URI for the QR
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt="Two-factor QR code"
              className="h-40 w-40 self-start rounded-[var(--radius-control)] bg-white p-2"
            />
          )}
          {secret && (
            <span className="break-all font-mono text-[10px] text-muted-foreground">
              Can&apos;t scan? Enter this key manually: {secret}
            </span>
          )}
          <div className="flex gap-2">
            <Input
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="text-center font-mono tracking-[0.3em]"
            />
            <Button disabled={busy || code.length !== 6} onClick={activate}>
              Verify
            </Button>
          </div>
          {err && <p className="text-[11px] text-[#e5484d]">{err}</p>}
          <button
            type="button"
            className="self-start text-[11px] text-muted-foreground hover:underline"
            onClick={() => setStage("idle")}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="text-[11px] font-light text-muted-foreground">
            Add a second step at sign-in using an authenticator app. Recommended if your
            account holds real progress you don&apos;t want to lose.
          </span>
          {err && <p className="text-[11px] text-[#e5484d]">{err}</p>}
          <Button variant="outline" disabled={busy} onClick={startEnrol}>
            Set up two-factor
          </Button>
        </>
      )}
    </section>
  );
}
