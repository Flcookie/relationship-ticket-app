"use client";

import { useRouter } from "next/navigation";
import { FormEvent, use, useEffect, useState } from "react";
import {
  formatDateTime,
  getUserLabel,
  resolutionLabel,
  severityLabel,
  severityTone,
  statusLabel,
} from "@/lib/local-store";
import {
  addComment,
  closeTicket,
  getTicketDetail,
} from "@/lib/supabase-store";
import { showToast } from "@/lib/toast";
import type { Comment, Couple, Ticket } from "@/types/ticket";

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await getTicketDetail(id);
        if (!mounted) return;
        setTicket(result.ticket);
        setComments(result.comments);
        setCurrentUserId(result.currentUserId);
        setCouple(result.couple);
      } catch {
        if (mounted) setTicket(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ticket || !newComment.trim()) {
      showToast({ message: "回复内容不能为空", kind: "error" });
      return;
    }
    setIsSubmittingComment(true);
    try {
      await addComment({ ticketId: ticket.id, content: newComment.trim() });
      setNewComment("");
      const refreshed = await getTicketDetail(id);
      setTicket(refreshed.ticket);
      setComments(refreshed.comments);
      setCurrentUserId(refreshed.currentUserId);
      setCouple(refreshed.couple);
      showToast({ message: "回复已发送 ✓", kind: "success" });
    } catch {
      showToast({ message: "发送失败，请稍后重试", kind: "error" });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticket) return;
    const confirmed = window.confirm("确定要标记这个事项为已解决吗？");
    if (!confirmed) return;
    setIsClosing(true);
    try {
      const ok = await closeTicket(ticket.id);
      if (ok) {
        showToast({ message: "事项已标记为完成 ✓", kind: "success" });
        router.push("/completed");
      } else {
        showToast({ message: "只有发起人可以关闭事项", kind: "error" });
      }
    } finally {
      setIsClosing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-indigo-200 bg-white p-8 text-center text-sm text-slate-500">
        正在加载事项详情...
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-xl border border-dashed border-amber-300 bg-white p-8 text-center text-sm text-zinc-500">
        这个事项不存在或已被删除。
      </div>
    );
  }

  const canClose = ticket.creatorId === currentUserId && ticket.status !== "completed";

  return (
    <section className="space-y-5">
      <article className="soft-card space-y-3 rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-semibold text-indigo-950">{ticket.title}</h1>
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
          <span>状态：{statusLabel[ticket.status]}</span>
          <span>发起人：{getUserLabel(ticket.creatorId, couple)}</span>
          {ticket.expectedResolution ? (
            <span>希望解决：{resolutionLabel[ticket.expectedResolution]}</span>
          ) : null}
          <span>创建：{formatDateTime(ticket.createdAt)}</span>
        </div>
        <p className="whitespace-pre-wrap rounded-2xl bg-indigo-50/70 p-4 text-sm leading-6 text-slate-700">
          {ticket.content}
        </p>
        {canClose ? (
          <button
            type="button"
            onClick={handleCloseTicket}
            disabled={isClosing}
            className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {isClosing ? "处理中..." : "标记为已解决"}
          </button>
        ) : null}
      </article>

      <article className="soft-card space-y-3 rounded-3xl p-5">
        <h2 className="font-medium text-slate-800">沟通记录</h2>
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">还没有回复，欢迎先表达你的想法。</p>
        ) : (
          <ul className="space-y-2">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-2xl bg-indigo-50/70 p-3 text-sm">
                <p className="mb-1 text-xs text-slate-500">
                  {getUserLabel(comment.userId, couple)} · {formatDateTime(comment.createdAt)}
                </p>
                <p className="whitespace-pre-wrap text-slate-700">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}

        {ticket.status !== "completed" ? (
          <form onSubmit={handleAddComment} className="space-y-2">
            <textarea
              rows={4}
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="写下你的回应..."
              className="w-full rounded-xl border border-indigo-200/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2 text-sm font-medium text-white shadow-md shadow-indigo-300 transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSubmittingComment ? "发送中..." : "发送回复"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-slate-500">该事项已完成，如需继续可后续扩展“重新打开”。</p>
        )}
      </article>
    </section>
  );
}
