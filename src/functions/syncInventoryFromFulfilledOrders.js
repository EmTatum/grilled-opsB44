import { base44 } from "@/api/base44Client";

export const syncInventoryFromFulfilledOrders = (payload) => {
  return base44.functions.invoke("syncInventoryFromFulfilledOrders", payload);
};