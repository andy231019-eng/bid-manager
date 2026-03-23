import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { done, completedAt, note, offset } = body;

    const updateData: Record<string, unknown> = {};

    if (typeof done !== "undefined") updateData.done = done;
    if (typeof completedAt !== "undefined")
      updateData.completedAt = completedAt ? new Date(completedAt) : null;
    if (typeof note !== "undefined") updateData.note = note;

    // When offset changes, recalculate due from the project's deadline
    if (typeof offset !== "undefined") {
      const task = await prisma.task.findUnique({
        where: { id: params.id },
        include: { project: { select: { deadline: true } } },
      });

      if (!task) {
        return NextResponse.json({ error: "Task not found" }, { status: 404 });
      }

      const deadline = task.project.deadline;
      const newDue = new Date(deadline);
      newDue.setDate(deadline.getDate() + Number(offset));

      updateData.offset = Number(offset);
      updateData.due = newDue;
    }

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
