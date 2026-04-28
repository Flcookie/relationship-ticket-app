"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  formatDateTime,
  severityLabel,
  severityTone,
} from "@/lib/local-store";
import { listCompletedTickets } from "@/lib/supabase-store";
import type { Ticket } from "@/types/ticket";

export default function CompletedPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await listCompletedTickets();
        if (!mounted) return;
        setTickets(result.tickets);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-indigo-950">已完成事项</h1>
        <p className="text-sm text-slate-500">保留解决记录，帮助你们后续复盘。</p>
      </div>

      {isLoading ? (
        <div className="soft-card rounded-3xl border border-dashed p-10 text-center text-sm text-slate-500">
          正在加载事项...
        </div>
      ) : tickets.length === 0 ? (
        <div className="soft-card rounded-3xl border border-dashed p-10 text-center text-sm text-slate-500">
          还没有已完成事项。
        </div>
      ) : (
        <ul className="space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/tickets/${ticket.id}`}
                className="block rounded-2xl border border-indigo-100/80 bg-white/72 p-4 shadow-[0_3px_10px_rgba(99,102,241,0.08)] transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_8px_22px_rgba(99,102,241,0.14)]"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h2 className="font-medium text-slate-800">{ticket.title}</h2>
                  <div className="flex items-center gap-2">
                    {ticket.needOfflineTalk ? (
                      <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-200">
                        需当面沟通
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${severityTone[ticket.severity]}`}
                    >
                      {severityLabel[ticket.severity]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>创建：{formatDateTime(ticket.createdAt)}</span>
                  <span>关闭：{formatDateTime(ticket.closedAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
