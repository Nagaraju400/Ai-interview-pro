"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, KeyRound, ShieldCheck, Mail, Sparkles } from "lucide-react";
import { 
  requestDynamicPasskey, 
  verifyDynamicPasskey, 
  sendAdminOtp, 
  verifyAdminOtp 
} from "./actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"passkey" | "otp">("passkey");
  const [step, setStep] = useState<"credentials" | "passkey_input" | "otp_input">("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passkeyInput, setPasskeyInput] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Generate alphanumeric CAPTCHA on mount
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    drawCaptcha(code);
  };

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    ctx.font = "bold 24px monospace";
    ctx.textBaseline = "middle";
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      const x = 20 + i * 20;
      const y = canvas.height / 2;
      ctx.translate(x, y);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillStyle = "#1e3a5f";
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (captchaAnswer.toLowerCase() !== captchaCode.toLowerCase()) {
      setError("Incorrect CAPTCHA answer. Please try again.");
      generateCaptcha();
      setCaptchaAnswer("");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      if (authMethod === "passkey") {
        const result = await requestDynamicPasskey(formData);
        if (result.error) {
          setError(result.error);
          generateCaptcha();
          setCaptchaAnswer("");
        } else if (result.requirePasskeyInput) {
          setStep("passkey_input");
        }
      } else {
        const result = await sendAdminOtp(formData);
        if (result.error) {
          setError(result.error);
          generateCaptcha();
          setCaptchaAnswer("");
        } else if (result.requireOtp) {
          setStep("otp_input");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred during admin authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("passkey", passkeyInput);

      const result = await verifyDynamicPasskey(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred while verifying dynamic passkey.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("code", otpCode);

      const result = await verifyAdminOtp(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred while verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-primary">
          <Lock className="w-12 h-12 p-3 bg-primary/10 rounded-xl" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Admin Portal Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {step === "credentials"
            ? "Enter credentials to generate dynamic authentication keys."
            : step === "passkey_input"
            ? "Enter the dynamic Passkey sent to your email & terminal."
            : "Enter the 6-digit OTP sent to your email."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-border">
          
          {step === "credentials" && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setAuthMethod("passkey"); setError(""); }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === "passkey"
                    ? "bg-card text-primary shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Dynamic Passkey
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod("otp"); setError(""); }}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === "otp"
                    ? "bg-card text-primary shadow-sm font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email OTP
              </button>
            </div>
          )}

          {step === "credentials" ? (
            <form onSubmit={handleSubmitCredentials} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Admin Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@ai-interview.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="captcha">Security Check</Label>
                  <div className="flex gap-4 items-center">
                    <canvas 
                      ref={canvasRef} 
                      width={150} 
                      height={50} 
                      className="border rounded-md shadow-sm shrink-0"
                      onClick={generateCaptcha}
                      title="Click to refresh CAPTCHA"
                      style={{ cursor: "pointer" }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={generateCaptcha}
                    >
                      Refresh
                    </Button>
                  </div>
                  <Input
                    id="captcha"
                    type="text"
                    placeholder="Type the letters/numbers above"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <div className="text-sm text-red-500 font-semibold p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">{error}</div>}

              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={loading}>
                {loading
                  ? "Generating Dynamic Key..."
                  : authMethod === "passkey" ? "Generate & Email Dynamic Passkey" : "Send 6-Digit Email OTP"}
              </Button>
            </form>
          ) : step === "passkey_input" ? (
            <form onSubmit={handleVerifyPasskey} className="space-y-6">
              <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-xs font-semibold text-primary text-center leading-relaxed">
                🔐 A unique, single-use <strong>Dynamic Passkey</strong> has been generated & emailed to <strong>{email}</strong>.
              </div>

              <div className="space-y-2">
                <Label htmlFor="passkeyInput" className="flex items-center gap-1.5 font-semibold text-primary">
                  <KeyRound className="w-4 h-4 text-primary" /> Enter Dynamic Passkey
                </Label>
                <div className="relative">
                  <Input
                    id="passkeyInput"
                    type="text"
                    placeholder="e.g. PASS-7K9M2P"
                    value={passkeyInput}
                    onChange={(e) => setPasskeyInput(e.target.value.toUpperCase())}
                    className="text-center font-mono text-lg tracking-widest uppercase"
                    required
                  />
                </div>
                <p className="text-[11px] text-muted-foreground text-center">
                  This dynamic passkey is single-use & expires in 10 minutes.
                </p>
              </div>

              {error && <div className="text-sm text-red-500 font-semibold p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">{error}</div>}

              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={loading || !passkeyInput}>
                {loading ? "Verifying Dynamic Passkey..." : "Verify Passkey & Sign In"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setError(""); setPasskeyInput(""); }}
                  className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Request New Passkey / Back to Credentials
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 text-center leading-relaxed">
                📬 A 6-digit OTP code has been dispatched to <strong>{email}</strong>.
              </div>

              <div className="space-y-2">
                <Label htmlFor="otpCode">6-Digit Verification OTP</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <Input
                    id="otpCode"
                    type="text"
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="pl-10 text-center text-xl tracking-[0.5em] font-mono"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {error && <div className="text-sm text-red-500 font-semibold p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">{error}</div>}

              <Button type="submit" className="w-full h-11 text-base font-semibold shadow-md" disabled={loading || otpCode.length !== 6}>
                {loading ? "Verifying OTP..." : "Verify OTP & Sign In"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setError(""); setOtpCode(""); }}
                  className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Back to Credentials
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
