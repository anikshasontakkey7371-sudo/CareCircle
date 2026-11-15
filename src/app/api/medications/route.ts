import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CareCircleRepository } from "@/lib/store";

const CreateMedicationSchema = z.object({
  elderlyUserId: z.string().optional(),
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  unit: z.string().default("Tablet"),
  instructions: z.string().default(""),
  doctorName: z.string().optional(),
  times: z.array(z.string()).min(1, "At least one scheduled time is required"),
  colorCode: z.string().default("#C85A32"),
  pillShape: z.enum(["round", "oval", "capsule", "liquid", "tablet"]).default("tablet"),
  currentStock: z.number().int().nonnegative().default(30),
  refillAlertThreshold: z.number().int().nonnegative().default(7),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const elderlyUserId = searchParams.get("elderlyUserId") || undefined;
    const medications = await CareCircleRepository.getMedications(elderlyUserId);
    return NextResponse.json({ medications });
  } catch (error) {
    console.error("Fetch medications error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve medications." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CreateMedicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }

    const saved = await CareCircleRepository.saveMedication(result.data);
    return NextResponse.json({ medication: saved }, { status: 201 });
  } catch (error) {
    console.error("Create medication error:", error);
    return NextResponse.json(
      { error: "Failed to create medication." },
      { status: 500 }
    );
  }
}

