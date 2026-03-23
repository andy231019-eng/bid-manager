"use client";

import { useState } from "react";
import { Project } from "@/lib/types";

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
      if (!res.ok) throw new Error("建立失敗");
      const project = await res.json();
      onCreated(project);
    } catch {
      setError("建立失敗，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 font-['Epilogue',sans-serif]">
            新增投標案件
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">填寫基本資訊後自動產生任務時程</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              案件名稱
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：台北市政府資訊系統採購案"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              最終截標日
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-['DM_Mono',monospace]"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 font-medium mb-1">將自動建立以下任務</p>
            <div className="flex flex-wrap gap-1.5">
              {["T-45 確認標案資訊", "T-40 JV夥伴選擇", "T-30 資格審查完成", "T-28 成立備標小組", "T-14 是否競標決策", "T+0 投標", "T+7 得標結果確認"].map((t) => (
                <span key={t} className="text-xs bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-600">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </form>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            取消
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {loading ? "建立中..." : "建立案件"}
          </button>
        </div>
      </div>
    </div>
  );
}
