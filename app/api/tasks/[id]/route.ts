import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { done, completedAt, note } = body;

    const updateData: Record<string, unknown> = {};
    if (typeof done !== "undefined") updateData.done = done;
    if (typeof completedAt !== "undefined") updateData.completedAt = completedAt ? new Date(completedAt) : null;
    if (typeof note !== "undefined") updateData.note = note;

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
