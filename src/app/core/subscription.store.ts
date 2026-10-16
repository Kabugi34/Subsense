import { Injectable, signal } from '@angular/core';
import { Subscription, SubscriptionDraft } from './subscription.model';

const DEMO_SUBSCRIPTIONS: Subscription[] = [
  { id: 'adobe', name: 'Adobe Creative Cloud', category: 'Design', amount: 54.99, cycle: 'Monthly', nextCharge: '2026-10-18', reminder: true, color: '#f04432', initial: 'A', website: 'https://account.adobe.com/' },
  { id: 'netflix', name: 'Netflix', category: 'Entertainment', amount: 22.99, cycle: 'Monthly', nextCharge: '2026-10-21', reminder: true, color: '#171717', initial: 'N', website: 'https://www.netflix.com/cancelplan' },
  { id: 'notion', name: 'Notion', category: 'Productivity', amount: 96, cycle: 'Yearly', nextCharge: '2026-10-26', reminder: true, color: '#f1eee7', initial: 'N', website: 'https://www.notion.so/settings' },
  { id: 'spotify', name: 'Spotify', category: 'Entertainment', amount: 11.99, cycle: 'Monthly', nextCharge: '2026-11-02', reminder: false, color: '#18a85b', initial: 'S', website: 'https://www.spotify.com/account/' },
  { id: 'icloud', name: 'iCloud+', category: 'Utilities', amount: 2.99, cycle: 'Monthly', nextCharge: '2026-11-06', reminder: true, color: '#4387f5', initial: 'C', website: 'https://support.apple.com/billing' }
];

@Injectable({ providedIn: 'root' })
export class SubscriptionStore {
  readonly subscriptions = signal<Subscription[]>(this.load());
  readonly monthlyBudget = signal<number>(this.loadBudget());
  readonly darkMode = signal<boolean>(localStorage.getItem('subsense-theme') === 'dark');

  add(draft: SubscriptionDraft): void {
    const color = this.colorFor(draft.name);
    this.subscriptions.update(items => [{ ...draft, id: crypto.randomUUID(), initial: draft.name.charAt(0).toUpperCase(), color }, ...items]);
    this.save();
  }

  remove(id: string): void {
    this.subscriptions.update(items => items.filter(item => item.id !== id));
    this.save();
  }

  toggleReminder(id: string): void {
    this.subscriptions.update(items => items.map(item => item.id === id ? { ...item, reminder: !item.reminder } : item));
    this.save();
  }

  setBudget(amount: number): void {
    this.monthlyBudget.set(amount);
    localStorage.setItem('subsense-budget', String(amount));
  }

  toggleTheme(): void {
    this.darkMode.update(value => !value);
    localStorage.setItem('subsense-theme', this.darkMode() ? 'dark' : 'light');
  }

  private save(): void { localStorage.setItem('subsense-subscriptions', JSON.stringify(this.subscriptions())); }
  private load(): Subscription[] {
    try {
      const stored = localStorage.getItem('subsense-subscriptions');
      if (!stored) return DEMO_SUBSCRIPTIONS;
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed as Subscription[] : DEMO_SUBSCRIPTIONS;
    } catch { return DEMO_SUBSCRIPTIONS; }
  }
  private loadBudget(): number {
    const stored = Number(localStorage.getItem('subsense-budget'));
    return Number.isFinite(stored) && stored > 0 ? stored : 250;
  }
  private colorFor(name: string): string {
    const palette = ['#705be7', '#f04432', '#18a85b', '#4387f5', '#e68a46', '#171717'];
    return palette[name.length % palette.length];
  }
}
