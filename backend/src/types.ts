import { Application as FeathersApplication } from '@feathersjs/feathers';

// TODO: Ensure types match OpenAI spec
// TODO: Verify and remove backward compatibility

export interface AmountDetail {
  amount: number;
  currency: string;
  conversion_rate: string;
}

export interface MerchantInfo {
  descriptor: string;
  mcc: string;
  city: string;
  state: string;
  country: string;
  acceptor_id: string;
  acquiring_institution_id: string;
}

export interface LithicTransaction {
  token: string;
  amount: number; // Keeping for backward compatibility
  currency: string; // Keeping for backward compatibility
  merchant_amount: number; // Amount in merchant's currency
  settled_amount: number; // Settled amount in cardholder's currency
  authorization_amount: number | null; // Authorized amount in cardholder's currency
  merchant_authorization_amount: number | null; // Authorized amount in merchant's currency
  
  amounts: {
    cardholder: AmountDetail;
    hold: {
      amount: number;
      currency: string;
    };
    merchant: {
      amount: number;
      currency: string;
    };
    settlement: {
      amount: number;
      currency: string;
      conversion_rate?: string;
    };
  };
  merchant: MerchantInfo;
  created: string;
  updated: string;
  status: string;
  card_token: string;
  network: string;
  result: string;
  acquirer_fee: number | null;
  account_token: string;
  authorization_code: string | null;
  network_risk_score: number;
  avs?: any; // Address Verification System data
  token_info?: any; // Tokenization information
  pos?: {
    terminal: {
      attended: boolean;
      operator: string;
      on_premise: boolean;
      card_retention_capable: boolean;
      pin_capability: string;
      type: string;
      partial_approval_capable: boolean;
      acceptor_terminal_id: string | null;
    };
    entry_mode: {
      pan: string;
      pin_entered: boolean;
      cardholder: string;
      card: string;
    };
  };
  events: Array<{
    type: string;
    result: string;
    created: string;
    token: string;
    amounts: {
      settlement: AmountDetail;
      cardholder: AmountDetail;
      merchant: {
        amount: number;
        currency: string;
      };
    };
    amount: number;
    effective_polarity: 'CREDIT' | 'DEBIT';
    detailed_results: string[];
    rule_results: Array<{
      auth_rule_token: string;
      result: string;
      name: string;
      explanation: string;
    }>;
    network_info: any;
    network_specific_data: any;
    account_type: string | null;
  }>;
}

// Base query parameters for transactions
export interface TransactionQueryParams {
  // Grouping
  group_by?: 'merchant' | 'mcc' | 'currency';
  
  // Date filters (both formats supported for backward compatibility)
  start_date?: string; // ISO date string (legacy)
  end_date?: string;   // ISO date string (legacy)
  begin?: string;      // ISO date string (Lithic API native)
  end?: string;        // ISO date string (Lithic API native)
  
  // Pagination
  page?: number;       // Page number (1-based)
  limit?: number;      // Items per page (max 100)
  starting_after?: string;  // Token for pagination (next page)
  ending_before?: string;   // Token for pagination (previous page)
  
  // Filtering
  card_token?: string; // Filter by card
  account_token?: string; // Filter by account
  result?: 'APPROVED' | 'DECLINED'; // Transaction result
  status?: string;     // Transaction status
  
  // Additional filters from Lithic API
  mcc?: string;        // Merchant category code
  state?: 'PENDING' | 'VOIDED' | 'DECLINED' | 'COMPLETED' | 'REFUNDED' | 'COMPLETION' | 'AUTHORIZATION';
}

// Pagination metadata
export interface PaginationMetadata {
  // Basic pagination
  total: number;      // Total number of items
  page: number;       // Current page (1-based)
  limit: number;      // Items per page
  pages: number;      // Total number of pages
  
  // Cursor-based pagination
  hasMore?: boolean;  // Whether there are more items available
  nextPageToken?: string | null;  // Token for next page
  prevPageToken?: string | null;  // Token for previous page
  
  // For backward compatibility
  has_more?: boolean;  // Alternative spelling for hasMore (Lithic API format)
}

// Optimized transaction data for the frontend
export interface OptimizedTransaction {
  id: string;
  amount: number;
  currency: string;
  merchant: {
    name: string;
    category: string;
    location: string;
  };
  date: string;
  status: string;
  type: 'debit' | 'credit';
}

export interface TransactionGroup {
  label: string;
  transactions: OptimizedTransaction[];
  count: number;
  total: number;
  pagination: PaginationMetadata;
}

export interface ServiceTypes {
  transactions: {
    find: (params?: { query?: TransactionQueryParams }) => Promise<{
      data: TransactionGroup[];
      pagination: PaginationMetadata;
    }>;
  };
}

export type Application = FeathersApplication<ServiceTypes>;
