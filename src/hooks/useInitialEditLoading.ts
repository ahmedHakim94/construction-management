import { useEffect, useState } from "react";

interface UseInitialEditLoadingOptions {
  open: boolean;
  isEdit: boolean;
  recordKey: string | number | undefined;
  isFetching: boolean;
  isReady: boolean;
  hasError?: boolean;
}

/**
 * Keeps an Edit dialog in an initial loading state until the default data/options
 * for the opened record finish loading. Once completed for that open session,
 * subsequent user-driven refetches (such as changing a parent select) stay inline.
 */
export function useInitialEditLoading({
  open,
  isEdit,
  recordKey,
  isFetching,
  isReady,
  hasError = false,
}: UseInitialEditLoadingOptions): boolean {
  const sessionKey = open && isEdit ? `${recordKey ?? "edit"}` : null;
  const [completedSessionKey, setCompletedSessionKey] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!sessionKey) {
      setCompletedSessionKey(null);
      return;
    }

    if (!isFetching && (isReady || hasError)) {
      setCompletedSessionKey(sessionKey);
    }
  }, [sessionKey, isFetching, isReady, hasError]);

  if (!sessionKey) return false;
  if (completedSessionKey === sessionKey) return false;
  if (hasError && !isFetching) return false;
  return isFetching || !isReady;
}
