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
