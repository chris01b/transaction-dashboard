import axios, { AxiosInstance } from 'axios';
import { LithicTransaction } from '../types.js';

export class LithicService {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://sandbox.lithic.com/v1',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async getTransactions(cardToken: string): Promise<LithicTransaction[]> {
    try {
      const response = await this.client.get('/transactions', {
        params: {
          card_token: cardToken,
          page_size: 100
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions from Lithic API');
    }
  }
}
