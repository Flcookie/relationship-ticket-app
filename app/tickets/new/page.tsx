"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { resolutionLabel, severityLabel } from "@/lib/local-store";
import { createTicket } from "@/lib/supabase-store";
import { showToast } from "@/lib/toast";
import type { Severity } from "@/types/ticket";

export default function NewTicketPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [needOfflineTalk, setNeedOfflineTalk] = useState(false);
  const [expectedResolution, setExpectedResolution] = useState<
    "today" | "this_week" | "not_urgent"
  >("this_week");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await createTicket({
        title: title.trim(),
        content: content.trim(),
        severity,
        needOfflineTalk,
        expectedResolution,
      });
      showToast({ message: "事项已创建 ✓", kind: "success" });
      router.push("/");
    } catch {
      setError("创建失败，请稍后再试。");
      showToast({ message: "创建失败，请稍后重试", kind: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-indigo-950">发起沟通事项</h1>
        <p className="text-sm text-slate-500">聚焦事实、感受和期待，减少情绪对抗。</p>
      </div>

      <div className="soft-card rounded-2xl p-4 text-sm text-indigo-900">
        推荐写法：先描述事实，再说感受，最后写期待。这样更容易解决问题。
      </div>

      <form
        onSubmit={handleSubmit}
        className="soft-card space-y-4 rounded-3xl p-5"
      >
        <div className="space-y-1">
          <label htmlFor="title" className="text-sm font-medium">
            标题
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：今天说话语气让我不舒服"
            className="w-full rounded-xl border border-indigo-200/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="content" className="text-sm font-medium">
            具体内容
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            placeholder={"发生了什么：\n我的感受是：\n我希望你可以："}
            className="w-full rounded-xl border border-indigo-200/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="severity" className="text-sm font-medium">
              重要程度
            </label>
            <select
              id="severity"
              value={severity}
              onChange={(event) => setSeverity(event.target.value as Severity)}
              className="w-full rounded-xl border border-indigo-200/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              {Object.entries(severityLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="expectedResolution" className="text-sm font-medium">
              希望解决时间
            </label>
            <select
              id="expectedResolution"
              value={expectedResolution}
              onChange={(event) =>
                setExpectedResolution(
                  event.target.value as "today" | "this_week" | "not_urgent",
                )
              }
              className="w-full rounded-xl border border-indigo-200/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            >
              {Object.entries(resolutionLabel).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={needOfflineTalk}
            onChange={(event) => setNeedOfflineTalk(event.target.checked)}
          />
          需要当面沟通
        </label>

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
          {isSubmitting ? "提交中..." : "提交事项"}
        </button>
      </form>
    </section>
  );
}
