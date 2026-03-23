import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TASK_TEMPLATES, addDays } from "@/lib/tasks-template";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { tasks: { orderBy: { due: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, deadline } = body;

    if (!name || !deadline) {
      return NextResponse.json({ error: "name and deadline are required" }, { status: 400 });
    }

    const deadlineDate = new Date(deadline);

    // Generate next code — use max existing number to stay correct after deletions
    const existing = await prisma.project.findMany({ select: { code: true } });
    const maxNum = existing.reduce((max, p) => {
      const n = parseInt(p.code.replace("BID-", ""), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const code = `BID-${String(maxNum + 1).padStart(3, "0")}`;

    const project = await prisma.project.create({
      data: {
        code,
        name,
        deadline: deadlineDate,
        tasks: {
          create: TASK_TEMPLATES.map((t) => ({
            phase: t.phase,
            phaseKey: t.phaseKey,
            name: t.name,
            offset: t.offsetDays,
            due: addDays(deadlineDate, t.offsetDays),
            ownerUnit: t.ownerUnit,
            requiredDocs: t.requiredDocs,
          })),
        },
      },
      include: { tasks: { orderBy: { due: "asc" } } },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
