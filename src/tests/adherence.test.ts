import { describe, it, expect } from "vitest";
import {
  calculateAdherenceMetrics,
  getTimeOfDay,
  getTimeOfDayLabel,
} from "../lib/utils/adherence";
import { DoseLog } from "../types";

describe("Adherence Calculation Engine", () => {
  it("should return 100% adherence when no doses have concluded yet", () => {
    const logs: DoseLog[] = [
      {
        id: "log-1",
        elderlyUserId: "user-1",
        medicationId: "med-1",
        medicationName: "Metformin",
        dosage: "500mg",
        scheduledTime: "2026-11-15T20:00:00Z",
        status: "pending",
      },
    ];

    const metrics = calculateAdherenceMetrics(logs);
    expect(metrics.totalScheduled).toBe(1);
    expect(metrics.pending).toBe(1);
    expect(metrics.taken).toBe(0);
    expect(metrics.adherencePercentage).toBe(100);
  });

  it("should calculate exact percentage when doses are taken, skipped, and missed", () => {
    const logs: DoseLog[] = [
      {
        id: "log-1",
        elderlyUserId: "user-1",
        medicationId: "med-1",
        medicationName: "Metformin",
        dosage: "500mg",
        scheduledTime: "2026-11-15T08:00:00Z",
        status: "taken",
      },
      {
        id: "log-2",
        elderlyUserId: "user-1",
        medicationId: "med-2",
        medicationName: "Lisinopril",
        dosage: "10mg",
        scheduledTime: "2026-11-15T08:00:00Z",
        status: "taken",
      },
      {
        id: "log-3",
        elderlyUserId: "user-1",
        medicationId: "med-3",
        medicationName: "Atorvastatin",
        dosage: "20mg",
        scheduledTime: "2026-11-15T12:00:00Z",
        status: "skipped",
      },
      {
        id: "log-4",
        elderlyUserId: "user-1",
        medicationId: "med-4",
        medicationName: "Amlodipine",
        dosage: "5mg",
        scheduledTime: "2026-11-15T18:00:00Z",
        status: "missed",
      },
      {
        id: "log-5",
        elderlyUserId: "user-1",
        medicationId: "med-5",
        medicationName: "Vitamin D",
        dosage: "1000 IU",
        scheduledTime: "2026-11-15T21:00:00Z",
        status: "pending",
      },
    ];

    const metrics = calculateAdherenceMetrics(logs);
    expect(metrics.totalScheduled).toBe(5);
    expect(metrics.taken).toBe(2);
    expect(metrics.skipped).toBe(1);
    expect(metrics.missed).toBe(1);
    expect(metrics.pending).toBe(1);
    // Concluded = 2 taken + 1 skipped + 1 missed = 4. Taken = 2. 2/4 = 50%
    expect(metrics.adherencePercentage).toBe(50);
  });

  it("should correctly classify time of day periods", () => {
    expect(getTimeOfDay("08:00")).toBe("morning");
    expect(getTimeOfDay("11:30")).toBe("morning");
    expect(getTimeOfDay("12:00")).toBe("afternoon");
    expect(getTimeOfDay("16:45")).toBe("afternoon");
    expect(getTimeOfDay("17:00")).toBe("evening");
    expect(getTimeOfDay("20:30")).toBe("evening");
    expect(getTimeOfDay("21:00")).toBe("night");
    expect(getTimeOfDay("02:00")).toBe("night");
  });

  it("should provide senior-friendly routine labels", () => {
    const morning = getTimeOfDayLabel("morning");
    expect(morning.label).toContain("Morning");
    expect(morning.subtext).toContain("AM");
  });
});

