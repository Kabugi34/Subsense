import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, SubscriptionCategory, SubscriptionDraft } from './core/subscription.model';
import { SubscriptionStore } from './core/subscription.store';
import { PlanId } from './core/plan.model';
import { PlanStore } from './core/plan.store';
import { PlansPageComponent } from './features/plans/plans-page.component';
import { FamilyReviewComponent } from './features/review/family-review.component';

type Page = 'Overview' | 'Subscriptions' | 'Insights' | 'Reminders' | 'Family review' | 'Plans' | 'Settings';
type Filter = 'All' | 'Due soon' | SubscriptionCategory;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, PlansPageComponent, FamilyReviewComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly Math = Math;
  readonly chartBars = [55, 72, 62, 91, 83, 100, 74, 86, 68, 97, 79, 92];
  readonly currentMonth = new Date().getMonth();
  readonly page = signal<Page>('Overview');
  readonly filter = signal<Filter>('All');
  readonly query = signal('');
  readonly showAddModal = signal(false);
  readonly showProfileMenu = signal(false);
  readonly showNotifications = signal(false);
  readonly toast = signal('');
  readonly budgetInput = signal('250');
  readonly categories: Filter[] = ['All', 'Due soon', 'Productivity', 'Entertainment'];
  readonly navItems: { name: Page; icon: string }[] = [
    { name: 'Overview', icon: 'grid' }, { name: 'Subscriptions', icon: 'card' },
    { name: 'Insights', icon: 'chart' }, { name: 'Reminders', icon: 'bell' },
    { name: 'Family review', icon: 'review' }, { name: 'Plans', icon: 'plans' }
  ];
  readonly monthlySpend = computed(() => this.store.subscriptions().reduce((sum, item) => sum + this.monthlyAmount(item), 0));
  readonly filteredSubscriptions = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.store.subscriptions().filter(item => {
      const matchesQuery = !q || item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
      const matchesFilter = this.filter() === 'All'
        || (this.filter() === 'Due soon' ? this.daysUntil(item.nextCharge) <= 10 : item.category === this.filter());
      const matchesPage = this.page() !== 'Reminders' || item.reminder;
      return matchesQuery && matchesFilter && matchesPage;
    });
  });
  readonly dueSoon = computed(() => [...this.store.subscriptions()]
    .filter(item => this.daysUntil(item.nextCharge) <= 21)
    .sort((a, b) => a.nextCharge.localeCompare(b.nextCharge)));
  get heading(): string {
    if (this.page() !== 'Overview') return this.page();
    const hour = new Date().getHours();
    return `${hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'}, Alex`;
  }
  get todayLabel(): string { return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()); }
  get monthlyCount(): number { return this.store.subscriptions().filter(item => item.cycle === 'Monthly').length; }
  get yearlyCount(): number { return this.store.subscriptions().filter(item => item.cycle === 'Yearly').length; }
  get entertainmentSpend(): number { return this.store.subscriptions().filter(item => item.category === 'Entertainment').reduce((sum, item) => sum + this.monthlyAmount(item), 0); }
  get budgetPercent(): number { return Math.min(100, this.monthlySpend() / this.store.monthlyBudget() * 100); }
  get categorySummary(): { name: string; amount: number }[] {
    const totals = new Map<string, number>();
    for (const item of this.store.subscriptions()) totals.set(item.category, (totals.get(item.category) ?? 0) + this.monthlyAmount(item));
    return [...totals.entries()].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
  }

  constructor(readonly store: SubscriptionStore, readonly planStore: PlanStore) { this.budgetInput.set(String(store.monthlyBudget())); }

  setPage(page: Page): void { this.page.set(page); if (page !== 'Subscriptions') this.filter.set('All'); }
  selectFilter(filter: Filter): void { this.filter.set(filter); this.page.set('Subscriptions'); }
  openAddSubscription(): void {
    if (this.planStore.currentPlan() === 'free' && this.store.subscriptions().length >= 5) {
      this.setPage('Plans');
      this.notify('Free includes up to 5 subscriptions. Choose a plan to add more.');
      return;
    }
    this.showAddModal.set(true);
  }
  onPlanActivated(plan: PlanId): void {
    const destination = plan === 'family' ? 'Family review' : 'Overview';
    this.setPage(destination);
    this.notify(`${plan === 'lifetime' ? 'Lifetime Plus' : plan[0].toUpperCase() + plan.slice(1)} enabled for this preview`);
  }
  monthlyAmount(item: Subscription): number { return item.cycle === 'Yearly' ? item.amount / 12 : item.amount; }
  daysUntil(date: string): number {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const due = new Date(`${date}T00:00:00`);
    return Math.ceil((due.getTime() - today.getTime()) / 86_400_000);
  }
  dateLabel(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }
  dueLabel(item: Subscription): string {
    const days = this.daysUntil(item.nextCharge);
    return days <= 0 ? 'Due today' : `${days} day${days === 1 ? '' : 's'} left`;
  }
  currency(value: number): string { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); }
  nextSubscription(): Subscription | undefined { return this.dueSoon()[0]; }
  changeReminder(item: Subscription): void { this.store.toggleReminder(item.id); this.notify(`${item.name} reminder ${item.reminder ? 'turned off' : 'turned on'}`); }
  deleteSubscription(item: Subscription): void {
    if (window.confirm(`Remove ${item.name} from your subscriptions?`)) { this.store.remove(item.id); this.notify(`${item.name} removed`); }
  }
  saveBudget(): void {
    const amount = Number(this.budgetInput());
    if (Number.isFinite(amount) && amount > 0) { this.store.setBudget(amount); this.notify('Monthly budget saved'); }
  }
  addSubscription(form: { name: string; category: SubscriptionCategory; amount: number; cycle: 'Monthly' | 'Yearly'; nextCharge: string; reminder: boolean; website: string }): void {
    const draft: SubscriptionDraft = { ...form, amount: Number(form.amount) };
    this.store.add(draft); this.showAddModal.set(false); this.notify(`${form.name} added to your subscriptions`);
  }
  notify(message: string): void {
    this.toast.set(message);
    window.setTimeout(() => { if (this.toast() === message) this.toast.set(''); }, 2800);
  }
  openProvider(item: Subscription): void {
    if (item.website) window.open(item.website, '_blank', 'noopener,noreferrer');
  }
  trackById(_index: number, item: Subscription): string { return item.id; }
}
