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
    const groups: { [key: string]: { transactions: LithicTransaction[], total: number } } = {};

    for (const transaction of transactions) {
      // Get the most recent event to determine transaction type
      const latestEvent = transaction.events?.[transaction.events.length - 1];
      const isDebit = latestEvent?.effective_polarity === 'DEBIT';
      
      // Apply negative sign for debits
      const merchantAmount = (transaction.amounts?.merchant?.amount ?? 0) * (isDebit ? -1 : 1);
      const cardholderAmount = (transaction.amounts?.cardholder?.amount ?? 0) * (isDebit ? -1 : 1);
      const merchantCurrency = transaction.amounts?.merchant?.currency;
      const cardholderCurrency = transaction.amounts?.cardholder?.currency;

      let amount: number;
      let key: string;

      switch (groupBy) {
        case 'merchant':
          key = transaction.merchant.descriptor || 'Unknown Merchant';
          amount = cardholderAmount;
          break;
          
        case 'mcc':
          key = transaction.merchant.mcc || 'Unknown MCC';
          amount = cardholderAmount;
          break;
          
        case 'currency':
          if (merchantCurrency) {
            key = merchantCurrency;
            amount = merchantAmount;
          } else if (cardholderCurrency) {
            key = cardholderCurrency;
            amount = cardholderAmount;
          } else {
            key = 'Unknown Currency';
            amount = 0;
          }
          break;
          
        default:
          key = 'Default';
          amount = cardholderAmount;
      }

      if (!groups[key]) {
        groups[key] = { transactions: [], total: 0 };
      }
      
      groups[key].transactions.push(transaction);
      groups[key].total += amount;
    }

    return Object.entries(groups)
      .map(([label, { transactions, total }]) => ({
        label,
        transactions,
        count: transactions.length,
        total
      }))
      .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
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
