import dayjs from "dayjs";

export const getTodayDateString = (): string => dayjs().format("YYYY-MM-DD");

export const isCurrentMonthDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const parsed = dayjs(dateStr);
  if (!parsed.isValid()) return false;
  return parsed.format("YYYY-MM") === dayjs().format("YYYY-MM");
};

export const isAllowedTransactionDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const parsed = dayjs(dateStr);
  if (!parsed.isValid()) return false;

  const today = dayjs();
  const formatted = parsed.format("YYYY-MM-DD");
  return (
    parsed.format("YYYY-MM") === today.format("YYYY-MM") &&
    formatted <= today.format("YYYY-MM-DD")
  );
};
