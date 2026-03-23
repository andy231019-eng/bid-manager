"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import NewProjectModal from "@/components/NewProjectModal";
import {
  Project,
  Task,
  formatDate,
  daysUntil,
  getFirstIncompleteTask,
  PHASE_STYLES,
} from "@/lib/types";

type Row = {
  project: Project;
  currentTask: Task | undefined;
  daysLeft: number | null;
};

function buildRows(projects: Project[]): Row[] {
  return projects
    .map((p) => {
      const currentTask = getFirstIncompleteTask(p.tasks);
      const daysLeft = currentTask ? daysUntil(currentTask.due) : null;
      return { project: p, currentTask, daysLeft };
    })
    .sort((a, b) => {
      if (a.daysLeft === null && b.daysLeft === null) return 0;
      if (a.daysLeft === null) return 1;
      if (b.daysLeft === null) return -1;
      return a.daysLeft - b.daysLeft;
    });
}

function DaysChip({ daysLeft }: { daysLeft: number | null }) {
  if (daysLeft === null) return null;

  if (daysLeft < 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-dm-mono"
        style={{ background: "#fdf0f0", color: "#d64040" }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#d64040" }} />
        逾期 {Math.abs(daysLeft)} 天
      </span>
    );
  }
  if (daysLeft === 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-dm-mono"
        style={{ background: "#fdf0f0", color: "#d64040" }}
      >
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#d64040" }} />
        今天截止
      </span>
    );
  }
  if (daysLeft <= 7) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold font-dm-mono"
        style={{ background: "#fffbea", color: "#a07800" }}
      >
        {daysLeft} 天
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium font-dm-mono"
      style={{ background: "#f5f4f0", color: "#6b6860" }}
    >
      {daysLeft} 天
    </span>
  );
}

function PhaseBadge({ phaseKey, phase }: { phaseKey: string; phase: string }) {
  const style = PHASE_STYLES[phaseKey];
  if (!style) {
    return (
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        style={{ background: "#f5f4f0", color: "#6b6860", border: "1px solid #d8d5cc" }}
      >
        {phase}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.badge}`}>
      {phase}
    </span>
  );
}

const STATS = (rows: Row[]) => [
  {
    label: "全部案件",
    value: rows.length,
    color: "#1a1916",
    bg: "#fff",
    border: "#d8d5cc",
  },
  {
    label: "進行中",
    value: rows.filter((r) => r.daysLeft !== null && r.daysLeft >= 0).length,
    color: "#a07800",
    bg: "#fffbea",
    border: "#ddc860",
  },
  {
    label: "逾期任務",
    value: rows.filter((r) => r.daysLeft !== null && r.daysLeft < 0).length,
    color: "#d64040",
    bg: "#fdf0f0",
    border: "#f0c0c0",
  },
  {
    label: "已完成",
    value: rows.filter((r) => r.daysLeft === null).length,
    color: "#2d8a50",
    bg: "#f0faf4",
    border: "#b0dcc0",
  },
];

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const rows = buildRows(projects);

  return (
    <div className="min-h-screen" style={{ background: "#f5f4f0" }}>
      <AppHeader
        right={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition hover:opacity-80"
            style={{ background: "#1a1916", color: "#fff" }}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            新增案件
          </button>
        }
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "#1a1916", fontFamily: "var(--font-epilogue)" }}
          >
            案件總覽
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6b6860" }}>
            共 {projects.length} 筆案件
          </p>
        </div>

        {/* Stat cards */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {STATS(rows).map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl px-5 py-4"
                style={{
                  background: stat.bg,
                  border: `1px solid ${stat.border}`,
                }}
              >
                <p className="text-xs font-medium" style={{ color: "#6b6860" }}>
                  {stat.label}
                </p>
                <p
                  className="text-3xl font-bold mt-1 font-dm-mono"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #d8d5cc" }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div
                className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#d8d5cc", borderTopColor: "#1a1916" }}
              />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-24">
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "#f5f4f0", border: "1px solid #d8d5cc" }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "#a8a49a" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: "#1a1916" }}>
                尚無案件
              </p>
              <p className="text-sm mt-1" style={{ color: "#a8a49a" }}>
                點擊右上角「新增案件」開始
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid #d8d5cc", background: "#f5f4f0" }}>
                    {["案件編號", "案件名稱", "目前階段", "目前流程", "截止日", "剩餘天數"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                          style={{ color: "#a8a49a" }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ project, currentTask, daysLeft }, i) => {
                    const isOverdue = daysLeft !== null && daysLeft < 0;
                    return (
                      <tr
                        key={project.id}
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="cursor-pointer transition-colors hover:brightness-[0.97]"
                        style={{
                          background: isOverdue ? "#fdf0f0" : "#fff",
                          borderTop: i === 0 ? "none" : "1px solid #f0ede8",
                        }}
                      >
                        <td className="px-4 py-3.5">
                          <span
                            className="font-dm-mono text-xs px-2 py-1 rounded"
                            style={{
                              background: "#f5f4f0",
                              color: "#6b6860",
                              border: "1px solid #d8d5cc",
                            }}
                          >
                            {project.code}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-semibold" style={{ color: "#1a1916" }}>
                            {project.name}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {currentTask ? (
                            <PhaseBadge
                              phaseKey={currentTask.phaseKey}
                              phase={currentTask.phase}
                            />
                          ) : (
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                background: "#f0faf4",
                                color: "#2d8a50",
                                border: "1px solid #b0dcc0",
                              }}
                            >
                              全部完成
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5" style={{ color: "#6b6860" }}>
                          {currentTask?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 font-dm-mono" style={{ color: "#6b6860" }}>
                          {currentTask ? formatDate(currentTask.due) : "—"}
                        </td>
                        <td className="px-4 py-3.5">
                          <DaysChip daysLeft={daysLeft} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(project) => {
            setProjects((prev) => [project, ...prev]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
