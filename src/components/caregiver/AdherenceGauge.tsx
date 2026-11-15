"use client";

import React from "react";
import { AdherenceMetrics } from "@/types";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

interface AdherenceGaugeProps {
  metrics: AdherenceMetrics;
  periodLabel?: string;
}

export function AdherenceGauge({
  metrics,
  periodLabel = "Today's Adherence",
}: AdherenceGaugeProps) {
  const { adherencePercentage, taken, missed, skipped, pending, totalScheduled } =
    metrics;

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (adherencePercentage / 100) * circumference;

  let gaugeColor = "#3E6B56"; // Sage (>=80%)
  let statusText = "Optimal Adherence";
  let statusBadgeBg = "bg-sage-100 text-sage-800 border-sage-300";

  if (adherencePercentage < 60) {
    gaugeColor = "#C85A32"; // Terracotta (<60%)
    statusText = "Caregiver Attention Needed";
    statusBadgeBg = "bg-terracotta-100 text-terracotta-800 border-terracotta-300";
  } else if (adherencePercentage < 80) {
    gaugeColor = "#D99B26"; // Ochre (60-79%)
    statusText = "Moderate Adherence";
    statusBadgeBg = "bg-ochre-100 text-ochre-800 border-ochre-300";
  }

  return (
    <section
      aria-label="Medication Adherence Overview"
      className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-300 shadow-warm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-charcoal-900 tracking-tight">
            {periodLabel}
          </h2>
          <p className="text-sm font-semibold text-charcoal-800 mt-1">
            Real-time compliance tracking across scheduled doses
          </p>
        </div>
        <span
          className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border ${statusBadgeBg}`}
        >
          {statusText}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* SVG Circular Progress Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg
            className="w-44 h-44 transform -rotate-90"
            viewBox="0 0 160 160"
            role="progressbar"
            aria-valuenow={adherencePercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Adherence score: ${adherencePercentage}%`}
          >
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#EAE2D8"
              strokeWidth="16"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={gaugeColor}
              strokeWidth="16"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Central Percentage */}
          <div className="absolute text-center">
            <span className="text-4xl font-black text-charcoal-900 block leading-none">
              {adherencePercentage}%
            </span>
            <span className="text-xs font-bold text-charcoal-800 uppercase tracking-wider block mt-1">
              Adherence
            </span>
          </div>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
          {/* Taken */}
          <div className="bg-sage-50/70 border border-sage-200 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-sage-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-2xl font-black text-charcoal-900">{taken}</div>
            <div className="text-xs font-bold text-sage-800 uppercase tracking-wide">
              Taken
            </div>
          </div>

          {/* Missed */}
          <div className="bg-terracotta-50/70 border border-terracotta-200 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-terracotta-600 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
              <XCircle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-2xl font-black text-charcoal-900">{missed}</div>
            <div className="text-xs font-bold text-terracotta-800 uppercase tracking-wide">
              Missed
            </div>
          </div>

          {/* Skipped */}
          <div className="bg-parchment-100 border border-parchment-300 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-parchment-400 text-charcoal-900 flex items-center justify-center mx-auto mb-2 shadow-sm">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-2xl font-black text-charcoal-900">{skipped}</div>
            <div className="text-xs font-bold text-charcoal-800 uppercase tracking-wide">
              Skipped
            </div>
          </div>

          {/* Pending */}
          <div className="bg-ochre-50/70 border border-ochre-200 rounded-2xl p-4 text-center">
            <div className="w-8 h-8 rounded-full bg-ochre-500 text-white flex items-center justify-center mx-auto mb-2 shadow-sm">
              <Clock className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="text-2xl font-black text-charcoal-900">{pending}</div>
            <div className="text-xs font-bold text-ochre-800 uppercase tracking-wide">
              Upcoming
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
