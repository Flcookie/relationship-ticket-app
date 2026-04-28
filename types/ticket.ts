export type Severity = "minor" | "medium" | "serious";

export type TicketStatus = "open" | "in_progress" | "completed";

export type UserId = string;

export interface Couple {
  id: string;
  userA: string;
  userB?: string | null;
}

export interface Ticket {
  id: string;
  title: string;
  content: string;
  severity: Severity;
  status: TicketStatus;
  creatorId: UserId;
  coupleId: string;
  needOfflineTalk?: boolean;
  expectedResolution?: "today" | "this_week" | "not_urgent";
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: UserId;
  content: string;
  createdAt: string;
}

export interface AppData {
  tickets: Ticket[];
  comments: Comment[];
}
