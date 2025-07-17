import { Params } from '@feathersjs/feathers';
import { LithicService } from '../lithic.service.js';
import { 
  LithicTransaction, 
  TransactionGroup, 
  Application, 
  TransactionQueryParams, 
  PaginationMetadata, 
  OptimizedTransaction
} from '../../types.js';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MAX_TRANSACTIONS } from '../../constants';

export class TransactionsService {
  private lithicService: LithicService;

  constructor(app: Application) {
    const apiKey = process.env.LITHIC_API_KEY;
    if (!apiKey) {
      throw new Error('LITHIC_API_KEY environment variable is required');
    }
    this.lithicService = new LithicService(apiKey);
  }

  async find(params: { query?: TransactionQueryParams & { $page?: number; $limit?: number; } } = {}): Promise<{ data: TransactionGroup[]; pagination: PaginationMetadata }> {
    const query = params.query || {};
    const cardToken = query.card_token || process.env.LITHIC_CARD_TOKEN;
    
    if (!cardToken) {
      throw new Error('Card token is required');
    }

    try {
      // Get pagination parameters from query with defaults
      const page = Math.max(1, query.$page || 1);
      const limit = Math.min(
        Math.max(1, query.$limit || DEFAULT_PAGE_SIZE), 
        MAX_PAGE_SIZE
      );
      
      // Use cursor-based pagination to fetch transactions efficiently
      const transactionsPerPage = 100; // Max allowed by API
      let allTransactions: LithicTransaction[] = [];
      let hasMore = true;
      let startingAfter: string | undefined;
      
      // Keep fetching until we have enough groups or no more transactions
      while (hasMore && allTransactions.length < (page * limit * 5)) { // Fetch up to 5x the needed transactions
        const { data: pageTransactions, pagination } = await this.lithicService.getTransactions(
          cardToken,
          {
            // TODO: Implement date filtering
            // begin: query.begin_date, // RFC 3339 format for start date
            // end: query.end_date,     // RFC 3339 format for end date
            limit: transactionsPerPage,
            starting_after: startingAfter
          }
        );
        
        if (pageTransactions.length === 0) {
          hasMore = false;
          break;
        }
        
        allTransactions = [...allTransactions, ...pageTransactions];
        startingAfter = pageTransactions[pageTransactions.length - 1]?.token;
        
        // If we got fewer transactions than requested, we've reached the end
        if (pageTransactions.length < transactionsPerPage) {
          hasMore = false;
        }
      }
      
      // Group all transactions
      const groupBy = query.group_by || 'merchant';
      const allGroups = this.groupTransactions(allTransactions, groupBy);
      
      // Paginate the groups
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedGroups = allGroups.slice(startIndex, endIndex);
      
      // Calculate total pages based on actual group count
      const totalGroups = allGroups.length;
      const totalPages = Math.max(1, Math.ceil(totalGroups / limit));
      
      // Return the paginated response with the grouped data
      return {
        data: paginatedGroups,
        pagination: {
          total: totalGroups,
          page,
          limit,
          pages: totalPages
        }
      };
    } catch (error) {
      console.error('Error in transactions service find method:', error);
      throw error;
    }
  }

  private async fetchAllTransactions(
    cardToken: string,
    query: TransactionQueryParams
  ): Promise<{ data: LithicTransaction[]; pagination: PaginationMetadata }> {
    try {
      // Get pagination parameters with defaults
      const page = Math.max(1, query.page || 1);
      const limit = Math.min(
        Math.max(1, query.limit || DEFAULT_PAGE_SIZE),
        MAX_PAGE_SIZE
      );

      // Fetch the requested page
      const response = await this.lithicService.getTransactions(cardToken, {
        // TODO: Implement date filtering
        // begin: query.begin_date, // RFC 3339 format for start date
        // end: query.end_date,     // RFC 3339 format for end date
        page,
        limit
      });

      return {
        data: response.data,
        pagination: {
          total: response.pagination.total,
          page: response.pagination.page,
          limit: response.pagination.limit,
          pages: Math.ceil(response.pagination.total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  private optimizeTransaction(transaction: LithicTransaction): OptimizedTransaction {
    const latestEvent = transaction.events?.[transaction.events.length - 1];
    const isDebit = latestEvent?.effective_polarity === 'DEBIT';
    
    return {
      id: transaction.token,
      amount: isDebit 
        ? -(transaction.amounts?.merchant?.amount || 0) 
        : (transaction.amounts?.merchant?.amount || 0),
      currency: transaction.amounts?.merchant?.currency || 'USD',
      merchant: {
        name: transaction.merchant.descriptor,
        category: transaction.merchant.mcc || 'Unknown',
        location: [transaction.merchant.city, transaction.merchant.state, transaction.merchant.country]
          .filter(Boolean)
          .join(', ')
      },
      date: transaction.created,
      status: transaction.status,
      type: isDebit ? 'debit' : 'credit'
    };
  }

  private paginateGroups(
    groups: TransactionGroup[],
    page: number,
    limit: number
  ): { groups: TransactionGroup[]; pagination: PaginationMetadata } {
    const total = groups.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, total);
    
    const paginatedGroups = groups.slice(startIndex, endIndex);
    
    return {
      groups: paginatedGroups.map(group => ({
        ...group,
        // Apply pagination to transactions within each group
        transactions: group.transactions.slice(0, 50), // Limit transactions per group
        pagination: {
          total: group.transactions.length,
          page: 1,
          limit: 50,
          pages: Math.ceil(group.transactions.length / 50)
        }
      })),
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  private getGroupLabel(tx: OptimizedTransaction, groupBy: string): string | null {
    switch (groupBy) {
      case 'merchant':
        return tx.merchant.name || 'Unknown Merchant';
      case 'mcc':
        return tx.merchant.category || 'Unknown Category';
      case 'currency':
        return tx.currency || 'USD';
      default:
        return null;
    }
  }

  private groupTransactions(
    transactions: LithicTransaction[] | { data: LithicTransaction[]; pagination: any },
    groupBy: string
  ): TransactionGroup[] {
    // Handle both array and object response formats
    const transactionsArray = Array.isArray(transactions) 
      ? transactions 
      : transactions?.data || [];

    if (!Array.isArray(transactionsArray)) {
      console.error('Invalid transactions data format:', transactions);
      return [];
    }

    // Filter and optimize transactions
    const optimizedTransactions = transactionsArray
      .filter((tx: LithicTransaction) => tx && (tx.status === 'SETTLED' || tx.status === 'PENDING'))
      .map(tx => this.optimizeTransaction(tx));

    // Group transactions by the specified field
    const groupsMap = new Map<string, {
      transactions: OptimizedTransaction[];
      count: number;
      total: number;
    }>();
    
    for (const tx of optimizedTransactions) {
      if (!tx) continue;
      
      const key = this.getGroupLabel(tx, groupBy);
      if (!key) continue;

      // Initialize the group if it doesn't exist
      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          transactions: [],
          count: 0,
          total: 0
        });
      }
      
      // Add the transaction to its group
      const group = groupsMap.get(key)!;
      group.transactions.push(tx);
      group.count++;
      group.total += tx.amount;
    }

    // Convert the map to an array of groups
    return Array.from(groupsMap.entries())
      .map(([label, { transactions, count, total }]) => ({
        label,
        transactions: transactions.slice(0, 50), // Limit transactions per group
        count,
        total,
        pagination: {
          total: count,
          page: 1,
          limit: 50,
          pages: Math.ceil(count / 50)
        }
      }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
  }

  async get(id: string, params: Params): Promise<TransactionGroup | null> {
    const { query = {} } = params as { query?: { card_token?: string; group_by?: string } };
    const cardToken = query?.card_token || process.env.LITHIC_CARD_TOKEN;
    const groupBy = query?.group_by || 'merchant';
    
    if (!cardToken) {
      throw new Error('Card token is required');
    }

    try {
      // Get the transaction details
      const transaction = await this.lithicService.getTransaction(cardToken, id);
      
      if (!transaction) {
        return null;
      }

      // Create a transaction group with just this transaction
      const optimizedTx = this.optimizeTransaction(transaction);
      const label = this.getGroupLabel(optimizedTx, groupBy);
      
      if (!label) {
        return null;
      }

      return {
        label,
        transactions: [optimizedTx],
        count: 1,
        total: optimizedTx.amount,
        pagination: {
          total: 1,
          page: 1,
          limit: 1,
          pages: 1
        }
      };
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  }
}

export const configureTransactions = (app: Application) => {
  app.use('transactions', new TransactionsService(app));
};
