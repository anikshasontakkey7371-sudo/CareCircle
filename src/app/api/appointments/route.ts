import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CareCircleRepository } from "@/lib/store";

const CreateAppointmentSchema = z.object({
  elderlyUserId: z.string().optional(),
  title: z.string().min(1, "Appointment title is required"),
  doctorName: z.string().min(1, "Doctor or specialist name is required"),
  clinicAddress: z.string().default(""),
  dateTime: z.string().min(1, "Date and time is required"),
  transportationRequired: z.boolean().default(false),
  accompaniedBy: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const elderlyUserId = searchParams.get("elderlyUserId") || undefined;
    const appointments = await CareCircleRepository.getAppointments(elderlyUserId);

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Fetch appointments error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve appointments." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CreateAppointmentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const saved = await CareCircleRepository.saveAppointment(result.data);
    return NextResponse.json({ appointment: saved }, { status: 201 });
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { error: "Failed to create appointment." },
      { status: 500 }
    );
  }
}
