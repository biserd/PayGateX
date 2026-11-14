import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Coins, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [token, setToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token"));
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    document.title = "Sign in | PayGate402";
    if (token) window.history.replaceState(window.history.state, "", window.location.pathname);
  }, [token]);
  useEffect(() => {
    if (user && !token) navigate("/dashboard", { replace: true });
  }, [user, token, navigate]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/email/" + (token ? "redeem" : "request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token } : { email }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Sign-in is temporarily unavailable. Try again shortly.");
      if (token) {
        await queryClient.cancelQueries({ queryKey: ["/api/user"] });
        queryClient.removeQueries({ predicate: query => query.queryKey[0] !== "/api/user" });
        queryClient.setQueryData(["/api/user"], result);
        navigate("/dashboard", { replace: true });
      } else {
        setSentTo(email.trim());
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not complete sign-in. Try again.");
    } finally {
      setPending(false);
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
          <h1 className="text-3xl font-semibold tracking-tight">{token ? "Confirm your sign-in" : sentTo ? "Check your email" : "Sign in to PayGate402"}</h1>
          {sentTo ? (
            <div className="mt-3 space-y-5" role="status">
              <p className="leading-relaxed text-slate-600">We sent a one-time link to <strong className="break-all text-slate-900">{sentTo}</strong>. It expires in 15 minutes.</p>
              <Button variant="outline" onClick={() => setSentTo("")}>Use a different email or resend</Button>
            </div>
          ) : (
            <form className="mt-3 space-y-5" onSubmit={submit}>
              <p className="leading-relaxed text-slate-600">{token
                ? "Continue to open your seller workspace."
                : "Enter your email and we’ll send you a one-time sign-in link. Your first sign-in creates a seller workspace."}</p>
              {!token && <div className="space-y-2">
                <Label htmlFor="sign-in-email">Email address</Label>
                <Input id="sign-in-email" type="email" name="email" autoComplete="email" value={email}
                  onChange={event => setEmail(event.target.value)} maxLength={254} required placeholder="you@example.com" />
              </div>}
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <Button type="submit" disabled={pending || (isLoading && !!token)} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                {token ? <ArrowRight size={17} aria-hidden="true" /> : <Mail size={17} aria-hidden="true" />}
                {token ? pending ? "Signing in…" : "Continue to seller console" : pending ? "Sending…" : "Send sign-in link"}
              </Button>
              {token && <Button type="button" variant="link" className="px-0" disabled={pending} onClick={() => { setToken(null); setError(""); }}>Request a new link</Button>}
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
