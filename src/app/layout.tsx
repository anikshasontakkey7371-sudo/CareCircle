import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AccessibilityProvider } from "@/components/common/AccessibilityContext";
import { AccessibilityBar } from "@/components/common/AccessibilityBar";
import { Navbar } from "@/components/common/Navbar";
import React from "react";

export const metadata: Metadata = {
  title: "CareCircle — Elderly Care & Medication Management Platform",
  description:
    "A secure, senior-accessible healthcare platform connecting elderly individuals, family members, and caregivers for medication scheduling, adherence tracking, and routine monitoring.",
  applicationName: "CareCircle",
  keywords: [
    "elderly care",
    "medication management",
    "senior healthcare",
    "adherence tracking",
    "care circle",
    "prescriptions",
  ],
  authors: [{ name: "CareCircle Hackathon Team" }],
  openGraph: {
    title: "CareCircle — Elderly Care & Medication Management Platform",
    description:
      "A secure, senior-accessible healthcare platform connecting elderly individuals, family members, and caregivers.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-terracotta-200 selection:text-terracotta-900">
        <AccessibilityProvider>
          {/* Skip link for screen reader and keyboard accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-terracotta-600 text-white font-bold py-3 px-6 rounded-xl shadow-2xl ring-4 ring-terracotta-300"
          >
            Skip to main content
          </a>

          <AccessibilityBar />
          <Navbar />

          <main id="main-content" className="flex-1">
            {children}
          </main>

          <footer className="bg-parchment-100 border-t border-parchment-300 py-8 px-4 sm:px-6 mt-16 text-center text-sm text-charcoal-800">
            <div className="max-w-4xl mx-auto space-y-3">
              <p className="font-semibold text-charcoal-900">
                CareCircle &mdash; Secure Healthcare Platform for Seniors &amp; Care Circles
              </p>
              <p className="text-xs text-charcoal-800 leading-relaxed max-w-2xl mx-auto">
                <strong>Medical Notice:</strong> CareCircle is designed to assist family coordination and adherence logging. It does not provide autonomous clinical or medication dosage recommendations. Always consult licensed healthcare providers for prescription adjustments.
              </p>
              <p className="text-xs text-charcoal-800 pt-2 border-t border-parchment-200">
                Built for Catalyst Hackathon &bull; Deployed on Google Cloud Run &bull; Protected with Firebase Security
              </p>
            </div>
          </footer>
        </AccessibilityProvider>
      </body>
    </html>
  );
}

