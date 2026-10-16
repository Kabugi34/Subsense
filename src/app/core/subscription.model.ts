export type BillingCycle = 'Monthly' | 'Yearly';
export type SubscriptionCategory = 'Design' | 'Entertainment' | 'Productivity' | 'Utilities' | 'Family' | 'Other';
export type ReviewDecision = 'keep' | 'review' | 'cancel';

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
  owner?: string;
  decision?: ReviewDecision;
}

export type SubscriptionDraft = Omit<Subscription, 'id' | 'initial' | 'color'>;
