export type TaskTemplate = {
  phase: string;
  phaseKey: string;
  name: string;
  offsetDays: number; // relative to deadline (T). Negative = before, 0 = on day, positive = after
  ownerUnit: string;
  requiredDocs: string;
};

export const TASK_TEMPLATES: TaskTemplate[] = [
  // 評估階段
  { phase: "評估階段", phaseKey: "eval", name: "案件資訊取得", offsetDays: -45, ownerUnit: "業務", requiredDocs: "招標公告、初評資訊" },
  { phase: "評估階段", phaseKey: "eval", name: "第一次評估", offsetDays: -42, ownerUnit: "業務主管", requiredDocs: "評估意見" },
  { phase: "評估階段", phaseKey: "eval", name: "案件建檔", offsetDays: -35, ownerUnit: "業務", requiredDocs: "專案資料" },
  { phase: "評估階段", phaseKey: "eval", name: "資格審查", offsetDays: -30, ownerUnit: "業務/法務", requiredDocs: "Check list" },
  // 準備階段
  { phase: "準備階段", phaseKey: "prep", name: "成立備標小組", offsetDays: -28, ownerUnit: "總經/董事長", requiredDocs: "成員名單" },
  { phase: "準備階段", phaseKey: "prep", name: "備標會議", offsetDays: -21, ownerUnit: "備標小組", requiredDocs: "招標文件、紀錄" },
  { phase: "準備階段", phaseKey: "prep", name: "預算估價", offsetDays: -17, ownerUnit: "備標小組/工務", requiredDocs: "成本預算、報價單" },
  { phase: "準備階段", phaseKey: "prep", name: "投標決策", offsetDays: -14, ownerUnit: "總經/董事長", requiredDocs: "附件二：可行性評估" },
  { phase: "準備階段", phaseKey: "prep", name: "投標文件編製", offsetDays: -7, ownerUnit: "備標小組", requiredDocs: "服務建議書、投標函" },
  // 投標與後續
  { phase: "投標與後續", phaseKey: "bid", name: "投標", offsetDays: 0, ownerUnit: "業務/法務", requiredDocs: "遞送回條" },
  { phase: "投標與後續", phaseKey: "bid", name: "開標", offsetDays: 3, ownerUnit: "業務/法務", requiredDocs: "開標記錄" },
  { phase: "投標與後續", phaseKey: "bid", name: "決標後續", offsetDays: 14, ownerUnit: "備標小組", requiredDocs: "簽約資料/檢討報告" },
];

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
