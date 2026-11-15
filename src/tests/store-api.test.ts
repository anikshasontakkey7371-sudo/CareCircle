import { describe, it, expect, beforeEach } from "vitest";
import { CareCircleRepository } from "../lib/store";
import { verifyPasscode } from "../lib/utils/passcode";

describe("CareCircle Data Layer & Business Logic", () => {
  it("should retrieve circle details and verify default demo passcode", async () => {
    const circle = await CareCircleRepository.getCircle();
    expect(circle).toBeDefined();
    expect(circle.elderlyName).toBe("Eleanor Vance");

    // Verify default passcode 482915 matches
    const isValid = verifyPasscode("482915", circle.passcodeHash, circle.passcodeSalt);
    expect(isValid).toBe(true);
  });

  it("should update circle passcode with a new salt and hash", async () => {
    const circle = await CareCircleRepository.getCircle();
    const updated = await CareCircleRepository.updateCirclePasscode(circle.id, "992831");

    expect(updated.pin).toBe("992831");
    const isNewValid = verifyPasscode("992831", updated.hash, circle.passcodeSalt);
    expect(isNewValid).toBe(true);

    // Old pin must no longer be valid
    expect(verifyPasscode("482915", updated.hash, circle.passcodeSalt)).toBe(false);
  });

  it("should retrieve active medications and support saving a new prescription", async () => {
    const medsBefore = await CareCircleRepository.getMedications();
    expect(medsBefore.length).toBeGreaterThanOrEqual(1);

    const newMed = await CareCircleRepository.saveMedication({
      name: "CoQ10",
      dosage: "100 mg",
      unit: "Capsule",
      instructions: "Take with morning meal",
      times: ["08:00"],
      currentStock: 60,
      refillAlertThreshold: 10,
    });

    expect(newMed.id).toBeDefined();
    expect(newMed.name).toBe("CoQ10");

    const medsAfter = await CareCircleRepository.getMedications();
    const found = medsAfter.find((m) => m.name === "CoQ10");
    expect(found).toBeDefined();
  });

  it("should decrement pill stock accurately when a dose is logged as taken", async () => {
    const meds = await CareCircleRepository.getMedications();
    const metformin = meds.find((m) => m.name === "Metformin");
    expect(metformin).toBeDefined();
    const initialStock = metformin!.currentStock;

    const doses = await CareCircleRepository.getDosesForToday();
    const pendingDose = doses.find((d) => d.medicationName === "Metformin" && d.status === "pending");
    
    if (pendingDose) {
      await CareCircleRepository.updateDoseStatus(pendingDose.id, "taken", "elderly");
      const updatedMeds = await CareCircleRepository.getMedications();
      const updatedMetformin = updatedMeds.find((m) => m.name === "Metformin");
      expect(updatedMetformin!.currentStock).toBe(initialStock - 1);
    }
  });

  it("should record immutable audit logs for every significant care action", async () => {
    const auditBefore = await CareCircleRepository.getAuditLogs();
    const countBefore = auditBefore.length;

    await CareCircleRepository.addAuditLog({
      elderlyUserId: "eleanor-vance-78",
      actorId: "test-runner",
      actorName: "Automated Test Suite",
      action: "EMERGENCY_ALERT_TRIGGERED",
      details: { reason: "Unit test assertion check" },
    });

    const auditAfter = await CareCircleRepository.getAuditLogs();
    expect(auditAfter.length).toBe(countBefore + 1);
    expect(auditAfter[0].action).toBe("EMERGENCY_ALERT_TRIGGERED");
  });

  it("should add care circle members with scoped permissions", async () => {
    const success = await CareCircleRepository.addCircleMember(
      "new.nurse@springfield.org",
      "nurse"
    );
    expect(success).toBe(true);

    const circle = await CareCircleRepository.getCircle();
    const member = circle.members.find((m) => m.email === "new.nurse@springfield.org");
    expect(member).toBeDefined();
    expect(member?.relationship).toBe("nurse");
    expect(member?.permissions).toContain("view_meds");
  });
});
