import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { tasks: { orderBy: { due: "asc" } } },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, deadline } = body as { name?: string; deadline?: string };

    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { tasks: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const newDeadline = deadline ? new Date(deadline) : project.deadline;
    const oldDeadline = project.deadline;
    const deadlineChanged =
      newDeadline.getTime() !== oldDeadline.getTime();

    // Build transaction operations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops: any[] = [];

    if (deadlineChanged) {
      for (const task of project.tasks) {
        const offsetMs = task.due.getTime() - oldDeadline.getTime();
        const offsetDays = Math.round(offsetMs / (1000 * 60 * 60 * 24));
        const newDue = new Date(newDeadline);
        newDue.setDate(newDeadline.getDate() + offsetDays);

        ops.push(
          prisma.task.update({
            where: { id: task.id },
            data: { due: newDue },
          })
        );
      }
    }

    ops.push(
      prisma.project.update({
        where: { id: params.id },
        data: {
          ...(name !== undefined && { name }),
          ...(deadlineChanged && { deadline: newDeadline }),
        },
      })
    );

    await prisma.$transaction(ops);

    const updated = await prisma.project.findUnique({
      where: { id: params.id },
      include: { tasks: { orderBy: { due: "asc" } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Tasks are deleted automatically via ON DELETE CASCADE defined in the schema
    await prisma.project.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
