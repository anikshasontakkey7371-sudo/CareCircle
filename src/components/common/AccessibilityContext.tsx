"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type FontSizeOption = "normal" | "large" | "extra-large";

interface AccessibilityContextType {
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  audioChimes: boolean;
  toggleAudioChimes: () => void;
  voicePrompt: boolean;
  toggleVoicePrompt: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(
  undefined
);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fontSize, setFontSizeState] = useState<FontSizeOption>("normal");
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [audioChimes, setAudioChimes] = useState<boolean>(true);
  const [voicePrompt, setVoicePrompt] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const storedFontSize = localStorage.getItem("carecircle_font_size") as FontSizeOption;
      if (storedFontSize) setFontSizeState(storedFontSize);

      const storedHighContrast = localStorage.getItem("carecircle_high_contrast");
      if (storedHighContrast) setHighContrast(storedHighContrast === "true");

      const storedAudio = localStorage.getItem("carecircle_audio_chimes");
      if (storedAudio !== null) setAudioChimes(storedAudio === "true");

      const storedVoice = localStorage.getItem("carecircle_voice_prompt");
      if (storedVoice !== null) setVoicePrompt(storedVoice === "true");
    } catch {
      // LocalStorage unavailable in SSR
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute("data-font-size", fontSize);
    try {
      localStorage.setItem("carecircle_font_size", fontSize);
    } catch {}
  }, [fontSize, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (highContrast) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    try {
      localStorage.setItem("carecircle_high_contrast", String(highContrast));
    } catch {}
  }, [highContrast, mounted]);

  const setFontSize = (size: FontSizeOption) => {
    setFontSizeState(size);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const toggleAudioChimes = () => {
    setAudioChimes((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("carecircle_audio_chimes", String(next));
      } catch {}
      return next;
    });
  };

  const toggleVoicePrompt = () => {
    setVoicePrompt((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("carecircle_voice_prompt", String(next));
      } catch {}
      return next;
    });
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        toggleHighContrast,
        audioChimes,
        toggleAudioChimes,
        voicePrompt,
        toggleVoicePrompt,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}

