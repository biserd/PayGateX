import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Mail, Send, Menu, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
    <div className="min-h-screen relative overflow-x-hidden bg-slate-950 text-white">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-blue-950/10 to-cyan-950/20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), 
                           radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.2) 0%, transparent 50%), 
                           radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.15) 0%, transparent 50%)`
        }} />
      </div>
      
      {/* Header */}
      <header className="relative border-b border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl blur opacity-50 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">PayGate x402</h1>
              <p className="text-xs text-gray-400 font-medium hidden sm:block">Contact Us</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/"}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="nav-home"
            >
              Home
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/directory"}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="nav-directory"
            >
              🌐 Directory
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/docs"}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="nav-docs"
            >
              Documentation
            </Button>
            <Button
              variant="ghost"
              onClick={() => window.location.href = "/contact"}
              className="text-gray-300 hover:text-white hover:bg-white/10"
              data-testid="nav-contact"
            >
              Contact
            </Button>
            <Button 
              onClick={() => window.location.href = "/auth"}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-0 px-6 py-2.5 font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/25"
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <Button
              onClick={() => window.location.href = "/auth"}
              className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 px-3 py-2 text-sm"
              data-testid="mobile-button-login-top"
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white hover:bg-white/10 p-2"
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
            <div className="container mx-auto px-4 py-4 space-y-2">
              <button
                onClick={() => { window.location.href = "/"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                data-testid="mobile-nav-home"
              >
                Home
              </button>
              <button
                onClick={() => { window.location.href = "/directory"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                data-testid="mobile-nav-directory"
              >
                🌐 Directory
              </button>
              <button
                onClick={() => { window.location.href = "/docs"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                data-testid="mobile-nav-docs"
              >
                Documentation
              </button>
              <button
                onClick={() => { window.location.href = "/contact"; setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-md"
                data-testid="mobile-nav-contact"
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/25">
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-2xl blur opacity-50 animate-pulse" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-3 sm:mb-4">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 px-4 sm:px-0">
              Have questions about PayGate x402? We'd love to hear from you.
            </p>
          </div>

          {/* Contact Form Card */}
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm mx-2 sm:mx-0">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-white text-xl sm:text-2xl">Send us a message</CardTitle>
              <CardDescription className="text-gray-400 text-sm sm:text-base">
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="name" className="text-white mb-2 block text-sm font-medium">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="bg-slate-800/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 text-white placeholder-gray-400 h-12 text-base"
                      data-testid="input-name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white mb-2 block text-sm font-medium">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="bg-slate-800/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 text-white placeholder-gray-400 h-12 text-base"
                      data-testid="input-email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-white mb-2 block text-sm font-medium">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                    className="bg-slate-800/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 text-white placeholder-gray-400 h-12 text-base"
                    data-testid="input-subject"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="message" className="text-white mb-2 block text-sm font-medium">
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your question or how we can help..."
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={5}
                    className="bg-slate-800/50 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 text-white placeholder-gray-400 resize-none text-base min-h-[120px]"
                    data-testid="input-message"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-0 px-6 py-4 sm:py-3 font-semibold transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/25 text-base h-12 sm:h-auto"
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
          <div className="mt-8 sm:mt-12 text-center px-4 sm:px-0">
            <p className="text-gray-400 text-sm sm:text-base">
              You can also reach us directly at{" "}
              <a href="mailto:hello@bigappledigital.nyc" className="text-violet-400 hover:text-cyan-400 transition-colors underline decoration-violet-400/50 hover:decoration-cyan-400/50 break-all">
                hello@bigappledigital.nyc
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                PayGate x402
              </span>
            </div>
            <div className="text-center md:text-right space-y-2">
              <div className="flex flex-wrap justify-center md:justify-end gap-4 text-sm">
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors" data-testid="link-privacy">
                  Privacy Policy
                </a>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors" data-testid="link-about">
                  About
                </a>
                <a href="/faq" className="text-gray-400 hover:text-white transition-colors" data-testid="link-faq">
                  FAQ
                </a>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors" data-testid="link-terms">
                  Terms of Service
                </a>
              </div>
              <p className="text-gray-400">
                © 2025 PayGate x402. Built with HTTP 402 protocol.
              </p>
              <p className="text-sm text-gray-500">
                Version 1.3.0
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}