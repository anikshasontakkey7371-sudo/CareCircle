"use client";

import React from "react";
import { useAccessibility, FontSizeOption } from "./AccessibilityContext";
import { Volume2, VolumeX, Eye, Type } from "lucide-react";

export function AccessibilityBar() {
  const {
    fontSize,
    setFontSize,
    highContrast,
    toggleHighContrast,
    audioChimes,
    toggleAudioChimes,
  } = useAccessibility();

  const fontOptions: { label: string; value: FontSizeOption; ariaLabel: string }[] = [
    { label: "A", value: "normal", ariaLabel: "Standard font size" },
    { label: "A+", value: "large", ariaLabel: "Large font size" },
    { label: "A++", value: "extra-large", ariaLabel: "Extra large font size" },
  ];

  return (
    <aside
      aria-label="Accessibility preferences toolbar"
      className="bg-parchment-200 border-b border-parchment-300 py-2 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-charcoal-900 font-medium">
          <Type className="w-4 h-4 text-terracotta-600" aria-hidden="true" />
          <span>Senior Assist:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Font Size Adjuster */}
          <div
            className="flex items-center bg-white rounded-lg border border-parchment-300 p-0.5 shadow-sm"
            role="group"
            aria-label="Text size options"
          >
            {fontOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFontSize(opt.value)}
                aria-label={opt.ariaLabel}
                aria-pressed={fontSize === opt.value}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                  fontSize === opt.value
                    ? "bg-terracotta-500 text-white shadow-sm"
                    : "text-charcoal-800 hover:bg-parchment-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* High Contrast Mode Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-colors shadow-sm ${
              highContrast
                ? "bg-charcoal-900 text-white border-charcoal-950"
                : "bg-white text-charcoal-900 border-parchment-300 hover:bg-parchment-100"
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>High Contrast</span>
          </button>

          {/* Audio Chime Feedback Toggle */}
          <button
            type="button"
            onClick={toggleAudioChimes}
            aria-pressed={audioChimes}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-bold transition-colors shadow-sm ${
              audioChimes
                ? "bg-sage-600 text-white border-sage-700"
                : "bg-white text-charcoal-900 border-parchment-300 hover:bg-parchment-100"
            }`}
          >
            {audioChimes ? (
              <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{audioChimes ? "Sound Chimes ON" : "Sound Muted"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
