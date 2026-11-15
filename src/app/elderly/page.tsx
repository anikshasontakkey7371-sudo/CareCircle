"use client";

import React, { useEffect, useState } from "react";
import { DoseLog, Medication } from "@/types";
import { DoseActionCard } from "@/components/elderly/DoseActionCard";
import { EmergencyCallCard } from "@/components/elderly/EmergencyCallCard";
import { getTimeOfDay, getTimeOfDayLabel, TimeOfDay } from "@/lib/utils/adherence";
import { Sparkles, CheckCircle2, Clock, Volume2 } from "lucide-react";
import { soundManager } from "@/lib/audio/chimes";

export default function ElderlyPage() {
  const [doses, setDoses] = useState<DoseLog[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [seniorName, setSeniorName] = useState("Eleanor Vance");

  const fetchDoses = async () => {
    try {
      const [dosesRes, medsRes] = await Promise.all([
        fetch("/api/doses"),
        fetch("/api/medications"),
      ]);

      if (dosesRes.ok) {
        const data = await dosesRes.json();
        setDoses(data.doses || []);
      }
      if (medsRes.ok) {
        const data = await medsRes.json();
        setMedications(data.medications || []);
      }
    } catch (err) {
      console.warn("Error loading elderly schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoses();
  }, []);

  const handleStatusChange = async (logId: string, newStatus: "taken" | "skipped") => {
    // Optimistic UI update
    setDoses((prev) =>
      prev.map((d) =>
        d.id === logId
          ? {
              ...d,
              status: newStatus,
              loggedAt: new Date().toISOString(),
            }
          : d
      )
    );

    try {
      await fetch("/api/doses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId,
          status: newStatus,
          loggedByRole: "elderly",
        }),
      });
    } catch (err) {
      console.warn("Failed to persist dose update:", err);
      // Re-fetch to sync
      fetchDoses();
    }
  };

  const handleReadFullDailySummary = () => {
    const takenCount = doses.filter((d) => d.status === "taken").length;
    const totalCount = doses.length;
    const pendingDoses = doses.filter((d) => d.status === "pending");

    let speech = `Hello ${seniorName}. Today you have taken ${takenCount} of ${totalCount} scheduled medications. `;
    if (pendingDoses.length > 0) {
      speech += `Your next dose is ${pendingDoses[0].medicationName} ${pendingDoses[0].dosage}.`;
    } else {
      speech += `All of your medications for today have been completed. Excellent work!`;
    }
    soundManager.speakText(speech);
  };

  // Group doses into time of day
  const groupedDoses: Record<TimeOfDay, DoseLog[]> = {
    morning: [],
    afternoon: [],
    evening: [],
    night: [],
  };

  for (const dose of doses) {
    const timeOnly = dose.scheduledTime.includes("T")
      ? dose.scheduledTime.split("T")[1].substring(0, 5)
      : dose.scheduledTime;
    const period = getTimeOfDay(timeOnly);
    groupedDoses[period].push(dose);
  }

  const takenCount = doses.filter((d) => d.status === "taken").length;
  const totalCount = doses.length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Warm Header Greeting */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-parchment-300 shadow-warm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-terracotta-700 block">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-charcoal-900 tracking-tight">
              Good day, {seniorName.split(" ")[0]}!
            </h1>
            <p className="text-base sm:text-lg font-bold text-charcoal-800">
              Here are your daily health routines and medication reminders.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReadFullDailySummary}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-parchment-200 hover:bg-parchment-300 text-charcoal-900 font-extrabold text-sm sm:text-base border border-parchment-300 transition-colors self-start sm:self-center btn-tactile"
            aria-label="Listen to daily medication summary"
          >
            <Volume2 className="w-5 h-5 text-terracotta-600" aria-hidden="true" />
            <span>Listen to Summary</span>
          </button>
        </div>

        {/* Progress Pill Bar */}
        <div className="mt-6 pt-6 border-t border-parchment-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-sage-600" aria-hidden="true" />
            <span className="text-lg font-black text-charcoal-900">
              {takenCount} of {totalCount} doses completed today
            </span>
          </div>

          <div className="flex-1 max-w-xs bg-parchment-200 h-4 rounded-full overflow-hidden border border-parchment-300">
            <div
              className="bg-sage-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalCount > 0 ? (takenCount / totalCount) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Routine Blocks (Morning, Afternoon, Evening, Bedtime) */}
      {(["morning", "afternoon", "evening", "night"] as TimeOfDay[]).map(
        (period) => {
          const periodDoses = groupedDoses[period];
          if (periodDoses.length === 0) return null;

          const { label, subtext } = getTimeOfDayLabel(period);

          return (
            <section
              key={period}
              aria-label={label}
              className="space-y-4"
            >
              <div className="flex items-baseline justify-between border-b-2 border-parchment-300 pb-2">
                <h2 className="text-2xl sm:text-3xl font-black text-charcoal-900">
                  {label}
                </h2>
                <span className="text-sm sm:text-base font-bold text-charcoal-800">
                  {subtext}
                </span>
              </div>

              <div className="space-y-4">
                {periodDoses.map((dose) => {
                  const med = medications.find((m) => m.id === dose.medicationId);
                  return (
                    <DoseActionCard
                      key={dose.id}
                      dose={dose}
                      instructions={med?.instructions}
                      pillColor={med?.colorCode}
                      pillShape={med?.pillShape}
                      onStatusChange={handleStatusChange}
                    />
                  );
                })}
              </div>
            </section>
          );
        }
      )}

      {/* Senior Help & One-Tap Emergency Assistance */}
      <EmergencyCallCard />
    </div>
  );
}
