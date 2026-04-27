import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

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

    const unsubscribe = base44.entities[entityName].subscribe(() => {
      load();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [entityName, sort, limit]);

  return { data, loading };
}