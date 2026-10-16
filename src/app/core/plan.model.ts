export type PlanId = 'free' | 'plus' | 'family' | 'lifetime';
export type BillingPeriod = 'monthly' | 'yearly';

export interface PlanDefinition {
  id: PlanId;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  oneTimePrice?: number;
  subscriptionLimit: number | null;
  features: string[];
  badge?: string;
}

export const PLANS: PlanDefinition[] = [
  {
    id: 'free', name: 'Free', description: 'A clear view of your own recurring spend.',
    monthlyPrice: 0, subscriptionLimit: 5,
    features: ['Up to 5 subscriptions', 'Renewal calendar', 'Monthly spend overview', 'One personal review list']
  },
  {
    id: 'plus', name: 'Plus', description: 'More room to organize and follow through.',
    monthlyPrice: 2.99, yearlyPrice: 24, subscriptionLimit: null,
    features: ['Unlimited subscriptions', 'Price history notes', 'Export your data', 'Personal keep or cancel review']
  },
  {
    id: 'family', name: 'Family', description: 'One shared place to decide what stays.',
    monthlyPrice: 5.99, yearlyPrice: 48, subscriptionLimit: null, badge: 'HOUSEHOLD PICK',
    features: ['Everything in Plus', 'Up to 6 household profiles', 'Assign who uses and pays', 'Shared keep, review, or cancel decisions', 'Family savings summary']
  },
  {
    id: 'lifetime', name: 'Lifetime Plus', description: 'Pay once for personal Plus features.',
    monthlyPrice: 0, oneTimePrice: 59, subscriptionLimit: null,
    features: ['Everything in Plus', 'Single personal workspace', 'No recurring charge', 'No family sharing or hosted reminders']
  }
];
