import { DoseLog, AdherenceMetrics } from "@/types";

/**
 * Calculates comprehensive adherence metrics from a list of dose logs.
 * Adherence rate considers concluded doses (taken, skipped, missed).
 * Doses still in 'pending' status for the future do not penalize current score.
 */
export function calculateAdherenceMetrics(logs: DoseLog[]): AdherenceMetrics {
  const totalScheduled = logs.length;
  let taken = 0;
  let skipped = 0;
  let missed = 0;
  let pending = 0;

  for (const log of logs) {
    switch (log.status) {
      case "taken":
        taken++;
        break;
      case "skipped":
        skipped++;
        break;
      case "missed":
        missed++;
        break;
      case "pending":
      default:
        pending++;
        break;
    }
  }

  const concludedDoses = taken + skipped + missed;
  const adherencePercentage =
    concludedDoses === 0
      ? 100 // Default to 100% when no past doses have elapsed yet
      : Math.round((taken / concludedDoses) * 100);

  return {
    totalScheduled,
    taken,
    skipped,
    missed,
    pending,
    adherencePercentage,
  };
}

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/**
 * Maps a HH:mm 24h time string to a time of day period.
 * Morning: 05:00 - 11:59
 * Afternoon: 12:00 - 16:59
 * Evening: 17:00 - 20:59
 * Night: 21:00 - 04:59
 */
export function getTimeOfDay(timeStr: string): TimeOfDay {
  const [hourStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);

  if (isNaN(hour)) return "morning";
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/**
 * Human-friendly period description for elderly users
 */
export function getTimeOfDayLabel(period: TimeOfDay): {
  label: string;
  iconName: string;
  subtext: string;
} {
  switch (period) {
    case "morning":
      return {
        label: "Morning Routine",
        iconName: "Sunrise",
        subtext: "5:00 AM – 11:59 AM",
      };
    case "afternoon":
      return {
        label: "Afternoon Routine",
        iconName: "Sun",
        subtext: "12:00 PM – 4:59 PM",
      };
    case "evening":
      return {
        label: "Evening Routine",
        iconName: "Sunset",
        subtext: "5:00 PM – 8:59 PM",
      };
    case "night":
      return {
        label: "Bedtime Routine",
        iconName: "Moon",
        subtext: "9:00 PM – 4:59 AM",
      };
  }
}
