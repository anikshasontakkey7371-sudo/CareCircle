import { NextRequest, NextResponse } from "next/server";
import { CareCircleRepository } from "@/lib/store";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await CareCircleRepository.saveMedication({ ...body, id });
    return NextResponse.json({ medication: updated });
  } catch (error) {
    console.error("Update medication error:", error);
    return NextResponse.json(
      { error: "Failed to update medication." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await CareCircleRepository.deleteMedication(id);
    if (!success) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete medication error:", error);
    return NextResponse.json(
      { error: "Failed to delete medication." },
      { status: 500 }
    );
  }
}
