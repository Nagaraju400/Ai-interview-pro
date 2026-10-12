"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin routes and during active interview sessions
  const isLiveInterviewSession = 
    pathname?.startsWith("/interview/") && 
    !pathname?.includes("/feedback") && 
    pathname !== "/interview/setup";

  if (pathname?.startsWith("/admin") || isLiveInterviewSession) {
    return null;
  }

  return (
    <footer className="bg-muted text-foreground border-t border-border">
      <div className="container mx-auto px-4 md:px-8 py-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4 group">
              <Image 
                src="/ai-interview-pro.png" 
                alt="Ai Interview Pro" 
                width={80} 
                height={80} 
                className="h-14 w-14 md:h-16 md:w-16 object-contain shrink-0 transition-transform group-hover:scale-105" 
              />
              <span className="font-extrabold text-xl tracking-tight text-foreground flex items-center">
                Ai Interview <span className="text-primary ml-1.5 font-black">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
              Empowering students and job seekers with AI-driven mock interviews, personalized feedback, and comprehensive analytics to land their dream roles. Built for the modern job market.
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </Link>
              <Link href="https://twitter.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="text-muted-foreground hover:text-foreground transition-all">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </Link>
              <Link href="mailto:contact@example.com" className="text-muted-foreground hover:text-foreground transition-all">
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Features</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground hover:underline underline-offset-4 transition-all">How it Works</Link></li>
              <li><Link href="/#pricing" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Documentation</Link></li>
              <li><Link href="/interview-tips" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Interview Tips</Link></li>
              <li><Link href="/resume-guide" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Resume Guide</Link></li>
              <li><Link href="/faq" className="hover:text-foreground hover:underline underline-offset-4 transition-all">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground hover:underline underline-offset-4 transition-all">About Us</Link></li>
              <li><Link href="/mission" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Our Mission</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Contact</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} Ai Interview Pro Inc. All rights reserved. Built for modern tech teams & candidates.
          </p>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground hover:underline underline-offset-4 transition-all">Privacy</Link>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-cookie-settings"))}
              className="hover:text-foreground hover:underline underline-offset-4 transition-all cursor-pointer"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
