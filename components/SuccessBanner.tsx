"use client";

import { useEffect, useState } from "react";
import { PartyPopper, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function SuccessBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setIsVisible(true);
      // Clean up the URL without triggering a full reload
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("success");
      const newUrl = `${pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
      window.history.replaceState({}, "", newUrl);
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => setIsVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 shadow-xl shadow-green-500/20"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <PartyPopper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Upgrade Successful!</h2>
              <p className="text-white/90">
                You now have full access to Grad Pro. Your account has been upgraded with unlimited interviews and premium features. Let's get practicing!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
