import { supabase } from "@/lib/supabase";
import type { Comment, Couple, Severity, Ticket, TicketStatus } from "@/types/ticket";

type TicketRow = {
  id: string;
  couple_id: string;
  title: string;
  content: string;
  severity: Severity;
  status: TicketStatus;
  creator_id: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  need_offline_talk: boolean | null;
  expected_resolution: "today" | "this_week" | "not_urgent" | null;
};

type CommentRow = {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type CoupleRow = {
  id: string;
  user_a: string;
  user_b: string | null;
};

function mapTicket(row: TicketRow): Ticket {
  return {
    id: row.id,
    coupleId: row.couple_id,
    title: row.title,
    content: row.content,
    severity: row.severity,
    status: row.status,
    creatorId: row.creator_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at ?? undefined,
    needOfflineTalk: row.need_offline_talk ?? false,
    expectedResolution: row.expected_resolution ?? "this_week",
  };
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function requireCurrentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("未登录或登录已失效");
  }
  return data.user.id;
}

export async function getMyCouple(): Promise<Couple> {
  const userId = await requireCurrentUserId();

  const { data: asUserA } = await supabase
    .from("couples")
    .select("id,user_a,user_b")
    .eq("user_a", userId)
    .maybeSingle<CoupleRow>();
  if (asUserA) {
    return { id: asUserA.id, userA: asUserA.user_a, userB: asUserA.user_b };
  }

  const { data: asUserB } = await supabase
    .from("couples")
    .select("id,user_a,user_b")
    .eq("user_b", userId)
    .maybeSingle<CoupleRow>();
  if (asUserB) {
    return { id: asUserB.id, userA: asUserB.user_a, userB: asUserB.user_b };
  }

  throw new Error("未找到你所属的情侣关系，请先在 Supabase 后台关联 couples。");
}

export async function listOpenTickets(): Promise<{ tickets: Ticket[]; couple: Couple }> {
  const couple = await getMyCouple();
  const { data, error } = await supabase
    .from("tickets")
    .select(
      "id,couple_id,title,content,severity,status,creator_id,created_at,updated_at,closed_at,need_offline_talk,expected_resolution",
    )
    .eq("couple_id", couple.id)
    .neq("status", "completed")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return { tickets: (data ?? []).map((row) => mapTicket(row as TicketRow)), couple };
}

export async function listCompletedTickets(): Promise<{
  tickets: Ticket[];
  couple: Couple;
}> {
  const couple = await getMyCouple();
  const { data, error } = await supabase
    .from("tickets")
    .select(
      "id,couple_id,title,content,severity,status,creator_id,created_at,updated_at,closed_at,need_offline_talk,expected_resolution",
    )
    .eq("couple_id", couple.id)
    .eq("status", "completed")
    .order("closed_at", { ascending: false });
  if (error) throw error;
  return { tickets: (data ?? []).map((row) => mapTicket(row as TicketRow)), couple };
}

export async function createTicket(input: {
  title: string;
  content: string;
  severity: Severity;
  needOfflineTalk: boolean;
  expectedResolution: "today" | "this_week" | "not_urgent";
}) {
  const userId = await requireCurrentUserId();
  const couple = await getMyCouple();
  const { error } = await supabase.from("tickets").insert({
    couple_id: couple.id,
    title: input.title,
    content: input.content,
    severity: input.severity,
    status: "open",
    creator_id: userId,
    need_offline_talk: input.needOfflineTalk,
    expected_resolution: input.expectedResolution,
  });
  if (error) throw error;
}

export async function getTicketDetail(ticketId: string): Promise<{
  ticket: Ticket;
  comments: Comment[];
  currentUserId: string;
  couple: Couple;
}> {
  const currentUserId = await requireCurrentUserId();
  const couple = await getMyCouple();
  const { data: ticketData, error: ticketError } = await supabase
    .from("tickets")
    .select(
      "id,couple_id,title,content,severity,status,creator_id,created_at,updated_at,closed_at,need_offline_talk,expected_resolution",
    )
    .eq("id", ticketId)
    .eq("couple_id", couple.id)
    .single<TicketRow>();
  if (ticketError) throw ticketError;

  const { data: commentData, error: commentError } = await supabase
    .from("comments")
    .select("id,ticket_id,user_id,content,created_at")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (commentError) throw commentError;

  return {
    ticket: mapTicket(ticketData),
    comments: (commentData ?? []).map((row) => mapComment(row as CommentRow)),
    currentUserId,
    couple,
  };
}

export async function addComment(input: { ticketId: string; content: string }) {
  const userId = await requireCurrentUserId();
  const { error } = await supabase.from("comments").insert({
    ticket_id: input.ticketId,
    user_id: userId,
    content: input.content,
  });
  if (error) throw error;

  const { error: updateError } = await supabase
    .from("tickets")
    .update({ status: "in_progress" })
    .eq("id", input.ticketId)
    .neq("status", "completed");
  if (updateError) throw updateError;
}

export async function closeTicket(ticketId: string) {
  const userId = await requireCurrentUserId();
  const { data, error } = await supabase
    .from("tickets")
    .update({ status: "completed", closed_at: new Date().toISOString() })
    .eq("id", ticketId)
    .eq("creator_id", userId)
    .select("id");
  if (error) throw error;
  return (data ?? []).length > 0;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
