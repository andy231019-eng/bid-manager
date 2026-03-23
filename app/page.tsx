"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import NewProjectModal from "@/components/NewProjectModal";
import {
  Project,
  Task,
  formatDate,
  daysUntil,
  getFirstIncompleteTask,
  PHASE_COLORS,
} from "@/lib/types";

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

  type DashboardRow = {
    project: Project;
    currentTask: Task | undefined;
    daysLeft: number | null;
  };

  const rows: DashboardRow[] = projects
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

  function getRowClass(daysLeft: number | null): string {
    if (daysLeft === null) return "hover:bg-gray-50";
    if (daysLeft < 0) return "bg-red-50 hover:bg-red-100";
    if (daysLeft <= 7) return "bg-yellow-50 hover:bg-yellow-100";
    return "hover:bg-gray-50";
  }

  function getDaysLabel(daysLeft: number | null): React.ReactNode {
    if (daysLeft === null)
      return <span className="text-gray-400 font-['DM_Mono',monospace]">—</span>;
    if (daysLeft < 0)
      return (
        <span className="font-['DM_Mono',monospace] text-red-600 font-semibold">
          逾期 {Math.abs(daysLeft)} 天
        </span>
      );
    if (daysLeft === 0)
      return (
        <span className="font-['DM_Mono',monospace] text-orange-600 font-semibold">
          今天
        </span>
      );
    return (
      <span
        className={`font-['DM_Mono',monospace] ${
          daysLeft <= 7 ? "text-yellow-700 font-semibold" : "text-gray-700"
        }`}
      >
        {daysLeft} 天
      </span>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-['Epilogue',sans-serif] tracking-tight">
              投標案件管理
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Bid Manager Dashboard</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            新增案件
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "全部案件",
                value: projects.length,
                color: "text-gray-900",
              },
              {
                label: "逾期案件",
                value: rows.filter(
                  (r) => r.daysLeft !== null && r.daysLeft < 0
                ).length,
                color: "text-red-600",
              },
              {
                label: "7天內到期",
                value: rows.filter(
                  (r) =>
                    r.daysLeft !== null &&
                    r.daysLeft >= 0 &&
                    r.daysLeft <= 7
                ).length,
                color: "text-yellow-600",
              },
              {
                label: "已完成所有任務",
                value: rows.filter((r) => r.daysLeft === null).length,
                color: "text-green-600",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl border border-gray-100 px-5 py-4 shadow-sm"
              >
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p
                  className={`text-2xl font-bold font-['DM_Mono',monospace] mt-1 ${stat.color}`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500 font-medium">尚無案件</p>
              <p className="text-gray-400 text-sm mt-1">
                點擊右上角「新增案件」開始
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      "案件編號",
                      "案件名稱",
                      "目前階段",
                      "目前流程",
                      "截止日",
                      "剩餘天數",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map(({ project, currentTask, daysLeft }) => (
                    <tr
                      key={project.id}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className={`cursor-pointer transition-colors ${getRowClass(
                        daysLeft
                      )}`}
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-['DM_Mono',monospace] text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">
                          {project.code}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-gray-900 max-w-xs truncate">
                        {project.name}
                      </td>
                      <td className="px-4 py-3.5">
                        {currentTask ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              PHASE_COLORS[currentTask.phaseKey] ??
                              "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {currentTask.phase}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            全部完成
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-gray-700">
                        {currentTask?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3.5 font-['DM_Mono',monospace] text-gray-600">
                        {currentTask ? formatDate(currentTask.due) : "—"}
                      </td>
                      <td className="px-4 py-3.5">{getDaysLabel(daysLeft)}</td>
                    </tr>
                  ))}
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
