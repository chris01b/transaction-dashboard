import { Application as FeathersApplication } from '@feathersjs/feathers';

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

export interface ServiceTypes {
  transactions: any;
}

export type Application = FeathersApplication<ServiceTypes>;
