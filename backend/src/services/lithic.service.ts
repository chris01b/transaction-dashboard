import axios, { AxiosInstance } from 'axios';
import { 
  LithicTransaction, 
  TransactionQueryParams,
  PaginationMetadata
} from '../types';
import { 
  DEFAULT_PAGE_SIZE, 
  MAX_PAGE_SIZE, 
  MAX_TRANSACTIONS 
} from '../constants';

export class LithicService {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://sandbox.lithic.com', // Remove /v1 from here to prevent duplication
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async getTransactions(
    cardToken: string,
    params: Omit<TransactionQueryParams, 'card_token'> = {}
  ): Promise<{ data: LithicTransaction[]; pagination: PaginationMetadata }> {
    try {
      // Set default page size and validate against API limits
      const pageSize = Math.min(
        Math.max(1, params.limit || DEFAULT_PAGE_SIZE),
        100 // Maximum allowed by API
      );
      
      // Prepare query parameters according to Lithic API spec
      const queryParams: Record<string, any> = {
        card_token: cardToken,
        page_size: pageSize
      };

      // Add pagination cursor if provided (for next/previous page)
      if (params.starting_after) {
        queryParams.starting_after = params.starting_after;
      } else if (params.ending_before) {
        queryParams.ending_before = params.ending_before;
      } else if (params.page && params.page > 1) {
        // Fallback to page-based pagination if cursor not provided
        queryParams.page = params.page;
      }

      // Date filters can be added here in the future
      // Example implementation:
      // if (params.begin) {
      //   queryParams.begin = new Date(params.begin).toISOString();
      // }
      // if (params.end) {
      //   queryParams.end = new Date(params.end).toISOString();
      // }

      // Add optional filters
      if (params.result) {
        queryParams.result = params.result.toUpperCase(); // Ensure uppercase for enum
      }
      if (params.status) {
        queryParams.status = params.status;
      }

      // Make the API request
      const response = await this.client.get<{ 
        data: LithicTransaction[];
        has_more: boolean;
        page: number;
        page_size: number;
        total_entries: number;
        total_pages: number;
      }>('/v1/transactions', { 
        params: queryParams,
        // Ensure we get fresh data
        headers: { 'Cache-Control': 'no-cache' }
      });

      // Process the response
      const data = Array.isArray(response.data?.data) ? response.data.data : [];
      const total = response.data?.total_entries || 0;
      const page = response.data?.page || 1;
      const totalPages = response.data?.total_pages || Math.max(1, Math.ceil(total / pageSize));
      const hasMore = response.data?.has_more || page < totalPages;

      // Get pagination cursors for next/previous pages
      const nextPageToken = data.length > 0 ? data[data.length - 1]?.token : null;
      const prevPageToken = data.length > 0 ? data[0]?.token : null;

      return {
        data,
        pagination: {
          total,
          page,
          limit: pageSize,
          pages: totalPages,
          hasMore,
          nextPageToken,
          prevPageToken
        }
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async getTransaction(cardToken: string, transactionId: string): Promise<LithicTransaction | null> {
    try {
      const response = await this.client.get<{ 
        data: LithicTransaction;
        page: number;
        page_size: number;
        total_entries: number;
      }>(
        `/v1/transactions/${transactionId}`,
        { params: { card_token: cardToken } }
      );
      return response.data.data || null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error(`Error fetching transaction ${transactionId}:`, error);
      throw error;
    }
  }

  async *getAllTransactions(
    cardToken: string,
    params: Omit<TransactionQueryParams, 'card_token' | 'page' | 'limit'> = {}
  ): AsyncGenerator<LithicTransaction[]> {
    let hasMore = true;
    let nextPageToken: string | null | undefined = undefined;
    let totalProcessed = 0;
    const limit = 100; // Max per API spec

    while (hasMore && totalProcessed < MAX_TRANSACTIONS) {
      try {
        const queryParams: any = { ...params, limit };
        
        // Use cursor-based pagination if we have a token
        if (nextPageToken) {
          queryParams.starting_after = nextPageToken;
        }

        const response = await this.getTransactions(cardToken, queryParams);
        const { data, pagination } = response;
        
        if (data.length > 0) {
          yield data;
          totalProcessed += data.length;
          
          // Update the next page token for cursor-based pagination
          nextPageToken = pagination.nextPageToken || null;
          
          // Check if we should continue paginating
          hasMore = Boolean(pagination.hasMore || nextPageToken) && 
                   totalProcessed < MAX_TRANSACTIONS &&
                   data.length === limit; // Ensure we got a full page
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error('Error in getAllTransactions:', error);
        hasMore = false;
        
        // Only throw if this is the first page
        if (totalProcessed === 0) {
          throw error;
        }
        
        // Otherwise, just stop iterating
        break;
      }
    }
  }
}
