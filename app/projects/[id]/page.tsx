"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Project,
  Task,
  formatDate,
  formatDateTime,
  daysUntil,
  PHASE_COLORS,
  PHASE_HEADER_COLORS,
  nowTaiwan,
} from "@/lib/types";

type Props = {
  params: { id: string };
};

type GroupedTasks = {
  phase: string;
  phaseKey: string;
  tasks: Task[];
};

function groupTasksByPhase(tasks: Task[]): GroupedTasks[] {
  const map = new Map<string, GroupedTasks>();
  for (const task of tasks) {
    if (!map.has(task.phaseKey)) {
      map.set(task.phaseKey, { phase: task.phase, phaseKey: task.phaseKey, tasks: [] });
    }
    map.get(task.phaseKey)!.tasks.push(task);
  }
  return Array.from(map.values());
}

export default function ProjectDetail({ params }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const noteTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setProject(data);
    } catch {
      setError("找不到此案件");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  async function toggleDone(task: Task) {
    const newDone = !task.done;
    const newCompletedAt = newDone ? nowTaiwan() : null;

    // Optimistic update
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === task.id ? { ...t, done: newDone, completedAt: newCompletedAt } : t
        ),
      };
    });

    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: newDone, completedAt: newCompletedAt }),
    });
  }

  function handleNoteChange(taskId: string, value: string) {
    setProject((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, note: value } : t)),
      };
    });
  }

  function handleNoteBlur(task: Task) {
    clearTimeout(noteTimers.current[task.id]);
    fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: task.note }),
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">{error || "找不到案件"}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 text-blue-600 hover:underline text-sm"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter((t) => t.done).length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const grouped = groupTasksByPhase(project.tasks);

  function getTaskRowClass(task: Task): string {
    if (task.done) return "opacity-50 bg-gray-50";
    const days = daysUntil(task.due);
    if (days < 0) return "bg-red-50";
    return "";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition mb-3"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-['DM_Mono',monospace] text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                  {project.code}
                </span>
                <span className="text-xs text-gray-400 font-['DM_Mono',monospace]">
                  截標日：{formatDate(project.deadline)}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 font-['Epilogue',sans-serif]">
                {project.name}
              </h1>
            </div>

            {/* Progress */}
            <div className="flex flex-col items-end gap-1 min-w-[180px]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">任務完成率</span>
                <span className="font-['DM_Mono',monospace] font-bold text-blue-600">
                  {progress}%
                </span>
                <span className="text-xs text-gray-400 font-['DM_Mono',monospace]">
                  ({doneTasks}/{totalTasks})
                </span>
              </div>
              <div className="w-full sm:w-44 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6">
          {grouped.map(({ phase, phaseKey, tasks }) => (
            <div key={phaseKey} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Phase header */}
              <div className={`px-5 py-3 ${PHASE_HEADER_COLORS[phaseKey] ?? "bg-gray-50 border-l-4 border-gray-300 text-gray-700"}`}>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      PHASE_COLORS[phaseKey] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {phase}
                  </span>
                  <span className="text-sm text-gray-500">
                    {tasks.filter((t) => t.done).length}/{tasks.length} 完成
                  </span>
                </div>
              </div>

              {/* Tasks table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/50">
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-8">
                        完成
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        流程
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        截止日
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        完成時間
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        備註
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tasks.map((task) => (
                      <tr key={task.id} className={`transition-colors ${getTaskRowClass(task)}`}>
                        <td className="px-4 py-3.5">
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => toggleDone(task)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-4 py-3.5 font-medium text-gray-800">
                          {task.name}
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`font-['DM_Mono',monospace] text-sm ${
                              !task.done && daysUntil(task.due) < 0
                                ? "text-red-600 font-semibold"
                                : "text-gray-600"
                            }`}
                          >
                            {formatDate(task.due)}
                          </span>
                          {!task.done && (() => {
                            const d = daysUntil(task.due);
                            if (d < 0) return <span className="ml-2 text-xs text-red-500">逾期{Math.abs(d)}天</span>;
                            if (d <= 7) return <span className="ml-2 text-xs text-yellow-600">剩{d}天</span>;
                            return null;
                          })()}
                        </td>
                        <td className="px-4 py-3.5 font-['DM_Mono',monospace] text-gray-500 text-xs">
                          {task.completedAt ? formatDateTime(task.completedAt) : "—"}
                        </td>
                        <td className="px-4 py-3.5 min-w-[180px]">
                          <input
                            type="text"
                            value={task.note}
                            onChange={(e) => handleNoteChange(task.id, e.target.value)}
                            onBlur={() => handleNoteBlur(task)}
                            placeholder="新增備註..."
                            className="w-full text-sm text-gray-700 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none transition py-0.5 placeholder-gray-300"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
