import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { useSEO } from "@/hooks/use-seo";

export default function About() {
  const { user } = useAuth();
  useSEO({
    title: "About PayGate402",
    description: "PayGate402 lets developers and teams charge per call for an API they already run.",
    path: "/about",
  });

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <PublicHeader />
      <main className="mx-auto max-w-4xl space-y-8 px-6 py-12">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">About PayGate402</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-700">
            PayGate402 lets developers and teams charge per call for an API they already run.
            You keep running your API. PayGate402 checks payment and forwards the requests.
          </p>
        </div>
        <section>
          <h2 className="text-2xl font-semibold">How customers use your API</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-slate-700">
            Share an HTTP link for apps and scripts, or an MCP link for AI agents.
            Customers can see the price before making a call and retrieve their result and receipt after payment.
            Payments currently use test USDC on Base Sepolia.
          </p>
        </section>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-blue-700 hover:bg-blue-800" data-testid="button-get-started">
            <a href={user ? "/dashboard" : "/auth"}>{user ? "Open Dashboard" : "Connect your API"}</a>
          </Button>
          <Button asChild variant="outline"><a href="/docs">Read the docs</a></Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
