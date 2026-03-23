export type Task = {
  id: string;
  projectId: string;
  phase: string;
  phaseKey: string;
  name: string;
  due: string;
  done: boolean;
  completedAt: string | null;
  note: string;
  createdAt: string;
};

export type Project = {
  id: string;
  code: string;
  name: string;
  deadline: string;
  createdAt: string;
  tasks: Task[];
};

// Helper: parse a date and return its "sv-SE" string in Asia/Taipei timezone
// "sv-SE" gives consistent "YYYY-MM-DD HH:MM:SS" format regardless of environment
function toTaipeiString(date: string | Date): string {
  return new Date(date).toLocaleString("sv-SE", { timeZone: "Asia/Taipei" });
}

export function formatDate(date: string | Date): string {
  const [datePart] = toTaipeiString(date).split(" ");
  const [y, m, d] = datePart.split("-");
  return `${y}/${m}/${d}`;
}

export function formatDateTime(date: string | Date): string {
  const [datePart, timePart] = toTaipeiString(date).split(" ");
  const [y, m, d] = datePart.split("-");
  const [h, min] = timePart.split(":");
  return `${y}/${m}/${d} ${h}:${min}`;
}

export function daysUntil(date: string | Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getFirstIncompleteTask(tasks: Task[]): Task | undefined {
  return tasks.find((t) => !t.done);
}

// Get current time as a UTC ISO string (valid for Prisma/DB storage)
export function nowTaiwan(): string {
  return new Date().toISOString();
}

// Phase styles — all classes are static strings so Tailwind won't purge them
export type PhaseStyle = {
  badge: string;
  headerBg: string;
  dot: string;
  label: string;
};

export const PHASE_STYLES: Record<string, PhaseStyle> = {
  eval: {
    badge:
      "bg-[#f0f4fc] text-[#2060c0] border border-[#b8ccec]",
    headerBg: "bg-[#f0f4fc] border-l-[3px] border-l-[#2060c0]",
    dot: "bg-[#2060c0]",
    label: "text-[#2060c0]",
  },
  prep: {
    badge:
      "bg-[#f4f0fc] text-[#7040c0] border border-[#c4b0ec]",
    headerBg: "bg-[#f4f0fc] border-l-[3px] border-l-[#7040c0]",
    dot: "bg-[#7040c0]",
    label: "text-[#7040c0]",
  },
  bid: {
    badge:
      "bg-[#fffbea] text-[#a07800] border border-[#ddc860]",
    headerBg: "bg-[#fffbea] border-l-[3px] border-l-[#a07800]",
    dot: "bg-[#a07800]",
    label: "text-[#a07800]",
  },
};
