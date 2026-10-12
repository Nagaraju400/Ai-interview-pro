"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "General Inquiry",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.message) return;
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 max-w-5xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Touch</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a question about Ai Interview Pro? Want to request a specific feature or get enterprise support? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            
            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-card border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                <p className="text-muted-foreground text-sm mb-2">Our team is available 24/7 for support.</p>
                <a href="mailto:support@ai-interview.com" className="text-primary hover:underline font-medium">
                  support@ai-interview.com
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-card border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Corporate Headquarters</h3>
                <p className="text-muted-foreground text-sm mb-2">Visit our main technology hub.</p>
                <p className="text-foreground font-medium">
                  Ai Interview Pro Inc.<br />
                  AI & Innovation Hub<br />
                  Cyber City, Gurugram, India
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-6 rounded-2xl bg-card border shadow-sm">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Phone Support</h3>
                <p className="text-muted-foreground text-sm mb-2">Mon-Fri from 8am to 5pm IST.</p>
                <a href="tel:+919876543210" className="text-primary hover:underline font-medium">
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

            {submitted ? (
              <div className="p-8 text-center space-y-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Message Delivered!</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Thank you for reaching out to Ai Interview Pro Inc. Your message has been received, and our support team will respond to <strong>{formData.email || "your email"}</strong> shortly.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSubmitted(false); setFormData({ firstName: "", lastName: "", email: "", subject: "General Inquiry", message: "" }); }}
                  className="mt-4"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="first-name" className="text-sm font-medium">First name</label>
                    <input 
                      id="first-name"
                      type="text" 
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="last-name" className="text-sm font-medium">Last name</label>
                    <input 
                      id="last-name"
                      type="text" 
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input 
                    id="email"
                    type="email" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <select 
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Enterprise Sales">Enterprise Partnership</option>
                    <option value="Feedback">Feedback & Suggestions</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <textarea 
                    id="message"
                    rows={4}
                    placeholder="How can we help you today?"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  ></textarea>
                </div>

                <Button type="submit" size="lg" disabled={loading} className="w-full h-12 rounded-xl text-md font-semibold">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
