import { base44 } from "@/api/base44Client";

export const syncDispatchManifestOrders = (payload) => {
  return base44.functions.invoke("syncDispatchManifestOrders", payload);
};