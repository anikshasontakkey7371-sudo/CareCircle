import { NextRequest, NextResponse } from "next/server";
import { CareCircleRepository } from "@/lib/store";
import { sendMissedDoseAlert, sendUpcomingDoseReminder } from "@/lib/email/mailer";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret =
      process.env.CRON_SECRET || "carecircle_secure_cron_token_change_in_production";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized. Valid Bearer token required for automated cron trigger." },
        { status: 401 }
      );
    }

    const circle = await CareCircleRepository.getCircle();
    const doses = await CareCircleRepository.getDosesForToday(circle.elderlyUserId);
    const medications = await CareCircleRepository.getMedications(circle.elderlyUserId);

    const now = new Date();
    const nowMs = now.getTime();

    const caregiverEmails = circle.members
      .filter((m) => m.status === "active" && m.permissions.includes("receive_alerts"))
      .map((m) => m.email);

    const dashboardUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://carecircle-hackathon.run.app";

    let remindersDispatched = 0;
    let missedAlertsDispatched = 0;

    for (const dose of doses) {
      const scheduledDate = new Date(dose.scheduledTime);
      const scheduledMs = scheduledDate.getTime();
      const diffMinutes = (nowMs - scheduledMs) / (1000 * 60);

      const med = medications.find((m) => m.id === dose.medicationId);
      const instructions = med?.instructions || "";

      // 1. Upcoming reminder window: scheduled in the next 30 minutes, not yet sent
      if (
        dose.status === "pending" &&
        !dose.reminderSent &&
        diffMinutes >= -30 &&
        diffMinutes < 0
      ) {
        // Send upcoming reminder
        for (const email of caregiverEmails) {
          await sendUpcomingDoseReminder({
            recipientEmail: email,
            elderlyName: circle.elderlyName,
            medicationName: dose.medicationName,
            dosage: dose.dosage,
            scheduledTime: dose.scheduledTime,
            instructions,
            dashboardUrl,
          });
        }
        // Mark idempotent flag
        dose.reminderSent = true;
        remindersDispatched++;
      }

      // 2. Missed dose escalation: > 45 minutes past scheduled time and still pending
      if (
        dose.status === "pending" &&
        !dose.missedAlertSent &&
        diffMinutes >= 45
      ) {
        // Escalate status to 'missed'
        dose.status = "missed";
        dose.missedAlertSent = true;

        await sendMissedDoseAlert({
          caregiverEmails,
          elderlyName: circle.elderlyName,
          medicationName: dose.medicationName,
          dosage: dose.dosage,
          scheduledTime: dose.scheduledTime,
          instructions,
          dashboardUrl,
          emergencyPhone: circle.emergencyPhone,
        });

        await CareCircleRepository.addAuditLog({
          elderlyUserId: circle.elderlyUserId,
          circleId: circle.id,
          actorId: "system-scheduler",
          actorName: "Automated Adherence Monitor",
          action: "DOSE_MISSED_ALERT_SENT",
          details: {
            medicationName: dose.medicationName,
            dosage: dose.dosage,
            minutesLate: Math.round(diffMinutes),
            recipients: caregiverEmails,
          },
        });

        missedAlertsDispatched++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      totalDosesChecked: doses.length,
      remindersDispatched,
      missedAlertsDispatched,
    });
  } catch (error) {
    console.error("Cron reminder error:", error);
    return NextResponse.json(
      { error: "Cron reminder execution failed." },
      { status: 500 }
    );
  }
}
