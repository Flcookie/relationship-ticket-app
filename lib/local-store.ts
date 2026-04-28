import type { AppreciationCategory } from "@/types/appreciation";
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

export const appreciationCategoryLabel: Record<AppreciationCategory, string> =
  {
    care: "体贴",
    support: "支持",
    romance: "浪漫",
    growth: "一起成长",
    daily: "日常",
  };

export const appreciationCategoryTone: Record<AppreciationCategory, string> = {
  care: "bg-rose-50 text-rose-800 ring-1 ring-rose-200",
  support: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  romance: "bg-fuchsia-50 text-fuchsia-800 ring-1 ring-fuchsia-200",
  growth: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  daily: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
};

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
