"use client";

import { useState } from "react";
import { Project, formatOffset } from "@/lib/types";
import { TASK_TEMPLATES } from "@/lib/tasks-template";

type Props = {
  onClose: () => void;
  onCreated: (project: Project) => void;
};

export default function NewProjectModal({ onClose, onCreated }: Props) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !deadline) {
      setError("請填寫所有欄位");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), deadline }),
      });
      if (!res.ok) throw new Error();
      const project = await res.json();
      onCreated(project);
    } catch {
      setError("建立失敗，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(26,25,22,0.45)" }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        style={{ border: "1px solid #d8d5cc" }}
      >
        {/* Modal header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid #d8d5cc" }}
        >
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: "#1a1916", fontFamily: "var(--font-epilogue)" }}
            >
              新增投標案件
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#6b6860" }}>
              填寫基本資訊後自動產生 {TASK_TEMPLATES.length} 個 SOP 任務時程
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-[#f5f4f0] transition"
            style={{ color: "#a8a49a" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: "#6b6860" }}
            >
              案件名稱
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：台北市政府資訊系統採購案"
              className="w-full px-3 py-2.5 rounded-lg text-sm transition focus:outline-none"
              style={{
                border: "1px solid #d8d5cc",
                color: "#1a1916",
                background: "#fff",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "#1a1916")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "#d8d5cc")
              }
            />
          </div>

          {/* Deadline */}
          <div>
            <label
              className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
              style={{ color: "#6b6860" }}
            >
              最終截標日
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm transition focus:outline-none font-dm-mono"
              style={{
                border: "1px solid #d8d5cc",
                color: "#1a1916",
                background: "#fff",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "#1a1916")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "#d8d5cc")
              }
            />
          </div>

          {/* Error */}
          {error && (
            <p
              className="text-xs rounded-lg px-3 py-2"
              style={{ color: "#d64040", background: "#fdf0f0" }}
            >
              {error}
            </p>
          )}

          {/* Task hint */}
          <div
            className="rounded-lg p-3"
            style={{ background: "#f5f4f0", border: "1px solid #d8d5cc" }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: "#6b6860" }}>
              將自動建立以下任務
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TASK_TEMPLATES.map((t) => (
                <span
                  key={t.name}
                  className="text-xs px-2 py-0.5 rounded font-dm-mono"
                  style={{
                    background: "#fff",
                    border: "1px solid #d8d5cc",
                    color: "#6b6860",
                  }}
                >
                  {formatOffset(t.offsetDays)} {t.name}
                </span>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end gap-2"
          style={{ borderTop: "1px solid #d8d5cc" }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg transition hover:bg-[#f5f4f0]"
            style={{ color: "#6b6860", border: "1px solid #d8d5cc" }}
          >
            取消
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold rounded-lg transition hover:opacity-80 disabled:opacity-50"
            style={{ background: "#1a1916", color: "#fff" }}
          >
            {loading ? "建立中…" : "建立案件"}
          </button>
        </div>
      </div>
    </div>
  );
}
