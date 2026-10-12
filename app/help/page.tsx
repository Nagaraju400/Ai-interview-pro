import Link from "next/link";
import { Search, Book, CreditCard, User, MessageCircle, FileText, ChevronRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HelpCenterPage() {
  const categories = [
    {
      title: "Getting Started",
      description: "Learn the basics of Ai Interview Pro and set up your first mock interview.",
      icon: <Book className="w-6 h-6 text-primary" />,
      href: "/help/getting-started"
    },
    {
      title: "Billing & Subscriptions",
      description: "Manage your subscription, payments, and understand our pricing tiers.",
      icon: <CreditCard className="w-6 h-6 text-primary" />,
      href: "/help/billing"
    },
    {
      title: "Account Management",
      description: "Update your profile, change your password, and manage your data.",
      icon: <User className="w-6 h-6 text-primary" />,
      href: "/help/account"
    },
    {
      title: "Interview Tips",
      description: "Best practices and advice for acing your technical and behavioral interviews.",
      icon: <MessageCircle className="w-6 h-6 text-primary" />,
      href: "/interview-tips"
    },
  ];

  const popularArticles = [
    "How to upload and parse your resume?",
    "What is the difference between HR and Technical interviews?",
    "How does the AI grading system work?",
    "Can I cancel my subscription at any time?",
    "How do I review past interview feedback?"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary/5 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              How can we help you today?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Search our knowledge base or browse categories below to find the answers you need.
            </p>
          </div>
          
          <div className="relative max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <Input 
              type="text" 
              placeholder="Search for articles, guides, or questions..." 
              className="pl-12 pr-4 py-6 text-lg rounded-full shadow-sm border-primary/20 focus-visible:ring-primary/30"
            />
            <div className="absolute inset-y-2 right-2">
              <Button className="rounded-full px-6">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold mb-8 text-foreground">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category, idx) => (
              <Link 
                key={idx} 
                href={category.href}
                className="group flex gap-4 p-6 rounded-2xl border bg-card hover:shadow-md transition-all duration-300 hover:border-primary/40"
              >
                <div className="p-3 rounded-xl bg-primary/10 shrink-0 h-fit">
                  {category.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles & FAQ */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Popular Articles */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Popular Articles</h2>
            </div>
            <ul className="space-y-3">
              {popularArticles.map((article, idx) => (
                <li key={idx}>
                  <Link href="/faq" className="group flex items-center justify-between p-4 rounded-lg bg-card border hover:border-primary/40 hover:shadow-sm transition-all">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{article}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Support */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 mb-6">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Still need help?</h2>
            </div>
            <div className="p-8 rounded-2xl bg-primary text-primary-foreground text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-8 -mt-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-tr-full -ml-8 -mb-8" />
              
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-semibold">Contact our Support Team</h3>
                <p className="text-primary-foreground/80 text-sm">
                  We usually respond within 24 hours. Our team is here to help you succeed in your interview journey.
                </p>
                <Link href="/contact" className="inline-block mt-2">
                  <Button variant="secondary" className="w-full sm:w-auto font-semibold">
                    Submit a Request
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
