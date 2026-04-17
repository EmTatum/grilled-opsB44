import { base44 } from "@/api/base44Client";

export const reportDispatchManifestIssue = (payload) => {
  return base44.functions.invoke("reportDispatchManifestIssue", payload);
};