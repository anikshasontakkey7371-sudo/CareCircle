"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Delete, Check, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { soundManager } from "@/lib/audio/chimes";
import { useAccessibility } from "@/components/common/AccessibilityContext";

export default function PasscodePage() {
  const router = useRouter();
  const { audioChimes, voicePrompt } = useAccessibility();
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDigitClick = (digit: string) => {
    if (pin.length >= 6) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError(null);

    if (audioChimes) {
      soundManager.playSuccessChime();
    }
  };

  const handleClear = () => {
    setPin("");
    setError(null);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin.length < 6 || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: pin }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Incorrect passcode. Please try again.");
        if (voicePrompt) {
          soundManager.speakText("Incorrect passcode. Please try again.");
        }
        setPin("");
        return;
      }

      if (voicePrompt) {
        soundManager.speakText(`Welcome, ${data.elderlyName}! Opening your care routine.`);
      }

      router.push("/elderly");
    } catch (err) {
      setError("Network or verification error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal-800 hover:text-terracotta-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-parchment-200 text-charcoal-800">
          Demo PIN: 482915
        </span>
      </div>

      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-terracotta-100 text-terracotta-600 border-2 border-terracotta-300 flex items-center justify-center mx-auto shadow-md">
          <KeyRound className="w-8 h-8" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-black text-charcoal-900 tracking-tight">
          Enter Your Care Passcode
        </h1>
        <p className="text-base font-bold text-charcoal-800">
          Please enter your 6-digit number to access your routine.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-terracotta-50 border-2 border-terracotta-300 text-terracotta-900 font-bold text-sm flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-terracotta-600" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Visual PIN Slots */}
      <div
        className="flex items-center justify-center gap-2 sm:gap-3 py-4"
        aria-label={`Current passcode entered: ${pin.length} of 6 digits`}
      >
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const hasDigit = pin.length > idx;
          return (
            <div
              key={idx}
              className={`w-12 h-16 rounded-2xl border-3 flex items-center justify-center text-3xl font-black transition-all ${
                hasDigit
                  ? "bg-white border-terracotta-600 text-charcoal-900 shadow-md scale-105"
                  : "bg-parchment-100 border-parchment-300 text-charcoal-800"
              }`}
            >
              {hasDigit ? pin[idx] : "•"}
            </div>
          );
        })}
      </div>

      {/* Senior Big Numeric Keypad */}
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigitClick(digit)}
            className="h-20 rounded-2xl bg-white border-2 border-parchment-300 hover:border-terracotta-500 font-black text-3xl text-charcoal-900 shadow-warm hover:shadow-warm-lg transition-all btn-tactile focus:ring-4 focus:ring-terracotta-300"
            aria-label={`Digit ${digit}`}
          >
            {digit}
          </button>
        ))}

        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          className="h-20 rounded-2xl bg-parchment-200 hover:bg-parchment-300 font-bold text-sm text-charcoal-800 transition-colors"
          aria-label="Clear all digits"
        >
          Clear
        </button>

        {/* Zero */}
        <button
          type="button"
          onClick={() => handleDigitClick("0")}
          className="h-20 rounded-2xl bg-white border-2 border-parchment-300 hover:border-terracotta-500 font-black text-3xl text-charcoal-900 shadow-warm transition-all btn-tactile focus:ring-4 focus:ring-terracotta-300"
          aria-label="Digit 0"
        >
          0
        </button>

        {/* Backspace */}
        <button
          type="button"
          onClick={handleBackspace}
          className="h-20 rounded-2xl bg-parchment-200 hover:bg-parchment-300 text-charcoal-900 flex items-center justify-center transition-colors"
          aria-label="Delete last digit"
        >
          <Delete className="w-7 h-7" aria-hidden="true" />
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        disabled={pin.length < 6 || loading}
        onClick={() => handleSubmit()}
        className={`w-full min-h-[64px] rounded-2xl font-black text-xl flex items-center justify-center gap-2 shadow-lg transition-all btn-tactile ${
          pin.length === 6 && !loading
            ? "bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-warm-lg cursor-pointer"
            : "bg-parchment-300 text-charcoal-800 cursor-not-allowed opacity-60"
        }`}
      >
        <Check className="w-6 h-6 stroke-[3]" aria-hidden="true" />
        <span>{loading ? "Verifying PIN..." : "Access Routine"}</span>
      </button>
    </div>
  );
}
