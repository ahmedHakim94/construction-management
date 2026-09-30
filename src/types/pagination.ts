export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TablePaginationProps {
  page: number; // 1-indexed (API format)
  limit: number; // fixed page size
  total: number;
  totalPages?: number;
  onPageChange: (newPage: number) => void;
}
