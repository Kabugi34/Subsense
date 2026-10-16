export type BillingCycle = 'Monthly' | 'Yearly';
export type SubscriptionCategory = 'Design' | 'Entertainment' | 'Productivity' | 'Utilities' | 'Family' | 'Other';

export interface Subscription {
  id: string;
  name: string;
  category: SubscriptionCategory;
  amount: number;
  cycle: BillingCycle;
  nextCharge: string;
  reminder: boolean;
  color: string;
  initial: string;
  website: string;
}

export type SubscriptionDraft = Omit<Subscription, 'id' | 'initial' | 'color'>;
