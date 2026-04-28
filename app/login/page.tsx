"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("请填写邮箱和密码。");
      showToast({ message: "请填写邮箱和密码", kind: "error" });
      return;
    }

    setError("");
    setIsSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("登录失败，请检查账号或密码。");
      showToast({ message: "登录失败，请检查账号或密码", kind: "error" });
      setIsSubmitting(false);
      return;
    }

    showToast({ message: "登录成功，欢迎回来", kind: "success" });
    setIsSubmitting(false);
    router.replace("/");
  };

  return (
    <section className="mx-auto w-full max-w-md space-y-5 rounded-3xl border border-indigo-100/80 bg-white/80 p-6 shadow-[0_12px_28px_rgba(99,102,241,0.14)]">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold text-indigo-950">登录关系工单</h1>
        <p className="text-sm text-slate-500">仅支持已创建账号登录，不开放注册。</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            邮箱
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="请输入你的邮箱"
            className="w-full rounded-xl border border-indigo-200/70 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            密码
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="请输入你的密码"
            className="w-full rounded-xl border border-indigo-200/70 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
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
          className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-md shadow-indigo-300 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? "登录中..." : "登录"}
        </button>
      </form>
    </section>
  );
}
