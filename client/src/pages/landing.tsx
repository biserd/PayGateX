import { PublicHeader } from "@/components/public-header";
import { ArrowDown, ArrowRight, Braces, FlaskConical, LockKeyhole, ReceiptText, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";

const steps = [
  { title: "Connect your API", detail: "Import an OpenAPI operation or enter a URL manually. Map incoming fields to your API and store upstream credentials server-side." },
  { title: "Set a price and test", detail: "Choose your per-call price and payout wallet. Run a sandbox call to check the response before you publish." },
  { title: "Publish and track usage", detail: "Copy the HTTP endpoint and MCP connection details. Track calls, settled payments, and failures. Change the price or pause at any time." },
];

export default function Landing() {
  const { user } = useAuth();
  const sellerHref = user ? "/dashboard" : "/auth";
  useSEO({
    title: "Charge per API call with x402",
    description: "Turn an API you already run into a paid HTTP endpoint and a typed MCP tool. Set a per-call price, test the integration, and track payments.",
    path: "/",
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950 [font-family:Geist,system-ui,sans-serif] selection:bg-blue-200">
      <PublicHeader />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-10 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-28">
          <div>
            <h1 className="max-w-[12ch] text-5xl font-semibold leading-[1.03] tracking-[-0.065em] sm:text-6xl xl:text-[76px]">Charge per call for the API you already run.</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600 sm:text-xl">Publish one operation as a paid HTTP endpoint and a typed MCP tool. Set your own price and let PayGate402 verify payments before forwarding calls.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a href={sellerHref} className="inline-flex items-center gap-2.5 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
                {user ? "Open Dashboard" : "Get started"} <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700">See how it works <ArrowDown size={15} aria-hidden="true" /></a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-slate-600"><FlaskConical size={16} className="text-blue-700" aria-hidden="true" /> Try the sandbox with simulated USDC.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1728] text-slate-100 shadow-xl shadow-slate-900/10">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-5 py-4 sm:px-7">
              <span className="flex items-center gap-2.5 text-sm font-medium"><Braces size={17} className="text-blue-300" aria-hidden="true" /> Example operation</span>
              <span className="text-sm text-blue-200">0.02 USDC per call</span>
            </div>
            <div className="space-y-5 px-5 py-6 sm:px-7 sm:py-8">
              <div>
                <p className="text-sm font-medium text-slate-400">Your API</p>
                <p className="mt-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 font-mono text-sm text-slate-100"><span className="text-blue-300">GET</span> /forecast/{'{city}'}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400"><ArrowDown size={16} className="text-blue-300" aria-hidden="true" /> PayGate402 verifies payment</div>
              <div className="grid gap-3 min-[440px]:grid-cols-2">
                <div className="min-w-0 rounded-lg border border-slate-700 bg-white/5 p-3.5">
                  <p className="text-sm font-semibold">x402 HTTP endpoint</p><p className="mt-1 text-sm text-slate-400">For apps and scripts</p>
                </div>
                <div className="min-w-0 rounded-lg border border-slate-700 bg-white/5 p-3.5">
                  <p className="text-sm font-semibold">MCP tool</p><p className="mt-1 break-words font-mono text-xs text-slate-400">weather_forecast</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="scroll-mt-24 border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-10 sm:py-20">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">From existing API to paid tool</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {steps.map(({ title, detail }, index) => {
                const Icon = [Braces, SlidersHorizontal, ReceiptText][index];
                return <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                  <Icon size={22} className="text-blue-700" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{detail}</p>
                </article>;
              })}
            </div>
            <p className="mt-7 text-sm text-slate-600">Automating setup? Use the <a href="https://github.com/biserd/PayGateX/blob/paygate402/cloudflare-staging/docs/PAYGATE402.md#seller-api" className="font-semibold text-blue-700 underline underline-offset-4">seller API</a> with an API key from your dashboard.</p>
          </div>
        </section>
        <section id="for-buyers" className="mx-auto grid max-w-7xl scroll-mt-24 gap-8 px-5 py-14 sm:px-10 sm:py-20 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">See what you’ll pay before you call.</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-slate-600">Inspect the price and input schema, then call the endpoint with an x402 client or use a payment-aware MCP client.</p>
          </div>
          <div className="space-y-5">
            <div className="flex gap-3"><ReceiptText size={20} className="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" /><p className="leading-relaxed text-slate-600">Use your purchase link to recover the result and receipt after a disconnect without paying again.</p></div>
            <div className="flex gap-3"><LockKeyhole size={20} className="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" /><p className="leading-relaxed text-slate-600">Both interfaces use the same price, payment verification, and receipt process.</p></div>
          </div>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-5 py-8 text-sm sm:px-10">
          <a href="/" className="font-semibold">PayGate402</a>
          <nav aria-label="Footer" className="flex flex-wrap gap-5 text-slate-600">
            <a href="/faq" className="hover:text-blue-700">FAQ</a>
            <a href="/contact" className="hover:text-blue-700">Contact</a>
            <a href="/privacy" className="hover:text-blue-700">Privacy</a>
            <a href="/terms" className="hover:text-blue-700">Terms</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
