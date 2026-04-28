"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { appreciationCategoryLabel, getUserLabel } from "@/lib/local-store";
import {
  createAppreciation,
  getMyCouple,
  getPartnerUserId,
  requireCurrentUserId,
} from "@/lib/supabase-store";
import { showToast } from "@/lib/toast";
import type { AppreciationCategory } from "@/types/appreciation";

const categories = Object.entries(appreciationCategoryLabel) as Array<
  [AppreciationCategory, string]
>;

export default function NewAppreciationPage() {
  const router = useRouter();
  const [partnerLabel, setPartnerLabel] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<AppreciationCategory>("daily");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;
    const boot = async () => {
      try {
        const uid = await requireCurrentUserId();
        const c = await getMyCouple();
        const partnerId = getPartnerUserId(c, uid);
        if (!mounted) return;
        setPartnerLabel(getUserLabel(partnerId, c));
      } catch (e) {
        if (!mounted) return;
        setLoadError(
          e instanceof Error ? e.message : "无法加载情侣关系，请先完成配对。",
        );
      }
    };
    void boot();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("请填写标题和具体内容。");
      showToast({ message: "请先补全标题和内容", kind: "error" });
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await createAppreciation({
        title: title.trim(),
        content: content.trim(),
        category,
      });
      showToast({ message: "已记下这一瞬间 ✓", kind: "success" });
      router.push("/appreciations");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "保存失败，请稍后再试。"
      );
      showToast({ message: "保存失败", kind: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        {loadError}
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-indigo-950">
          记一条暖心瞬间
        </h1>
        <p className="text-sm text-slate-500">
          写给 TA：{partnerLabel || "加载中…"}
        </p>
      </div>

      <div className="soft-card rounded-2xl p-4 text-sm text-indigo-900">
        可以是小事一句谢谢、一件让你安心的举动，重点是真诚，不是写得很长。
      </div>

      <form
        onSubmit={handleSubmit}
        className="soft-card space-y-4 rounded-3xl p-5"
      >
        <div className="space-y-1">
          <label htmlFor="apm-title" className="text-sm font-medium">
            标题
          </label>
          <input
            id="apm-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：今天你主动帮我倒水"
            className="w-full rounded-xl border border-indigo-200/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="apm-content" className="text-sm font-medium">
            具体内容
          </label>
          <textarea
            id="apm-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            placeholder="写写当时发生了什么，你的感受…"
            className="w-full rounded-xl border border-indigo-200/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="apm-category" className="text-sm font-medium">
            分类
          </label>
          <select
            id="apm-category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as AppreciationCategory)
            }
            className="w-full rounded-xl border border-indigo-200/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3">
            <span className="text-rose-500">⚠</span>
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-md shadow-indigo-300 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? "保存中…" : "发布"}
        </button>
      </form>
    </section>
  );
}
