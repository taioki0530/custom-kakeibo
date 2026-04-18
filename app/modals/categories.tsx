import { useDashboardStore } from "../../src/store/dashboardStore";
import CategoryManager from "../../src/components/categories/CategoryManager";
import { useEffect } from "react";

export default function CategoriesModal() {
  const refresh = useDashboardStore((s) => s.refresh);

  useEffect(() => {
    return () => {
      refresh();
    };
  }, []);

  return <CategoryManager />;
}
