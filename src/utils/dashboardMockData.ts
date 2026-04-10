import type { Client, ClientNote, Order } from "../lib/dashboardStore";

const today = new Date();
const tomorrow = new Date(Date.now() + 86400000);
const inTwoDays = new Date(Date.now() + 2 * 86400000);

export const mockClients: Client[] = [
  {
    id: "c_001",
    fullName: "Ava Blackwood",
    phone: "+27xxxx",
    tags: ["vip", "late-night"],
    riskLevel: "medium",
    lastContactAt: today.toISOString(),
  },
  {
    id: "c_002",
    fullName: "Mila Stone",
    phone: "+27xxxx",
    tags: ["repeat"],
    riskLevel: "low",
    lastContactAt: today.toISOString(),
  },
  {
    id: "c_003",
    fullName: "Nico Vale",
    phone: "+27xxxx",
    tags: ["new"],
    riskLevel: "high",
    lastContactAt: today.toISOString(),
  },
];

export const mockNotes: ClientNote[] = [
  {
    id: "n_001",
    clientId: "c_001",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    title: "Dispatch preference",
    body: "Prefers evening delivery. Confirm location before sending.",
    author: "ops-1",
  },
  {
    id: "n_002",
    clientId: "c_001",
    createdAt: today.toISOString(),
    title: "Payment behavior",
    body: "Usually confirms quickly once timing is locked.",
    author: "ops-2",
  },
  {
    id: "n_003",
    clientId: "c_002",
    createdAt: today.toISOString(),
    title: "Order style",
    body: "Direct, fast replies, minimal back and forth.",
    author: "ops-1",
  },
];

export const mockOrders: Order[] = [
  {
    id: "o_001",
    clientId: "c_001",
    createdAt: today.toISOString(),
    scheduledFor: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      18,
      0
    ).toISOString(),
    status: "processing",
    priority: "high",
    totalAmount: 2200,
    itemCount: 3,
    notesCount: 2,
    internalFlags: ["follow-up"],
  },
  {
    id: "o_002",
    clientId: "c_003",
    createdAt: today.toISOString(),
    scheduledFor: new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      20,
      30
    ).toISOString(),
    status: "overdue",
    priority: "critical",
    totalAmount: 3100,
    itemCount: 4,
    notesCount: 0,
    internalFlags: ["late-confirmation"],
  },
  {
    id: "o_003",
    clientId: "c_002",
    createdAt: tomorrow.toISOString(),
    scheduledFor: new Date(
      tomorrow.getFullYear(),
      tomorrow.getMonth(),
      tomorrow.getDate(),
      16,
      30
    ).toISOString(),
    status: "pending",
    priority: "normal",
    totalAmount: 1450,
    itemCount: 2,
    notesCount: 1,
  },
  {
    id: "o_004",
    clientId: "c_001",
    createdAt: inTwoDays.toISOString(),
    scheduledFor: new Date(
      inTwoDays.getFullYear(),
      inTwoDays.getMonth(),
      inTwoDays.getDate(),
      19,
      0
    ).toISOString(),
    status: "scheduled",
    priority: "high",
    totalAmount: 1800,
    itemCount: 2,
    notesCount: 2,
  },
];