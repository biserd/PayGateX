import { PublicHeader } from "@/components/public-header";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Footer } from "@/components/Footer";
import { Mail, Send } from "lucide-react";
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
      <PublicHeader />

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

      <Footer />
    </div>
  );
}
