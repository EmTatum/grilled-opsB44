export type OrderStatus =
  | "pending"
  | "processing"
  | "scheduled"
  | "completed"
  | "overdue"
  | "cancelled";

export type OrderPriority = "low" | "normal" | "high" | "critical";

export type Client = {
  id: string;
  fullName: string;
  phone?: string;
  tags?: string[];
  riskLevel?: "low" | "medium" | "high";
  lastContactAt?: string;
};

export type ClientNote = {
  id: string;
  clientId: string;
  createdAt: string;
  updatedAt?: string;
  title: string;
  body: string;
  author?: string;
};

export type Order = {
  id: string;
  clientId: string;
  createdAt: string;
  scheduledFor: string;
  status: OrderStatus;
  priority: OrderPriority;
  totalAmount?: number;
  itemCount?: number;
  notesCount?: number;
  internalFlags?: string[];
};

export type DashboardFilter = {
  selectedDate: string;
  selectedClientId: string | null;
  orderStatus?: OrderStatus | null;
};

export type DashboardUIState = DashboardFilter & {
  activeFilter: "all" | "pending" | "confirmed" | "fulfilled" | "overdue" | "urgent";
  selectedClientName: string | null;
  notesDrawerOpen: boolean;
  themeMode: "noir" | "soft-noir";
};

export const createInitialDashboardState = (): DashboardUIState => ({
  selectedDate: new Date().toISOString(),
  selectedClientId: null,
  orderStatus: null,
  activeFilter: "all",
  selectedClientName: null,
  notesDrawerOpen: false,
  themeMode: "noir",
});