const today = new Date();
const tomorrow = new Date(Date.now() + 86400000);
const inTwoDays = new Date(Date.now() + 2 * 86400000);

export const mockClients = [
  {
    id: "c_001",
    fullName: "Ava Blackwood",
    tags: ["vip", "late-night"],
  },
  {
    id: "c_002",
    fullName: "Mila Stone",
    tags: ["repeat"],
  },
  {
    id: "c_003",
    fullName: "Nico Vale",
    tags: ["new"],
  },
];

export const mockNotes = [
  {
    id: "n_001",
    clientId: "c_001",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    title: "Dispatch preference",
    body: "Prefers evening delivery.",
  },
];

export const mockOrders = [
  {
    id: "o_001",
    clientId: "c_001",
    scheduledFor: today.toISOString(),
    status: "processing",
    priority: "high",
    totalAmount: 2200,
    notesCount: 1,
  },
  {
    id: "o_002",
    clientId: "c_003",
    scheduledFor: today.toISOString(),
    status: "overdue",
    priority: "critical",
    totalAmount: 3100,
  },
  {
    id: "o_003",
    clientId: "c_002",
    scheduledFor: tomorrow.toISOString(),
    status: "pending",
    priority: "normal",
  },
  {
    id: "o_004",
    clientId: "c_001",
    scheduledFor: inTwoDays.toISOString(),
    status: "scheduled",
    priority: "high",
  },
];