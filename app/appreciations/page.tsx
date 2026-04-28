"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  appreciationCategoryLabel,
  appreciationCategoryTone,
  formatDateTime,
  getUserLabel,
} from "@/lib/local-store";
import { listAppreciations } from "@/lib/supabase-store";
import type {
  Appreciation,
  AppreciationCategory,
} from "@/types/appreciation";
import type { Couple } from "@/types/ticket";

type Filter = "all" | AppreciationCategory;

const filters: Filter[] = [
  "all",
  "care",
  "support",
  "romance",
  "growth",
  "daily",
];

const filterNavLabel: Record<Filter, string> = {
  all: "全部",
  ...appreciationCategoryLabel,
};

export default function AppreciationsPage() {
  const [items, setItems] = useState<Appreciation[]>([]);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await listAppreciations({ category: "all" });
        if (!cancelled) {
          setItems(result.items);
          setCouple(result.couple);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "加载失败，请检查网络或 Supabase 权限（RLS）设置。",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onFilterChange = (f: Filter) => {
    setFilter(f);
    void (async () => {
      setIsLoading(true);
      setError("");
      try {
        const result = await listAppreciations({ category: f });
        setItems(result.items);
        setCouple(result.couple);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "加载失败，请检查网络或 Supabase 权限（RLS）设置。",
        );
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-indigo-950">暖心瞬间</h1>
          <p className="text-sm text-slate-500">
            记录谢谢你们在一起的时刻，和「待解决事项」分开，只装好的回忆。
          </p>
        </div>
        <Link
          href="/appreciations/new"
          className="shrink-0 self-start rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-indigo-300 transition hover:-translate-y-0.5 hover:shadow-lg sm:self-center"
        >
          记一条瞬间
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const active = filter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white/70 text-slate-600 ring-1 ring-indigo-100"
              }`}
            >
              {filterNavLabel[f]}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="soft-card rounded-3xl border border-dashed p-10 text-center text-sm text-slate-500">
          正在加载…
        </div>
      ) : items.length === 0 ? (
        <div className="soft-card rounded-3xl border border-dashed p-10 text-center text-sm text-slate-500">
          <div className="mb-2 text-3xl">✨</div>
          <p className="mb-4">还没有记录，随时写一条吧。</p>
          <Link
            href="/appreciations/new"
            className="inline-flex rounded-full border border-indigo-200 bg-white px-4 py-2 text-xs text-indigo-700 hover:bg-indigo-50"
          >
            记第一条暖心瞬间
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((row) => (
            <li key={row.id}>
              <article className="block rounded-2xl border border-indigo-100/80 bg-white/72 p-4 shadow-[0_3px_10px_rgba(99,102,241,0.08)]">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-medium text-slate-800">{row.title}</h2>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${appreciationCategoryTone[row.category]}`}
                  >
                    {appreciationCategoryLabel[row.category]}
                  </span>
                </div>
                <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                  {row.content}
                </p>
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span>
                    {getUserLabel(row.fromUserId, couple)} →{" "}
                    {getUserLabel(row.toUserId, couple)}
                  </span>
                  <span>·</span>
                  <span>{formatDateTime(row.createdAt)}</span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
