import { Injectable, signal } from '@angular/core';
import { PlanId, PLANS } from './plan.model';

@Injectable({ providedIn: 'root' })
export class PlanStore {
  readonly currentPlan = signal<PlanId>(this.loadPlan());
  readonly planDefinitions = PLANS;

  selectPlan(plan: PlanId): void {
    this.currentPlan.set(plan);
    localStorage.setItem('subsense-plan', plan);
  }

  private loadPlan(): PlanId {
    const value = localStorage.getItem('subsense-plan');
    return value === 'plus' || value === 'family' || value === 'lifetime' ? value : 'free';
  }
}
