import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import React from "react";
import { DoseActionCard } from "../components/elderly/DoseActionCard";
import { AccessibilityProvider } from "../components/common/AccessibilityContext";
import { DoseLog } from "../types";

describe("DoseActionCard Component Accessibility & Interaction", () => {
  const mockDose: DoseLog = {
    id: "test-dose-1",
    elderlyUserId: "user-1",
    medicationId: "med-1",
    medicationName: "Metformin",
    dosage: "500 mg",
    scheduledTime: "08:00",
    status: "pending",
  };

  it("should render medication name, dosage, and scheduled time", () => {
    const handleStatusChange = vi.fn();
    render(
      <AccessibilityProvider>
        <DoseActionCard
          dose={mockDose}
          instructions="Take after breakfast with water"
          onStatusChange={handleStatusChange}
        />
      </AccessibilityProvider>
    );

    expect(screen.getByText("Metformin")).toBeDefined();
    expect(screen.getByText("500 mg")).toBeDefined();
    expect(screen.getByText(/Scheduled: 8:00 AM/i)).toBeDefined();
    expect(screen.getByText(/Take after breakfast with water/i)).toBeDefined();
  });

  it("should provide an accessible big button for 1-tap dose confirmation", async () => {
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);
    render(
      <AccessibilityProvider>
        <DoseActionCard
          dose={mockDose}
          onStatusChange={handleStatusChange}
        />
      </AccessibilityProvider>
    );

    const button = screen.getByRole("button", { name: /Confirm taking Metformin/i });
    expect(button).toBeDefined();
    expect(button.textContent).toContain("I Took This Pill");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(handleStatusChange).toHaveBeenCalledWith("test-dose-1", "taken");
  });

  it("should render taken status badge when dose is already logged", () => {
    const takenDose: DoseLog = {
      ...mockDose,
      status: "taken",
      loggedAt: "2026-11-15T08:05:00Z",
    };

    render(
      <AccessibilityProvider>
        <DoseActionCard
          dose={takenDose}
          onStatusChange={vi.fn()}
        />
      </AccessibilityProvider>
    );

    expect(screen.getByText(/Taken/i)).toBeDefined();
    expect(screen.queryByText("I Took This Pill")).toBeNull();
  });
});

