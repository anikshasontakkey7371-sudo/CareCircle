import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CareCircleRepository } from "@/lib/store";
import { generateRandomPasscode } from "@/lib/utils/passcode";

const CircleActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("reset_passcode"),
    circleId: z.string().optional(),
  }),
  z.object({
    action: z.literal("invite_member"),
    email: z.string().email(),
    relationship: z.enum(["family", "nurse", "doctor"]),
  }),
]);

export async function GET() {
  try {
    const circle = await CareCircleRepository.getCircle();
    const auditLogs = await CareCircleRepository.getAuditLogs(circle.elderlyUserId);

    return NextResponse.json({ circle, auditLogs });
  } catch (error) {
    console.error("Fetch care circle error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve care circle details." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CircleActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const circle = await CareCircleRepository.getCircle();

    if (result.data.action === "reset_passcode") {
      const newPin = generateRandomPasscode();
      const updated = await CareCircleRepository.updateCirclePasscode(circle.id, newPin);
      return NextResponse.json({ success: true, newPin: updated.pin });
    }

    if (result.data.action === "invite_member") {
      await CareCircleRepository.addCircleMember(
        result.data.email,
        result.data.relationship
      );
      return NextResponse.json({ success: true, email: result.data.email });
    }

    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  } catch (error) {
    console.error("Care circle mutation error:", error);
    return NextResponse.json(
      { error: "Failed to update care circle." },
      { status: 500 }
    );
  }
}

