import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

function sortRecords(records, sort) {
  const direction = String(sort || "").startsWith("-") ? -1 : 1;
  const field = String(sort || "updated_date").replace(/^-/, "") || "updated_date";

  return [...records].sort((a, b) => {
    const aValue = a?.[field];
    const bValue = b?.[field];
    if (aValue === bValue) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    return aValue > bValue ? direction : -direction;
  });
}

export function useEntityList(entityName, sort = "-updated_date", limit = 1000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const records = await base44.entities[entityName].list(sort, limit);
      if (active) {
        setData(records || []);
        setLoading(false);
      }
    };

    load();

    const unsubscribe = base44.entities[entityName].subscribe((event) => {
      if (!active || !event?.type) return;

      setData((current) => {
        if (event.type === "create") {
          return sortRecords([event.data, ...current.filter((item) => item.id !== event.data.id)], sort).slice(0, limit);
        }
        if (event.type === "update") {
          return sortRecords(current.map((item) => item.id === event.id ? event.data : item), sort).slice(0, limit);
        }
        if (event.type === "delete") {
          return current.filter((item) => item.id !== event.id);
        }
        return current;
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [entityName, sort, limit]);

  return { data, loading };
}