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

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}`;
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

export const PHASE_COLORS: Record<string, string> = {
  eval: "bg-blue-100 text-blue-700 border-blue-200",
  prep: "bg-purple-100 text-purple-700 border-purple-200",
  bid: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

export const PHASE_HEADER_COLORS: Record<string, string> = {
  eval: "bg-blue-50 border-l-4 border-blue-400 text-blue-800",
  prep: "bg-purple-50 border-l-4 border-purple-400 text-purple-800",
  bid: "bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800",
};

// Get Taiwan time now as ISO string
export function nowTaiwan(): string {
  return new Date().toLocaleString("sv-SE", { timeZone: "Asia/Taipei" }).replace(" ", "T") + ":00";
}
