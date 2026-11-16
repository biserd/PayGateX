import { useLayoutEffect } from "react";
import { PublicHeader } from "@/components/public-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDown, ArrowRight, Braces, FlaskConical, ReceiptText, SlidersHorizontal } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";

const steps = [
  { title: "Connect your API", detail: "Enter an endpoint URL or import an OpenAPI operation. Choose which inputs to pass to your API." },
  { title: "Set your price", detail: "Choose what to charge per call and which wallet receives payments. Send a test request before you publish." },
  { title: "Share your link", detail: "Share your HTTP or MCP link with customers. See calls and payments in your Dashboard, where you can change the price or pause access." },
];

const exampleInput = { city: "Sofia", days: 2 };
const exampleRequests = [
  { transport: "HTTP", request: "POST /x402/tools/<tool-id>\nContent-Type: application/json\n\n" + JSON.stringify(exampleInput, null, 2) },
  { transport: "MCP", request: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "weather_forecast", arguments: exampleInput } }, null, 2) },
];

export default function Landing() {
  const { user } = useAuth();
  const connectHref = user ? "/dashboard" : "/auth";
  useSEO({
    title: "Charge per call for your API",
    description: "Connect the API you already run, set a price per call, and share a link with your customers. Track calls and payments in your Dashboard.",
    path: "/",
  });
  useLayoutEffect(() => {
    // Direct links can arrive before the SPA has rendered their target.
    const section = window.location.hash.slice(1);
    if (section === "how-it-works" || section === "for-buyers") {
      document.getElementById(section)?.scrollIntoView();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950 [font-family:Geist,system-ui,sans-serif] selection:bg-blue-200">
      <PublicHeader />
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-10 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-28">
          <div>
            <h1 className="max-w-[12ch] text-5xl font-semibold leading-[1.03] tracking-[-0.065em] sm:text-6xl xl:text-[76px]">Charge per call for the API you already run.</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600 sm:text-xl">Connect your API, set a price, and share a link with your customers. PayGate402 checks payment before sending each request to your API.</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <a href={connectHref} className="inline-flex items-center gap-2.5 rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800">
                {user ? "Open Dashboard" : "Connect your API"} <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#how-it-works" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700">See how it works <ArrowDown size={15} aria-hidden="true" /></a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-slate-600"><FlaskConical size={16} className="shrink-0 text-blue-700" aria-hidden="true" /> Payments currently use test USDC on Base Sepolia.</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0e1728] text-slate-100 shadow-xl shadow-slate-900/10">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-5 py-4 sm:px-7">
              <span className="flex items-center gap-2.5 text-sm font-medium"><Braces size={17} className="text-blue-300" aria-hidden="true" /> Example setup</span>
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
                  <p className="text-sm font-semibold">HTTP endpoint</p><p className="mt-1 text-sm text-slate-400">For apps and scripts</p>
                </div>
                <div className="min-w-0 rounded-lg border border-slate-700 bg-white/5 p-3.5">
                  <p className="text-sm font-semibold">MCP tool</p><p className="mt-1 text-sm text-slate-400">For AI agents</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="scroll-mt-24 border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-10 sm:py-20">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How it works</h2>
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
            <p className="mt-7 text-sm text-slate-600"><a href="/docs/seller/api" className="font-semibold text-blue-700 underline underline-offset-4">Automate setup</a> with an API key from your Dashboard.</p>
          </div>
        </section>
        <section id="for-buyers" aria-labelledby="payment-section-title" className="mx-auto grid max-w-7xl scroll-mt-24 items-start gap-8 px-5 py-14 sm:px-10 sm:py-20 md:grid-cols-2 lg:gap-14">
          <div>
            <h2 id="payment-section-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">How customers pay</h2>
            <p className="mt-4 max-w-lg leading-relaxed text-slate-600">Customers use your link to see the price and required inputs. An app, script, or AI agent with payment support can then pay in USDC for each call.</p>
            <p className="mt-6 flex max-w-lg gap-3 text-sm leading-relaxed text-slate-600">
              <ReceiptText size={18} className="mt-0.5 shrink-0 text-blue-700" aria-hidden="true" />
              If a call is interrupted, customers can use their purchase link to get the result and receipt without paying again.
            </p>
            <a href="/docs/seller/buyer-payments" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline underline-offset-4 hover:text-blue-900">
              Read the payment guide <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="payment-example-title">
            <h3 id="payment-example-title" className="text-lg font-semibold">Example request</h3>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <code className="rounded bg-slate-100 px-2 py-1 text-slate-900">weather_forecast</code>
              <strong className="font-semibold text-blue-800">0.02 USDC per call</strong>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Sample request for a weather API.</p>
            <Tabs defaultValue="HTTP" className="mt-4">
              <TabsList aria-label="Example request transport" className="bg-slate-100 text-slate-700">
                {exampleRequests.map(({ transport }) => <TabsTrigger key={transport} value={transport}>{transport}</TabsTrigger>)}
              </TabsList>
              {exampleRequests.map(({ transport, request }) => (
                <TabsContent key={transport} value={transport}>
                  <pre className="min-h-36 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-100 sm:text-sm" tabIndex={0}>
                    <code>{request}</code>
                  </pre>
                </TabsContent>
              ))}
            </Tabs>
          </article>
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
