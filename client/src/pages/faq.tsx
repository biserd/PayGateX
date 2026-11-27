import { PublicHeader } from "@/components/public-header";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { useSEO } from "@/hooks/use-seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const questions = [
  {
    question: "Who is PayGate402 for?",
    answer: "PayGate402 is for developers and teams who run an API and want to charge for each call. You share a link with customers, and PayGate402 checks payment before forwarding each request.",
  },
  {
    question: "How do I charge for my API?",
    answer: "Sign in with your email, enter your API URL or import an OpenAPI operation, and choose a price and a wallet to receive payments. Send a test request, then publish and share the links from your Dashboard.",
    link: { href: "/docs/seller/api", label: "Read the setup guide" },
  },
  {
    question: "How do my customers pay?",
    answer: "Customers use your link to see the price and required inputs. Their app or script uses an x402 payment client, or their AI agent uses an MCP client that supports payments. They pay in USDC each time they call the API.",
    link: { href: "/docs/seller/buyer-payments", label: "Read the payment guide" },
  },
  {
    question: "Which payments can I test?",
    answer: "Payments currently use test USDC on Base Sepolia. You can also test that your API responds correctly before you publish, without making a payment.",
  },
  {
    question: "What if a paid call is interrupted?",
    answer: "Customers can use their private purchase link to check the status and retrieve the result and receipt without paying again.",
  },
  {
    question: "Do customers see my API credentials?",
    answer: "PayGate402 encrypts your API credentials and uses them when it sends requests to your API. Customers only need the link you share and their own payment client.",
  },
  {
    question: "Where can I get help?",
    answer: "The docs cover setup, API requests, payments, and receipts. You can also send us a question through the contact page.",
    link: { href: "/docs", label: "Open the docs" },
  },
];

export default function FAQ() {
  useSEO({
    title: "PayGate402 FAQ",
    description: "Learn how to connect your API, set a price, and share a link that customers can use to pay per call.",
    path: "/faq",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: questions.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  });

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <PublicHeader />
      <main className="bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-4xl px-6 py-12">
          <h1 className="mb-6 text-4xl font-bold sm:text-5xl">Frequently asked questions</h1>
          <Accordion type="single" collapsible className="space-y-4">
            {questions.map(({ question, answer, link }) => (
              <AccordionItem key={question} value={question} className="rounded-lg border border-gray-200 bg-white px-6 shadow-sm">
                <AccordionTrigger className="text-left text-gray-900 hover:text-blue-600">{question}</AccordionTrigger>
                <AccordionContent forceMount className="text-gray-600 data-[state=closed]:hidden">
                  <p>{answer}</p>
                  {link && <a className="mt-3 inline-block font-medium text-blue-700 underline underline-offset-4" href={link.href}>{link.label}</a>}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-12 rounded-lg border border-blue-200 bg-blue-50 p-8 text-center">
            <p className="mb-4 text-lg font-medium">Still have questions?</p>
            <Button asChild className="bg-blue-700 hover:bg-blue-800" data-testid="button-contact">
              <a href="/contact">Contact support</a>
            </Button>
          </div>
        </div>
      </main>
      <Footer showAbout />
    </div>
  );
}
