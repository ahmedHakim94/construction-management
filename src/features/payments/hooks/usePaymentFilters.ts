import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { PaymentSchemaValues } from "../schemas/payment.schema";

const DEFAULT_FILTERS: PaymentSchemaValues = {
  search: "",
  projectId: "",
  year: "",
  month: "",
};

export function usePaymentFilters(onFiltersChange?: () => void) {
  const { control, reset } = useForm<PaymentSchemaValues>({
    defaultValues: DEFAULT_FILTERS,
  });

  const [search, projectId, year, month] = useWatch({
    control,
    name: ["search", "projectId", "year", "month"],
  });

  useEffect(() => {
    onFiltersChange?.();
  }, [search, projectId, year, month, onFiltersChange]);

  const filters = {
    search: search ?? "",
    projectId: projectId ?? "",
    year: year ?? "",
    month: month ?? "",
  };

  const resetFilters = () => reset(DEFAULT_FILTERS);

  return {
    control,
    filters,
    resetFilters,
  };
}
