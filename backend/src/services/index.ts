import { Application } from '../types.js';
import { configureTransactions } from './transactions/transactions.service.js';

export const configureServices = (app: Application) => {
  app.configure(configureTransactions);
};
