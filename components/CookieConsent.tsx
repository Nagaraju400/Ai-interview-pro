"use client";

import { useState, useEffect } from "react";
import { Cookie, ShieldCheck, Settings, Check, X, Lock, Sliders, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type CookiePreferences = {
  essential: boolean; // Always true
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  functional: true,
  analytics: true,
  marketing: false,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "categories">("overview");

  useEffect(() => {
    // Check if consent cookie exists
    const consent = getCookie("cookie_consent");
    if (!consent) {
      // Smooth delayed appearance on initial visit
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      } catch {
        // Fallback
      }
    }
  }, []);

  useEffect(() => {
    // Listen for custom event to trigger cookie settings modal from footer / privacy policy
    const handleOpenSettings = () => {
      setShowModal(true);
      setShowBanner(false);
    };
    window.addEventListener("open-cookie-settings", handleOpenSettings);
    return () => window.removeEventListener("open-cookie-settings", handleOpenSettings);
  }, []);

  const saveCookieConsent = (prefs: CookiePreferences) => {
    const expiresDays = 365;
    const date = new Date();
    date.setTime(date.getTime() + expiresDays * 24 * 60 * 60 * 1000);
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `cookie_consent=${encodeURIComponent(JSON.stringify(prefs))}${expires}; path=/; SameSite=Lax; Secure`;

    setPreferences(prefs);
    setShowBanner(false);
    setShowModal(false);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAcceptAll = () => {
    saveCookieConsent({ essential: true, functional: true, analytics: true, marketing: true });
  };

  const handleRejectOptional = () => {
    saveCookieConsent({ essential: true, functional: false, analytics: false, marketing: false });
  };

  const handleSaveCustom = () => {
    saveCookieConsent(preferences);
  };

  return (
    <>
      {/* Toast Notification when Preferences Saved */}
      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[9999] bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 font-medium text-xs md:text-sm"
          >
            <Check className="w-5 h-5 text-emerald-200" />
            <span>Standard cookie privacy preferences saved successfully.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Cookie Banner */}
      <AnimatePresence>
        {showBanner && !showModal && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-[9990] bg-card/95 backdrop-blur-2xl border border-border/80 text-card-foreground p-5 rounded-3xl shadow-2xl shadow-black/25"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl shrink-0 border border-primary/20">
                <Cookie className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    Standard Cookie Privacy Notice
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold">
                    GDPR / CCPA
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We use cookies and telemetry to secure user authentication, save your live AI interviewer voice preferences, and optimize question latency.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-border/80">
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 py-2 px-3 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition-all shadow-md text-center cursor-pointer"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={handleRejectOptional}
                className="py-2 px-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-semibold rounded-xl transition-all border border-border cursor-pointer"
              >
                Reject Optional
              </button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="p-2 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-xs font-medium rounded-xl transition-all border border-border cursor-pointer flex items-center gap-1"
                title="Customize Cookie Preferences"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard Preference Center Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="bg-card border border-border text-card-foreground rounded-3xl max-w-xl w-full p-6 shadow-2xl overflow-hidden relative space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground tracking-tight">Cookie Privacy Preference Center</h2>
                    <p className="text-xs text-muted-foreground">Standard compliance & preference control</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-2xl border border-border text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "overview"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Info className="w-3.5 h-3.5 text-primary" /> Privacy Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("categories")}
                  className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === "categories"
                      ? "bg-card text-foreground font-bold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-primary" /> Manage Categories
                </button>
              </div>

              {/* Content Body */}
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {activeTab === "overview" ? (
                  <div className="space-y-3 text-xs text-muted-foreground leading-relaxed pt-1">
                    <p>
                      When you visit our AI Interview Simulator Platform, we store and retrieve information on your browser, mostly in the form of cookies. This information is used to make the website work as you expect, maintain secure user authentication, and remember your active AI voice and editor configurations.
                    </p>
                    <div className="p-4 rounded-2xl bg-muted/40 border space-y-2">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-500" /> Standard Compliance Principles
                      </h4>
                      <ul className="space-y-1.5 list-disc pl-4 text-xs text-muted-foreground">
                        <li><strong>No Sensitive Personal Data Sold</strong>: We never sell candidate recordings or personal data.</li>
                        <li><strong>Essential Encryption</strong>: Auth tokens & session cookies are strictly protected with HTTP-only, SameSite, and TLS flags.</li>
                        <li><strong>Transparent Telemetry</strong>: Performance analytics are anonymized to optimize response latency.</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    {/* 1. Essential Cookies */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">Strictly Necessary / Essential</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            Always Active
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Required for secure authentication logins, Supabase database sessions, and CSRF protection. Cannot be disabled.
                        </p>
                      </div>
                      <div className="relative inline-flex items-center cursor-not-allowed opacity-80 shrink-0">
                        <input type="checkbox" checked disabled className="sr-only peer" />
                        <div className="w-9 h-5 bg-emerald-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </div>
                    </div>

                    {/* 2. Functional Cookies */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-foreground">Functional & User Preferences</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Persists your preferred AI interviewer voice pitch/rate, code editor syntax themes, microphone noise suppression, and active environment check confirmations.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={preferences.functional}
                          onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* 3. Analytics Cookies */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-foreground">Performance & Telemetry</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Measures AI model response speed, web vitals, and error telemetry to maintain instant question generation times.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* 4. Marketing & Personalization Cookies */}
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-foreground">Personalization & Targeted Loops</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Remembers your target companies (e.g. Google, Amazon) and job roles to suggest tailored interview practice tracks.
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Reject Optional
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-4 py-2 text-xs font-semibold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-all border border-border cursor-pointer"
                  >
                    Accept All
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    className="px-5 py-2 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper: read browser cookie safely
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}
