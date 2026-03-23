"use client";

import { useState } from "react";
import { Project } from "@/lib/types";

type Props = {
  project: Project;
  onClose: () => void;
  onSaved: (project: Project) => void;
};

function toDateInputValue(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function EditProjectModal({ project, onClose, onSaved }: Props) {
  const [name, setName] = useState(project.name);
  const [deadline, setDeadline] = useState(toDateInputValue(project.deadline));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const deadlineChanged = deadline !== toDateInputValue(project.deadline);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !deadline) {
      setError("請填寫所有欄位");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), deadline }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      onSaved(updated);
    } catch {
      setError("儲存失敗，請再試一次");
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
              編輯案件
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#6b6860" }}>
              {project.code}
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
              className="w-full px-3 py-2.5 rounded-lg text-sm transition focus:outline-none"
              style={{
                border: "1px solid #d8d5cc",
                color: "#1a1916",
                background: "#fff",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1a1916")}
              onBlur={(e) => (e.target.style.borderColor = "#d8d5cc")}
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
              onFocus={(e) => (e.target.style.borderColor = "#1a1916")}
              onBlur={(e) => (e.target.style.borderColor = "#d8d5cc")}
            />
          </div>

          {/* Deadline change notice */}
          {deadlineChanged && (
            <div
              className="rounded-lg px-3 py-2.5 flex gap-2 items-start"
              style={{ background: "#fffbea", border: "1px solid #ddc860" }}
            >
              <svg
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 16 16"
                style={{ color: "#a07800" }}
              >
                <path
                  d="M8 2a6 6 0 100 12A6 6 0 008 2zm0 3.5v3m0 2.5h.01"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-xs" style={{ color: "#a07800" }}>
                截標日變更後，所有任務截止日將依原始偏移量自動重新計算。
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p
              className="text-xs rounded-lg px-3 py-2"
              style={{ color: "#d64040", background: "#fdf0f0" }}
            >
              {error}
            </p>
          )}
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
            {loading ? "儲存中…" : "儲存變更"}
          </button>
        </div>
      </div>
    </div>
  );
}
