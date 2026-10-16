import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { BillingPeriod, PlanDefinition, PlanId } from '../../core/plan.model';
import { PlanStore } from '../../core/plan.store';

@Component({
  selector: 'app-plans-page', standalone: true, imports: [CommonModule],
  templateUrl: './plans-page.component.html'
})
export class PlansPageComponent {
  @Output() activated = new EventEmitter<PlanId>();
  readonly period = signal<BillingPeriod>('yearly');

  constructor(readonly plans: PlanStore) {}

  price(plan: PlanDefinition): string {
    if (plan.id === 'lifetime') return `$${plan.oneTimePrice}`;
    const amount = this.period() === 'yearly' && plan.yearlyPrice !== undefined ? plan.yearlyPrice : plan.monthlyPrice;
    return amount === 0 ? '$0' : `$${amount.toFixed(2)}`;
  }

  cadence(plan: PlanDefinition): string {
    if (plan.id === 'lifetime') return 'one time';
    if (plan.monthlyPrice === 0) return 'forever';
    return this.period() === 'yearly' && plan.yearlyPrice !== undefined ? 'per year' : 'per month';
  }

  monthlyEquivalent(plan: PlanDefinition): string | null {
    if (this.period() !== 'yearly' || plan.yearlyPrice === undefined || plan.monthlyPrice === 0) return null;
    return `$${(plan.yearlyPrice / 12).toFixed(2)} / month, billed yearly`;
  }

  choose(plan: PlanDefinition): void {
    this.plans.selectPlan(plan.id);
    this.activated.emit(plan.id);
  }
}
