"use client";

import React from "react";
import { PhoneCall, ShieldAlert, MapPin, Heart, Ambulance } from "lucide-react";

interface EmergencyCallCardProps {
  primaryCaregiverName?: string;
  primaryCaregiverPhone?: string;
  emergencyHelplineNumber?: string;
  ambulanceNumber?: string;
  homeAddress?: string;
  medicalConditions?: string;
}

export function EmergencyCallCard({
  primaryCaregiverName = "Priya Sharma (Daughter)",
  primaryCaregiverPhone = "+91 98220 12345",
  emergencyHelplineNumber = "112",
  ambulanceNumber = "108",
  homeAddress = "Flat 402, Shanti Heights, Ramdaspeth, Nagpur, Maharashtra 440010",
  medicalConditions = "Type 2 Diabetes, Mild Hypertension. Allergic to Penicillin.",
}: EmergencyCallCardProps) {
  return (
    <section
      aria-label="Emergency Care & Contacts"
      className="rounded-3xl p-6 sm:p-8 bg-terracotta-50/80 border-2 border-terracotta-300 shadow-warm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-terracotta-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <ShieldAlert className="w-7 h-7" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
            Emergency &amp; Family Help (आपातकालीन सहायता)
          </h2>
          <p className="text-sm sm:text-base font-semibold text-terracotta-800">
            One-tap direct dial to your family and Indian emergency services
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Call Primary Caregiver */}
        <a
          href={`tel:${primaryCaregiverPhone.replace(/[^0-9+]/g, "")}`}
          className="flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-terracotta-200 hover:border-terracotta-500 shadow-md hover:shadow-lg transition-all text-left group btn-tactile"
          aria-label={`Call primary caregiver ${primaryCaregiverName} at ${primaryCaregiverPhone}`}
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-700 block">
              Primary Caregiver (केयरगिवर)
            </span>
            <span className="text-xl font-black text-charcoal-900 block group-hover:text-terracotta-600">
              {primaryCaregiverName}
            </span>
            <span className="text-base font-bold text-charcoal-800 block">
              {primaryCaregiverPhone}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-terracotta-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <PhoneCall className="w-6 h-6" aria-hidden="true" />
          </div>
        </a>

        {/* National Emergency Helpline 112 */}
        <a
          href={`tel:${emergencyHelplineNumber}`}
          className="flex items-center justify-between p-5 rounded-2xl bg-charcoal-900 text-white border-2 border-charcoal-950 hover:bg-black shadow-md hover:shadow-lg transition-all text-left group btn-tactile"
          aria-label={`Call National Emergency Helpline ${emergencyHelplineNumber}`}
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-terracotta-400 block">
              National Helpline (अखिल भारतीय)
            </span>
            <span className="text-xl font-black text-white block">
              Emergency 112
            </span>
            <span className="text-xs font-semibold text-parchment-300 block">
              Police &bull; Fire &bull; Medical
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6" aria-hidden="true" />
          </div>
        </a>

        {/* Dedicated Ambulance 108 */}
        <a
          href={`tel:${ambulanceNumber}`}
          className="flex items-center justify-between p-5 rounded-2xl bg-sage-700 text-white border-2 border-sage-800 hover:bg-sage-800 shadow-md hover:shadow-lg transition-all text-left group btn-tactile"
          aria-label={`Call Indian Ambulance Service ${ambulanceNumber}`}
        >
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sage-200 block">
              Ambulance (एम्बुलेंस)
            </span>
            <span className="text-xl font-black text-white block">
              Medical 108
            </span>
            <span className="text-xs font-semibold text-sage-100 block">
              Emergency Medical Van
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white text-sage-800 flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform">
            <Ambulance className="w-6 h-6" aria-hidden="true" />
          </div>
        </a>
      </div>

      {/* Senior Safety Info (Address & Medical Info) */}
      <div className="mt-5 p-4 rounded-2xl bg-white/90 border border-terracotta-200 space-y-2 text-sm text-charcoal-800">
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="text-charcoal-900">Your Nagpur Home Address:</strong> {homeAddress}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Heart className="w-5 h-5 text-terracotta-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <strong className="text-charcoal-900">Medical Notes for Paramedics / Doctors:</strong> {medicalConditions}
          </div>
        </div>
      </div>
    </section>
  );
}
