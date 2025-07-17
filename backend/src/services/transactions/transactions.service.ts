import { Params } from '@feathersjs/feathers';
import { LithicService } from '../lithic.service.js';
import { LithicTransaction, TransactionGroup, Application } from '../../types.js';

export class TransactionsService {
  private lithicService: LithicService;

  constructor(app: Application) {
    const apiKey = process.env.LITHIC_API_KEY;
    if (!apiKey) {
      throw new Error('LITHIC_API_KEY environment variable is required');
    }
    this.lithicService = new LithicService(apiKey);
  }

  async find(params: Params): Promise<any> {
    const cardToken = params.query?.card_token || process.env.LITHIC_CARD_TOKEN;
    if (!cardToken) {
      throw new Error('Card token is required');
    }

    const transactions = await this.lithicService.getTransactions(cardToken);
    const groupBy = params.query?.group_by || 'merchant';

    return this.groupTransactions(transactions, groupBy);
  }

  private groupTransactions(transactions: LithicTransaction[], groupBy: string): TransactionGroup[] {
    const groups: { [key: string]: LithicTransaction[] } = {};

    transactions.forEach(transaction => {
      let key: string;
      
      switch (groupBy) {
        case 'merchant':
          key = transaction.merchant.descriptor || 'Unknown Merchant';
          break;
        case 'mcc':
          key = transaction.merchant.mcc || 'Unknown MCC';
          break;
        case 'currency':
          key = transaction.currency || 'Unknown Currency';
          break;
        default:
          key = 'Default';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(transaction);
    });

    return Object.entries(groups)
      .map(([label, transactions]) => ({
        label,
        transactions,
        count: transactions.length,
        total: transactions.reduce((sum, t) => sum + t.amount, 0)
      }))
      .sort((a, b) => b.total - a.total);
  }

  async get(id: string, params: Params): Promise<TransactionGroup | null> {
    const cardToken = params.query?.card_token || process.env.LITHIC_CARD_TOKEN;
    const groupBy = params.query?.group_by || 'merchant';
    
    if (!cardToken) {
      throw new Error('Card token is required');
    }

    const transactions = await this.lithicService.getTransactions(cardToken);
    const groups = this.groupTransactions(transactions, groupBy);
    
    return groups.find(group => group.label === id) || null;
  }
}

export const configureTransactions = (app: Application) => {
  app.use('transactions', new TransactionsService(app));
};
