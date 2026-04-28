export type AppreciationCategory =
  | "care"
  | "support"
  | "romance"
  | "growth"
  | "daily";

export interface Appreciation {
  id: string;
  coupleId: string;
  fromUserId: string;
  toUserId: string;
  title: string;
  content: string;
  category: AppreciationCategory;
  createdAt: string;
}
