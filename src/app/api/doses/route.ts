import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CareCircleRepository } from "@/lib/store";

const UpdateDoseSchema = z.object({
  logId: z.string().min(1, "Dose log ID is required"),
  status: z.enum(["taken", "skipped", "missed"]),
  loggedByRole: z.enum(["elderly", "caregiver"]).default("elderly"),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const elderlyUserId = searchParams.get("elderlyUserId") || undefined;
    const doses = await CareCircleRepository.getDosesForToday(elderlyUserId);
    const metrics = await CareCircleRepository.getAdherenceMetrics(elderlyUserId);

    return NextResponse.json({ doses, metrics });
  } catch (error) {
    console.error("Fetch doses error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve dose records." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = UpdateDoseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const { logId, status, loggedByRole } = result.data;
    const updatedDose = await CareCircleRepository.updateDoseStatus(
      logId,
      status,
      loggedByRole
    );

    if (!updatedDose) {
      return NextResponse.json({ error: "Dose record not found." }, { status: 404 });
    }

    const metrics = await CareCircleRepository.getAdherenceMetrics(
      updatedDose.elderlyUserId
    );

    return NextResponse.json({ dose: updatedDose, metrics });
  } catch (error) {
    console.error("Update dose error:", error);
    return NextResponse.json(
      { error: "Failed to update dose status." },
      { status: 500 }
    );
  }
}

