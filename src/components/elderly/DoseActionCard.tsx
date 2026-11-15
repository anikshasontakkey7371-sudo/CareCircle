"use client";

import React, { useState } from "react";
import { DoseLog } from "@/types";
import { Check, Clock, Volume2, AlertCircle, Ban } from "lucide-react";
import { soundManager } from "@/lib/audio/chimes";
import { useAccessibility } from "../common/AccessibilityContext";

interface DoseActionCardProps {
  dose: DoseLog;
  instructions?: string;
  pillColor?: string;
  pillShape?: string;
  onStatusChange: (logId: string, newStatus: "taken" | "skipped") => Promise<void>;
}

export function DoseActionCard({
  dose,
  instructions,
  pillColor = "#C85A32",
  pillShape = "tablet",
  onStatusChange,
}: DoseActionCardProps) {
  const { audioChimes, voicePrompt } = useAccessibility();
  const [loading, setLoading] = useState(false);

  const formatScheduledTime = (timeStr: string) => {
    try {
      if (timeStr.includes("T")) {
        const date = new Date(timeStr);
        return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      }
      const [h, m] = timeStr.split(":");
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  };

  const handleTakeDose = async () => {
    if (loading || dose.status === "taken") return;
    setLoading(true);
    try {
      await onStatusChange(dose.id, "taken");
      if (audioChimes) {
        soundManager.playSuccessChime();
      }
      if (voicePrompt) {
        soundManager.speakText(`Recorded: ${dose.medicationName} taken. Good job!`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkipDose = async () => {
    if (loading || dose.status !== "pending") return;
    const confirmSkip = window.confirm(
      `Are you sure you want to mark ${dose.medicationName} as skipped? Your caregiver will be updated.`
    );
    if (!confirmSkip) return;

    setLoading(true);
    try {
      await onStatusChange(dose.id, "skipped");
      if (voicePrompt) {
        soundManager.speakText(`Marked ${dose.medicationName} as skipped.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReadAloud = () => {
    const text = `Time for ${dose.medicationName}, ${dose.dosage}. Scheduled for ${formatScheduledTime(
      dose.scheduledTime
    )}. ${instructions ? `Instructions: ${instructions}` : ""}`;
    soundManager.speakText(text);
  };

  const isTaken = dose.status === "taken";
  const isSkipped = dose.status === "skipped";
  const isMissed = dose.status === "missed";
  const isPending = dose.status === "pending";

  return (
    <article
      aria-label={`${dose.medicationName} ${dose.dosage} scheduled for ${formatScheduledTime(dose.scheduledTime)}`}
      className={`relative rounded-3xl p-6 sm:p-8 transition-all border-2 shadow-warm ${
        isTaken
          ? "bg-sage-50/60 border-sage-300"
          : isMissed
          ? "bg-terracotta-50/70 border-terracotta-300"
          : isSkipped
          ? "bg-parchment-100 border-parchment-300 opacity-80"
          : "bg-white border-parchment-300 hover:border-terracotta-300"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left: Pill Visual, Name & Instructions */}
        <div className="flex items-start gap-4">
          {/* Pill Visual Badge */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 mt-1 border border-white"
            style={{ backgroundColor: `${pillColor}20` }}
            aria-hidden="true"
          >
            <div
              className="w-8 h-4 rounded-full border border-black/10 shadow-sm"
              style={{ backgroundColor: pillColor }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
                {dose.medicationName}
              </h3>
              <span className="text-lg sm:text-xl font-bold px-3 py-0.5 rounded-full bg-parchment-200 text-charcoal-800 border border-parchment-300">
                {dose.dosage}
              </span>
            </div>

            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-charcoal-800">
              <Clock className="w-5 h-5 text-terracotta-600 shrink-0" aria-hidden="true" />
              <span>Scheduled: {formatScheduledTime(dose.scheduledTime)}</span>
            </div>

            {instructions && (
              <p className="text-base sm:text-lg text-charcoal-800 font-medium pt-1">
                <span className="font-bold text-charcoal-900">How to take:</span> {instructions}
              </p>
            )}

            {/* Read Aloud Button */}
            <button
              type="button"
              onClick={handleReadAloud}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-terracotta-700 hover:text-terracotta-800 underline underline-offset-4 pt-1"
              aria-label={`Read aloud instructions for ${dose.medicationName}`}
            >
              <Volume2 className="w-4 h-4 text-terracotta-600" aria-hidden="true" />
              <span>Read Aloud</span>
            </button>
          </div>
        </div>

        {/* Right: Status Pill or Concluded State */}
        <div className="shrink-0 self-start">
          {isTaken && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-sage-600 text-white font-extrabold text-base shadow-sm">
              <Check className="w-5 h-5" aria-hidden="true" />
              <span>Taken {dose.loggedAt ? `(${new Date(dose.loggedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })})` : "✓"}</span>
            </div>
          )}
          {isMissed && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-terracotta-600 text-white font-extrabold text-base shadow-sm">
              <AlertCircle className="w-5 h-5" aria-hidden="true" />
              <span>Missed Dose</span>
            </div>
          )}
          {isSkipped && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-parchment-300 text-charcoal-800 font-extrabold text-base">
              <Ban className="w-5 h-5" aria-hidden="true" />
              <span>Skipped</span>
            </div>
          )}
        </div>
      </div>

      {/* Senior Big 1-Tap Action Button Area */}
      {isPending && (
        <div className="mt-6 pt-4 border-t border-parchment-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            type="button"
            disabled={loading}
            onClick={handleTakeDose}
            className="flex-1 min-h-[64px] px-8 py-4 rounded-2xl bg-sage-700 hover:bg-sage-800 text-white font-black text-xl sm:text-2xl tracking-wide flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all btn-tactile focus:ring-4 focus:ring-sage-300"
            aria-label={`Confirm taking ${dose.medicationName}`}
          >
            <Check className="w-7 h-7 stroke-[3]" aria-hidden="true" />
            <span>{loading ? "Recording..." : "I Took This Pill"}</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleSkipDose}
            className="px-6 py-4 min-h-[56px] rounded-2xl bg-parchment-200 hover:bg-parchment-300 text-charcoal-800 font-bold text-base transition-colors"
            aria-label={`Skip taking ${dose.medicationName}`}
          >
            Skip Dose
          </button>
        </div>
      )}
    </article>
  );
}
