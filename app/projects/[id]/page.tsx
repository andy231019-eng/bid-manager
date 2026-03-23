"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import EditProjectModal from "@/components/EditProjectModal";
import {
  Project,
  Task,
  formatDate,
  formatDateTime,
  formatOffset,
  daysUntil,
  PHASE_STYLES,
  nowTaiwan,
} from "@/lib/types";

type Props = { params: { id: string } };

type GroupedTasks = { phase: string; phaseKey: string; tasks: Task[] };

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

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path
        d="M9.5 1.5l2 2-7 7H2.5v-2l7-7z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProjectDetail({ params }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingOffset, setEditingOffset] = useState<{ taskId: string; value: string } | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.push("/");
    } catch {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) throw new Error();
      setProject(await res.json());
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

    setProject((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === task.id ? { ...t, done: newDone, completedAt: newCompletedAt } : t
            ),
          }
        : prev
    );

    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: newDone, completedAt: newCompletedAt }),
    });
  }

  function handleNoteChange(taskId: string, value: string) {
    setProject((prev) =>
      prev
        ? { ...prev, tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, note: value } : t)) }
        : prev
    );
  }

  function handleNoteBlur(task: Task) {
    fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: task.note }),
    });
  }

  async function handleOffsetBlur(task: Task, raw: string) {
    setEditingOffset(null);
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed === task.offset) return;

    // Optimistically update offset and due in local state
    const deadline = new Date(project!.deadline);
    const newDue = new Date(deadline);
    newDue.setDate(deadline.getDate() + parsed);

    setProject((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((t) =>
              t.id === task.id
                ? { ...t, offset: parsed, due: newDue.toISOString() }
                : t
            ),
          }
        : prev
    );

    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offset: parsed }),
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f4f0" }}>
        <div
          className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#d8d5cc", borderTopColor: "#1a1916" }}
        />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f4f0" }}>
        <div className="text-center">
          <p style={{ color: "#6b6860" }}>{error || "找不到案件"}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-3 text-sm underline"
            style={{ color: "#1a1916" }}
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

  return (
    <div className="min-h-screen" style={{ background: "#f5f4f0" }}>
      <AppHeader
        right={
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-lg transition hover:bg-[#f5f4f0]"
            style={{ color: "#6b6860", border: "1px solid #d8d5cc" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Project hero card */}
        <div
          className="rounded-xl px-6 py-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
          style={{ background: "#fff", border: "1px solid #d8d5cc" }}
        >
          {/* Left: project info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="font-dm-mono text-xs px-2 py-0.5 rounded"
                style={{
                  background: "#f5f4f0",
                  color: "#6b6860",
                  border: "1px solid #d8d5cc",
                }}
              >
                {project.code}
              </span>
              <span className="text-xs" style={{ color: "#a8a49a" }}>
                截標日：
                <span className="font-dm-mono">{formatDate(project.deadline)}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h1
                className="text-xl font-bold tracking-tight truncate"
                style={{ color: "#1a1916", fontFamily: "var(--font-epilogue)" }}
              >
                {project.name}
              </h1>
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition hover:bg-[#f5f4f0] flex-shrink-0"
                style={{ color: "#6b6860", border: "1px solid #d8d5cc" }}
                title="編輯案件"
              >
                <PencilIcon />
                編輯
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition flex-shrink-0"
                style={{
                  color: "#d64040",
                  border: "1px solid #d64040",
                  background: "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#fdf0f0")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                title="刪除案件"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1.5 3h9M4.5 3V2a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1m1.5 0l-.5 7a.5.5 0 01-.5.5h-5a.5.5 0 01-.5-.5L3 3"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                刪除
              </button>
            </div>
          </div>

          {/* Right: progress */}
          <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium" style={{ color: "#6b6860" }}>
                任務完成率
              </span>
              <span
                className="text-3xl font-bold font-dm-mono leading-none"
                style={{ color: "#1a1916" }}
              >
                {progress}
                <span className="text-lg" style={{ color: "#a8a49a" }}>
                  %
                </span>
              </span>
              <span className="text-xs font-dm-mono" style={{ color: "#a8a49a" }}>
                {doneTasks}/{totalTasks}
              </span>
            </div>
            <div
              className="w-48 h-2 rounded-full overflow-hidden"
              style={{ background: "#f5f4f0", border: "1px solid #d8d5cc" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: progress === 100 ? "#2d8a50" : "#1a1916",
                }}
              />
            </div>
          </div>
        </div>

        {/* Task groups */}
        <div className="space-y-4">
          {grouped.map(({ phase, phaseKey, tasks }) => {
            const style = PHASE_STYLES[phaseKey];
            const doneCount = tasks.filter((t) => t.done).length;

            return (
              <div
                key={phaseKey}
                className="rounded-xl overflow-hidden"
                style={{ background: "#fff", border: "1px solid #d8d5cc" }}
              >
                {/* Phase header */}
                <div
                  className={`px-5 py-3 flex items-center justify-between ${style?.headerBg ?? ""}`}
                  style={!style ? { background: "#f5f4f0", borderLeft: "3px solid #d8d5cc" } : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style?.dot ?? "bg-[#d8d5cc]"}`}
                    />
                    <span
                      className={`text-sm font-semibold ${style?.label ?? ""}`}
                      style={!style ? { color: "#6b6860" } : undefined}
                    >
                      {phase}
                    </span>
                  </div>
                  <span className="text-xs font-dm-mono" style={{ color: "#a8a49a" }}>
                    {doneCount}/{tasks.length}
                  </span>
                </div>

                {/* Tasks table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f0ede8", background: "#faf9f7" }}>
                        {["完成", "流程", "負責人", "應收文件/資訊", "距截標日", "截止日", "完成時間", "備註"].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider"
                            style={{ color: "#a8a49a" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task, i) => {
                        const overdue = !task.done && daysUntil(task.due) < 0;
                        const days = daysUntil(task.due);

                        return (
                          <tr
                            key={task.id}
                            style={{
                              background: task.done ? "#fff" : overdue ? "#fdf0f0" : "#fff",
                              borderTop: i === 0 ? "none" : "1px solid #f0ede8",
                              opacity: task.done ? 0.5 : 1,
                            }}
                          >
                            {/* Checkbox */}
                            <td className="px-4 py-3.5 w-10">
                              <input
                                type="checkbox"
                                checked={task.done}
                                onChange={() => toggleDone(task)}
                                className="w-4 h-4 cursor-pointer rounded accent-black"
                                style={{ accentColor: "#1a1916" }}
                              />
                            </td>

                            {/* 流程 name */}
                            <td className="px-4 py-3.5">
                              <span className="font-semibold" style={{ color: "#1a1916" }}>
                                {task.name}
                              </span>
                            </td>

                            {/* Owner unit */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span className="text-xs" style={{ color: "#6b6860" }}>
                                {task.ownerUnit ?? "—"}
                              </span>
                            </td>

                            {/* Required docs */}
                            <td className="px-4 py-3.5 min-w-[160px]">
                              <span className="text-xs" style={{ color: "#6b6860" }}>
                                {task.requiredDocs ?? "—"}
                              </span>
                            </td>

                            {/* Offset */}
                            <td className="px-4 py-3.5 w-20">
                              {editingOffset?.taskId === task.id ? (
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingOffset.value}
                                  onChange={(e) => {
                                    // Allow leading minus and digits only
                                    if (/^-?\d*$/.test(e.target.value)) {
                                      setEditingOffset({ taskId: task.id, value: e.target.value });
                                    }
                                  }}
                                  onBlur={(e) => handleOffsetBlur(task, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") e.currentTarget.blur();
                                    if (e.key === "Escape") setEditingOffset(null);
                                  }}
                                  className="w-16 text-xs bg-transparent focus:outline-none font-dm-mono text-center"
                                  style={{
                                    color: "#1a1916",
                                    borderBottom: "1px dashed #1a1916",
                                    paddingBottom: "2px",
                                  }}
                                />
                              ) : (
                                <button
                                  onClick={() =>
                                    setEditingOffset({
                                      taskId: task.id,
                                      value: String(task.offset),
                                    })
                                  }
                                  className="font-dm-mono text-xs hover:underline text-left"
                                  style={{ color: "#a8a49a" }}
                                  title="點擊編輯偏移天數"
                                >
                                  {formatOffset(task.offset)}
                                </button>
                              )}
                            </td>

                            {/* Due date */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span
                                className="font-dm-mono text-sm"
                                style={{ color: overdue ? "#d64040" : "#6b6860" }}
                              >
                                {formatDate(task.due)}
                              </span>
                              {!task.done && (() => {
                                if (days < 0)
                                  return (
                                    <span
                                      className="ml-1.5 text-xs font-dm-mono"
                                      style={{ color: "#d64040" }}
                                    >
                                      逾期{Math.abs(days)}天
                                    </span>
                                  );
                                if (days <= 7)
                                  return (
                                    <span
                                      className="ml-1.5 text-xs font-dm-mono"
                                      style={{ color: "#a07800" }}
                                    >
                                      剩{days}天
                                    </span>
                                  );
                                return null;
                              })()}
                            </td>

                            {/* Completed at */}
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              <span
                                className="font-dm-mono text-xs"
                                style={{ color: "#a8a49a" }}
                              >
                                {task.completedAt ? formatDateTime(task.completedAt) : "—"}
                              </span>
                            </td>

                            {/* Note */}
                            <td className="px-4 py-3.5 min-w-[180px]">
                              <input
                                type="text"
                                value={task.note}
                                onChange={(e) => handleNoteChange(task.id, e.target.value)}
                                onBlur={() => handleNoteBlur(task)}
                                placeholder="新增備註…"
                                className="w-full text-sm bg-transparent focus:outline-none transition-colors"
                                style={{
                                  color: "#1a1916",
                                  borderBottom: "1px dashed #d8d5cc",
                                  paddingBottom: "2px",
                                }}
                                onFocus={(e) =>
                                  (e.target.style.borderBottomColor = "#1a1916")
                                }
                                onBlurCapture={(e) =>
                                  (e.target.style.borderBottomColor = "#d8d5cc")
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {showEdit && project && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            setProject(updated);
            setShowEdit(false);
          }}
        />
      )}

      {showDelete && project && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(26,25,22,0.45)" }}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            style={{ border: "1px solid #d8d5cc" }}
          >
            <div className="px-6 pt-6 pb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                style={{ background: "#fdf0f0" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 6v4m0 3h.01M3 9a6 6 0 1012 0A6 6 0 003 9z"
                    stroke="#d64040"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2
                className="text-base font-bold mb-1"
                style={{ color: "#1a1916", fontFamily: "var(--font-epilogue)" }}
              >
                確定要刪除此案件嗎？
              </h2>
              <p className="text-sm" style={{ color: "#6b6860" }}>
                「{project.name}」及其所有任務將被永久刪除，此操作無法復原。
              </p>
            </div>
            <div
              className="px-6 py-4 flex justify-end gap-2"
              style={{ borderTop: "1px solid #d8d5cc" }}
            >
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-lg transition hover:bg-[#f5f4f0]"
                style={{ color: "#6b6860", border: "1px solid #d8d5cc" }}
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-5 py-2 text-sm font-semibold rounded-lg transition hover:opacity-80 disabled:opacity-50"
                style={{ background: "#d64040", color: "#fff" }}
              >
                {deleting ? "刪除中…" : "確認刪除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
