import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CareCircleRepository } from "@/lib/store";
import { verifyPasscode } from "@/lib/utils/passcode";

const PasscodeSchema = z.object({
  passcode: z.string().min(4).max(8),
  circleId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = PasscodeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid passcode format. Please enter a 6-digit code." },
        { status: 400 }
      );
    }

    const { passcode, circleId } = result.data;
    const circle = await CareCircleRepository.getCircle(circleId);

    const isValid = verifyPasscode(
      passcode,
      circle.passcodeHash,
      circle.passcodeSalt
    );

    if (!isValid) {
      await CareCircleRepository.addAuditLog({
        elderlyUserId: circle.elderlyUserId,
        circleId: circle.id,
        actorId: "unknown",
        actorName: "Passcode Authentication",
        action: "PASSCODE_VERIFIED",
        details: { status: "FAILED_ATTEMPT" },
      });

      return NextResponse.json(
        { error: "Incorrect passcode. Please check with your family or caregiver." },
        { status: 401 }
      );
    }

    // Success: Log audit entry
    await CareCircleRepository.addAuditLog({
      elderlyUserId: circle.elderlyUserId,
      circleId: circle.id,
      actorId: circle.elderlyUserId,
      actorName: circle.elderlyName,
      action: "PASSCODE_VERIFIED",
      details: { status: "SUCCESS" },
    });

    return NextResponse.json({
      success: true,
      elderlyUserId: circle.elderlyUserId,
      elderlyName: circle.elderlyName,
      circleId: circle.id,
      emergencyPhone: circle.emergencyPhone,
    });
  } catch (error) {
    console.error("Passcode auth error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
