import type { Couple, Severity, UserId } from "@/types/ticket";

export const severityLabel: Record<Severity, string> = {
  minor: "轻微",
  medium: "适中",
  serious: "严重",
};

export const severityTone: Record<Severity, string> = {
  minor: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200",
  medium: "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
  serious: "bg-rose-100 text-rose-700 ring-1 ring-rose-200",
};

export const statusLabel = {
  open: "待解决",
  in_progress: "沟通中",
  completed: "已完成",
} as const;

export const resolutionLabel = {
  today: "今天",
  this_week: "本周",
  not_urgent: "不急",
} as const;

export function getUserLabel(userId: UserId, couple?: Couple | null) {
  if (!couple) {
    return userId.slice(0, 6);
  }
  if (userId === couple.userA) {
    return "小猪猪";
  }
  if (couple.userB && userId === couple.userB) {
    return "小兔兔";
  }
  return "未知成员";
}

export function formatDateTime(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("zh-CN", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
