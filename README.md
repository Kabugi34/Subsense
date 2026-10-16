# Subsense

Subsense is a web first subscription dashboard for seeing what you pay, when renewals are due, and which subscriptions you might want to cancel. This preview uses local sample data and browser storage; it does not connect to billing providers or implement authentication.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200). Create a production build with `npm run build`.

## What works in the preview

- Overview with monthly spend, active subscriptions, next payment, renewals, spending forecast, and budget health.
- Search, category filters, navigation between Overview, Subscriptions, Insights, Reminders, and Settings.
- Add and remove sample subscriptions, update reminder preferences, and set a monthly budget.
- Light and dark themes, persisted with the demo data in local storage.
- Renewal links open the provider's account or cancellation page in a new tab when one is configured.

## Structure

```text
src/app/
  core/                 app-wide models, state service, and formatting helpers
  features/dashboard/   overview and spending summaries
  features/subscriptions/ subscription list and add form
  shared/               reusable presentation components
  app.component.*        application shell and navigation
```

The demo deliberately has no auth, backend, payment access, or automatic cancellation. Subscription details are illustrative and saved only in this browser.
