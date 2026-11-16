import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, Coins, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

const linkToken = () => new URLSearchParams(window.location.hash.slice(1)).get("token");

async function postEmail(path: "request" | "redeem", body: { email: string } | { token: string }) {
  const response = await fetch("/api/auth/email/" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || "Sign-in is temporarily unavailable. Try again shortly.");
  return result;
}

export default function AuthPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [token, setToken] = useState(linkToken);
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const redemption = useRef<{ token: string; request: ReturnType<typeof postEmail> } | null>(null);

  useEffect(() => {
    document.title = "Sign in | PayGate402";
    const acceptLink = () => {
      const nextToken = linkToken();
      if (!nextToken) return;
      setSentTo("");
      setError("");
      setToken(nextToken);
    };
    window.addEventListener("hashchange", acceptLink);
    return () => window.removeEventListener("hashchange", acceptLink);
  }, []);
  useEffect(() => {
    if (!token) return;
    if (linkToken() === token) {
      const { pathname, search } = window.location;
      window.history.replaceState(window.history.state, "", pathname + search);
    }

    // Reuse the POST when effects rerun. If another link opens, redeem it after the first
    // request finishes so the browser keeps the newest session cookie.
    if (redemption.current?.token !== token) {
      const redeem = () => postEmail("redeem", { token });
      const previous = redemption.current?.request;
      redemption.current = { token, request: previous ? previous.then(redeem, redeem) : redeem() };
    }
    let active = true;
    void redemption.current.request.then(async result => {
      if (!active) return;
      await queryClient.cancelQueries({ queryKey: ["/api/user"] });
      if (!active) return;
      queryClient.removeQueries({ predicate: query => query.queryKey[0] !== "/api/user" });
      queryClient.setQueryData(["/api/user"], result);
      navigate("/dashboard", { replace: true });
    }).catch(cause => {
      if (!active) return;
      redemption.current = null;
      setError(cause instanceof Error ? cause.message : "Could not complete sign-in. Request a new link.");
      setToken(null);
    });
    return () => { active = false; };
  }, [token, navigate]);
  useEffect(() => {
    if (user && !token && !error) navigate("/dashboard", { replace: true });
  }, [user, token, error, navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      await postEmail("request", { email });
      setSentTo(email.trim());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not complete sign-in. Try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 py-12 text-slate-950">
      <div className="w-full max-w-md">
        <a href="/" className="mb-7 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700">
          <ArrowLeft size={16} aria-hidden="true" /> PayGate402 home
        </a>
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="mb-6 grid size-11 place-items-center rounded-xl bg-blue-600 text-white"><Coins size={22} aria-hidden="true" /></div>
          <h1 className="text-3xl font-semibold tracking-tight" role={token ? "status" : undefined}>
            {token ? "Signing you in…" : sentTo && !error ? "Check your email" : "Sign in to PayGate402"}
          </h1>
          {token ? null : sentTo && !error ? (
            <div className="mt-3 space-y-5" role="status">
              <p className="leading-relaxed text-slate-600">We sent a one-time link to <strong className="break-all text-slate-900">{sentTo}</strong>. It expires in 15 minutes.</p>
              <Button variant="outline" onClick={() => setSentTo("")}>Use a different email or resend</Button>
            </div>
          ) : (
            <form className="mt-3 space-y-5" onSubmit={submit}>
              <p className="leading-relaxed text-slate-600">Enter your email and we’ll send you a one-time sign-in link. Your first sign-in creates a seller workspace.</p>
              <div className="space-y-2">
                <Label htmlFor="sign-in-email">Email address</Label>
                <Input id="sign-in-email" type="email" name="email" autoComplete="email" value={email}
                  onChange={event => setEmail(event.target.value)} maxLength={254} required placeholder="you@example.com" />
              </div>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <Button type="submit" disabled={sending} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                <Mail size={17} aria-hidden="true" />
                {sending ? "Sending…" : "Send sign-in link"}
              </Button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
