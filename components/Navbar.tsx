"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { useRouter, usePathname } from "next/navigation";

import { HelpCircle } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setIsLoading(false);
    };
    
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto max-w-[1400px]">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-3 group">
            <Image 
              src="/ai-interview-pro.png" 
              alt="Ai Interview Pro" 
              width={80} 
              height={80} 
              priority
              className="h-14 w-14 md:h-16 md:w-16 object-contain shrink-0 transition-transform group-hover:scale-105" 
            />
            <span className="font-extrabold text-lg md:text-xl tracking-tight text-foreground flex items-center">
              Ai Interview <span className="text-primary ml-1.5 font-black">Pro</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Home
            </Link>
            <Link href="/#features" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Features
            </Link>
            <Link href="/#how-it-works" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Process
            </Link>
            <Link href="/#pricing" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Pricing
            </Link>
            <Link href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1.5 font-semibold text-primary">
              <HelpCircle className="w-4 h-4 text-primary" /> Help
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {!isLoading && session ? (
            <>
              <span className="hidden md:inline-block text-sm font-medium text-muted-foreground mr-2">
                Hi, {session.user?.user_metadata?.full_name?.split(' ')[0] || 'User'}
              </span>
              <Button 
                variant="ghost" 
                className="text-sm px-4 hidden sm:flex font-medium text-foreground/60 hover:text-foreground/80"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
              <Link href="/dashboard">
                <Button variant="default" className="text-sm px-6 font-semibold">
                  Dashboard
                </Button>
              </Link>
            </>
          ) : !isLoading && !session ? (
            <>
              <Link href="/login" className="hidden sm:block text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60 mr-2">
                Log in
              </Link>
              <Link href="/register">
                <Button className="text-sm px-6 bg-foreground hover:bg-foreground/90 text-background font-semibold">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <div className="w-24 h-9 animate-pulse bg-muted rounded-md" />
          )}
        </div>
      </div>
    </nav>
  );
}
