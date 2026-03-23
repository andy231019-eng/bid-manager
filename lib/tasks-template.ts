export type TaskTemplate = {
  phase: string;
  phaseKey: string;
  name: string;
  offsetDays: number; // relative to deadline (T). Negative = before, 0 = on day, positive = after
};

export const TASK_TEMPLATES: TaskTemplate[] = [
  // 評估階段
  { phase: "評估階段", phaseKey: "eval", name: "確認標案資訊", offsetDays: -45 },
  { phase: "評估階段", phaseKey: "eval", name: "JV夥伴選擇", offsetDays: -40 },
  { phase: "評估階段", phaseKey: "eval", name: "資格審查完成", offsetDays: -30 },
  // 準備階段
  { phase: "準備階段", phaseKey: "prep", name: "成立備標小組", offsetDays: -28 },
  { phase: "準備階段", phaseKey: "prep", name: "備標作業", offsetDays: -25 },
  { phase: "準備階段", phaseKey: "prep", name: "是否競標決策", offsetDays: -14 },
  { phase: "準備階段", phaseKey: "prep", name: "JV/分包協議簽署", offsetDays: -3 },
  // 投標與後續
  { phase: "投標與後續", phaseKey: "bid", name: "投標", offsetDays: 0 },
  { phase: "投標與後續", phaseKey: "bid", name: "得標結果確認", offsetDays: 7 },
];

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
