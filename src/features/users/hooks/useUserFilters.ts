import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { DEFAULT_USER_FILTERS } from "../constants";
import type { UserFilters } from "../types";

export type FilterChangeCallback = () => void;

export interface UseUserFiltersOptions {
  /** Called immediately when role, project, or status changes. */
  onImmediateFilterChange?: FilterChangeCallback;
  /** Called after search debounce completes. */
  onSearchCommit?: FilterChangeCallback;
  /** Fallback called on any filter/search change. */
  onFiltersChange?: FilterChangeCallback;
  /** Search debounce delay in milliseconds. Defaults to 300ms. */
  debounceMs?: number;
}

export function useUserFilters(
  options?: UseUserFiltersOptions | FilterChangeCallback,
) {
  const isFunction = typeof options === "function";
  const fallbackCallback = isFunction ? options : options?.onFiltersChange;
  const onImmediateFilterChange = isFunction
    ? options
    : (options?.onImmediateFilterChange ?? fallbackCallback);
  const onSearchCommit = isFunction
    ? options
    : (options?.onSearchCommit ?? fallbackCallback);
  const debounceMs = (!isFunction && options?.debounceMs) || 300;

  const { control, reset } = useForm<UserFilters>({
    defaultValues: DEFAULT_USER_FILTERS,
  });

  const search = useWatch({ control, name: "search" });
  const role = useWatch({ control, name: "role" });
  const projectId = useWatch({ control, name: "projectId" });
  const status = useWatch({ control, name: "status" });

  const [debouncedSearch, setDebouncedSearch] = useState(search ?? "");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isResettingRef = useRef(false);
  const isMountedRef = useRef(false);
  const prevSearchRef = useRef(search);
  const prevImmediateRef = useRef({ role, projectId, status });

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 1. Debounced Search Handler: avoids fetching with old search while typing
  useEffect(() => {
    if (!isMountedRef.current || isResettingRef.current) return;

    if (prevSearchRef.current === search) return;
    prevSearchRef.current = search;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmed = (search ?? "").trim();

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(trimmed);
      if (isMountedRef.current && !isResettingRef.current) {
        onSearchCommit?.();
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [search, debounceMs, onSearchCommit]);

  // 2. Immediate Filters Handler: role, project, and status apply instantly
  useEffect(() => {
    if (!isMountedRef.current || isResettingRef.current) return;

    const prev = prevImmediateRef.current;
    const hasChanged =
      prev.role !== role ||
      prev.projectId !== projectId ||
      prev.status !== status;

    prevImmediateRef.current = { role, projectId, status };

    if (hasChanged) {
      onImmediateFilterChange?.();
    }
  }, [role, projectId, status, onImmediateFilterChange]);

  // 3. Clean Reset: cancels pending debounce and clears all states immediately
  const resetFilters = useCallback(() => {
    isResettingRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    reset(DEFAULT_USER_FILTERS);
    setDebouncedSearch("");
    prevSearchRef.current = DEFAULT_USER_FILTERS.search;
    prevImmediateRef.current = {
      role: DEFAULT_USER_FILTERS.role,
      projectId: DEFAULT_USER_FILTERS.projectId,
      status: DEFAULT_USER_FILTERS.status,
    };

    setTimeout(() => {
      isResettingRef.current = false;
    }, 0);
  }, [reset]);

  const filters: UserFilters = {
    search: search ?? "",
    role: role ?? "",
    projectId: projectId ?? "",
    status: status ?? "",
  };

  return {
    control,
    filters,
    debouncedSearch,
    resetFilters,
  };
}
