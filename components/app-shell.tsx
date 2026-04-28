"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getUserLabel } from "@/lib/local-store";
import { getToastEventName, showToast, type ToastKind } from "@/lib/toast";
import { supabase } from "@/lib/supabase";
import { getMyCouple, signOut } from "@/lib/supabase-store";
import type { Couple } from "@/types/ticket";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "待解决" },
  { href: "/tickets/new", label: "新建事项" },
  { href: "/completed", label: "已完成" },
  { href: "/appreciations", label: "暖心瞬间" },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [couple, setCouple] = useState<Couple | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; kind: ToastKind }>
  >([]);

  useEffect(() => {
    const eventName = getToastEventName();
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message: string;
        kind?: ToastKind;
      }>;
      if (!customEvent.detail?.message) return;
      const toast = {
        id: crypto.randomUUID(),
        message: customEvent.detail.message,
        kind: customEvent.detail.kind ?? "success",
      };
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 2300);
    };

    window.addEventListener(eventName, listener);
    return () => window.removeEventListener(eventName, listener);
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      const authed = Boolean(data.session);
      setIsAuthed(authed);
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
        setCurrentEmail(data.session.user.email ?? "");
        try {
          const userCouple = await getMyCouple();
          if (mounted) setCouple(userCouple);
        } catch {
          if (mounted) setCouple(null);
        }
      }
      setIsCheckingAuth(false);

      if (authed && isLoginPage) {
        router.replace("/");
      } else if (!authed && !isLoginPage) {
        router.replace("/login");
      }
    };

    syncSession();

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const authed = Boolean(session);
      setIsAuthed(authed);
      setCurrentUserId(session?.user?.id ?? "");
      setCurrentEmail(session?.user?.email ?? "");

      if (authed && isLoginPage) {
        router.replace("/");
      } else if (!authed && !isLoginPage) {
        router.replace("/login");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  const handleSignOut = async () => {
    await signOut();
    showToast({ message: "已退出登录", kind: "info" });
    router.replace("/login");
  };

  const renderMainContent = () => {
    if (isCheckingAuth) {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 text-sm text-slate-500">
          正在检查登录状态...
        </div>
      );
    }

    if (isLoginPage) {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4">
          {children}
        </div>
      );
    }

    if (!isAuthed) {
      return (
        <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 text-sm text-slate-500">
          即将跳转到登录页...
        </div>
      );
    }

    return (
      <div className="mx-auto w-full max-w-6xl px-3 py-3 md:px-5 md:py-5">
        <div className="mb-4 space-y-3 md:hidden">
          <div className="glass-card rounded-2xl p-3">
            <div className="mb-2">
              <Link href="/" className="text-base font-semibold text-indigo-950">
                关系工单
              </Link>
            </div>
            <nav className="-mx-0.5 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {navItems.map((item) => {
                const active = isCurrent(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`shrink-0 rounded-xl px-3 py-2 text-center text-xs whitespace-nowrap transition ${
                      active
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-300/40"
                        : "bg-white/60 text-slate-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="glass-card rounded-2xl p-3 text-xs text-indigo-800">
            <p className="mb-1">当前身份：{getUserLabel(currentUserId, couple)}</p>
            <p className="truncate text-[11px] text-indigo-600/90">{currentEmail}</p>
            <button
              type="button"
              aria-label="退出登录"
              onClick={handleSignOut}
              className="mt-2 rounded-full border border-indigo-300 px-2.5 py-1 text-[11px] hover:bg-indigo-100"
            >
              退出登录
            </button>
          </div>
        </div>

        <div className="hidden md:grid md:min-h-screen md:grid-cols-[250px_1fr] md:gap-4">
          <aside className="glass-card rounded-3xl p-5">
            <div className="mb-7">
              <Link href="/" className="text-lg font-semibold text-indigo-950">
                关系工单
              </Link>
            </div>

            <div className="mb-6 rounded-2xl border border-indigo-200/70 bg-indigo-50/70 px-3 py-2 text-xs text-indigo-800">
              <p className="mb-1">当前身份：{getUserLabel(currentUserId, couple)}</p>
              <p className="truncate text-[11px] text-indigo-600/90">{currentEmail}</p>
              <button
                type="button"
                aria-label="退出登录"
                onClick={handleSignOut}
                className="mt-2 rounded-full border border-indigo-300 px-2.5 py-1 text-[11px] hover:bg-indigo-100"
              >
                退出登录
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isCurrent(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-400/30"
                        : "bg-white/50 text-slate-600 hover:bg-white/80"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="glass-card rounded-3xl p-6">{children}</main>
        </div>

        <main className="glass-card rounded-3xl p-4 md:hidden">{children}</main>
      </div>
    );
  };

  return (
    <div className="app-gradient min-h-screen text-slate-800">
      {renderMainContent()}
      <div className="pointer-events-none fixed right-4 top-4 z-40 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl px-4 py-2 text-sm text-white shadow-lg ${
              toast.kind === "error"
                ? "bg-rose-500"
                : toast.kind === "info"
                  ? "bg-slate-700"
                  : "bg-emerald-500"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
