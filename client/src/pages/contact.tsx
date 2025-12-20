import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Coins, Mail, Send, Menu, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSEO } from "@/hooks/use-seo";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  useSEO({
    title: 'Contact PayGate x402 - Get API Monetization Support',
    description: 'Contact the PayGate x402 team for API monetization questions, x402 protocol integration, enterprise support, partnerships, and technical guidance. We respond to all inquiries within 24 hours.',
    path: '/contact',
    keywords: 'PayGate support, API monetization help, x402 integration, enterprise support, technical support, payment integration'
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      setFormData({ name: "", email: "", subject: "", message: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(formData);
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">PayGate x402</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-home">
              Home
            </a>
            <a href="/directory" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-directory">
              Directory
            </a>
            <a href="/docs" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-docs">
              Docs
            </a>
            <a href="/release-notes" className="text-gray-600 hover:text-blue-600 font-medium transition-colors" data-testid="nav-release-notes">
              Release Notes
            </a>
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-600"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              <a href="/" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-home">Home</a>
              <a href="/directory" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-directory">Directory</a>
              <a href="/docs" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-docs">Docs</a>
              <a href="/release-notes" className="block py-2 text-gray-600 hover:text-blue-600 font-medium" data-testid="mobile-nav-release-notes">Release Notes</a>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-gray-600">
              Have questions about PayGate x402? We'd love to hear from you.
            </p>
          </div>

          {/* Contact Form Card */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="p-6">
              <CardTitle className="text-gray-900 text-2xl">Send us a message</CardTitle>
              <CardDescription className="text-gray-600">
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-gray-900 mb-2 block text-sm font-medium">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 text-gray-900 h-12"
                      data-testid="input-name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-900 mb-2 block text-sm font-medium">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 text-gray-900 h-12"
                      data-testid="input-email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-900 mb-2 block text-sm font-medium">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 text-gray-900 h-12"
                    data-testid="input-subject"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-900 mb-2 block text-sm font-medium">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={5}
                    className="bg-gray-50 border-gray-200 focus:border-blue-600 focus:ring-blue-600/20 text-gray-900 resize-none min-h-[120px]"
                    data-testid="input-message"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12"
                  data-testid="button-send-message"
                >
                  {contactMutation.isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="mt-12 text-center">
            <p className="text-gray-600">
              You can also reach us directly at{" "}
              <a href="mailto:hello@paygate402.com" className="text-blue-600 hover:text-blue-700 transition-colors underline">
                hello@paygate402.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PayGate x402</span>
            </div>
            <div className="text-center md:text-right space-y-2">
              <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
                <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="link-privacy">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors" data-testid="link-terms">
                  Terms of Service
                </a>
              </div>
              <p className="text-gray-500">
                © 2025 PayGate x402. API monetization made simple.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
