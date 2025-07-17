export interface LithicTransaction {
  token: string;
  amount: number;
  currency: string;
  merchant: {
    descriptor: string;
    mcc: string;
    city: string;
    state: string;
    country: string;
  };
  created: string;
  updated: string;
  status: string;
  card_token: string;
  network: string;
  result: string;
}

export interface TransactionGroup {
  label: string;
  transactions: LithicTransaction[];
  count: number;
  total: number;
}

export type GroupBy = 'merchant' | 'mcc' | 'currency';

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasMore?: boolean;
  nextPageToken?: string | null;
  prevPageToken?: string | null;
  has_more?: boolean; // For backward compatibility
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
}
