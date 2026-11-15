import { DoseLog, AdherenceMetrics } from "@/types";

/**
 * Returns YYYY-MM-DD in the local timezone (Asia/Kolkata).
 * Avoids UTC day-shift bugs from toISOString().
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date or ISO string in Indian DD/MM/YYYY format.
 */
export function formatIndianDate(dateOrIso: Date | string): string {
  try {
    const d = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(dateOrIso);
  }
}

/**
 * Formats time in Indian 12-hour format with AM/PM.
 */
export function formatIndianTime(timeOrIso: string): string {
  try {
    if (timeOrIso.includes("T")) {
      const d = new Date(timeOrIso);
      return d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    const [h, m] = timeOrIso.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  } catch {
    return timeOrIso;
  }
}

/**
 * Calculates comprehensive adherence metrics using doses that are actually due.
 *
 * Rules:
 * 1. A dose is DUE if its scheduled time <= now, OR if it has already been taken/skipped.
 * 2. Upcoming doses (scheduled for later today and still pending) are KEPT SEPARATE.
 * 3. Upcoming doses DO NOT count as missed, and DO NOT penalize current adherence.
 * 4. Adherence percentage is calculated strictly across DUE doses:
 *    adherence = (taken / dueCount) * 100
 */
export function calculateAdherenceMetrics(
  logs: DoseLog[],
  now: Date = new Date()
): AdherenceMetrics {
  const totalScheduled = logs.length;
  let taken = 0;
  let skipped = 0;
  let missed = 0;
  let dueCount = 0;
  let upcomingCount = 0;
  let pending = 0;

  const nowMs = now.getTime();

  for (const log of logs) {
    const scheduledDate = new Date(log.scheduledTime);
    const isPastOrDue =
      !isNaN(scheduledDate.getTime()) && scheduledDate.getTime() <= nowMs;

    if (log.status === "taken") {
      taken++;
      dueCount++;
    } else if (log.status === "skipped") {
      skipped++;
      dueCount++;
    } else if (log.status === "missed") {
      missed++;
      dueCount++;
    } else {
      // Pending status
      pending++;
      if (isPastOrDue) {
        // Scheduled time has passed but not taken yet -> Overdue/Due
        dueCount++;
      } else {
        // Scheduled in the future today -> Upcoming
        upcomingCount++;
      }
    }
  }

  // Adherence across all doses that have come due so far
  const adherencePercentage =
    dueCount === 0
      ? 100 // No doses have come due yet today; perfect initial state
      : Math.round((taken / dueCount) * 100);

  return {
    totalScheduled,
    dueCount,
    upcomingCount,
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
        label: "Morning Routine (सुबह)",
        iconName: "Sunrise",
        subtext: "5:00 AM – 11:59 AM",
      };
    case "afternoon":
      return {
        label: "Afternoon Routine (दोपहर)",
        iconName: "Sun",
        subtext: "12:00 PM – 4:59 PM",
      };
    case "evening":
      return {
        label: "Evening Routine (शाम)",
        iconName: "Sunset",
        subtext: "5:00 PM – 8:59 PM",
      };
    case "night":
      return {
        label: "Bedtime Routine (रात)",
        iconName: "Moon",
        subtext: "9:00 PM – 4:59 AM",
      };
  }
}
