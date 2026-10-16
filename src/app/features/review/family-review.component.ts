import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReviewDecision, Subscription } from '../../core/subscription.model';
import { PlanStore } from '../../core/plan.store';
import { SubscriptionStore } from '../../core/subscription.store';

@Component({
  selector: 'app-family-review', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './family-review.component.html'
})
export class FamilyReviewComponent {
  @Output() viewPlans = new EventEmitter<void>();
  readonly people = ['Alex', 'Jordan', 'Riley', 'Casey', 'Taylor', 'Morgan'];
  readonly familyUnlocked = computed(() => this.plans.currentPlan() === 'family');
  readonly visibleSubscriptions = computed(() => this.familyUnlocked()
    ? this.store.subscriptions()
    : this.store.subscriptions().filter(item => (item.owner ?? 'Alex') === 'Alex'));
  readonly decisions = computed(() => this.visibleSubscriptions().filter(item => item.decision === 'review' || item.decision === 'cancel'));
  readonly monthlySavings = computed(() => this.visibleSubscriptions()
    .filter(item => item.decision === 'cancel')
    .reduce((sum, item) => sum + this.monthlyAmount(item), 0));
  readonly familyCount = computed(() => new Set(this.visibleSubscriptions().map(item => item.owner ?? 'Alex')).size);

  constructor(readonly store: SubscriptionStore, readonly plans: PlanStore) {}

  monthlyAmount(item: Subscription): number { return item.cycle === 'Yearly' ? item.amount / 12 : item.amount; }
  currency(value: number): string { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); }
  decide(item: Subscription, decision: ReviewDecision): void { this.store.updateDecision(item.id, decision); }
  assign(item: Subscription, owner: string): void { this.store.assignOwner(item.id, owner); }
  trackById(_index: number, item: Subscription): string { return item.id; }
}
