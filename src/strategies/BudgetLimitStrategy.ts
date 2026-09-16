import { Transaction } from '../models.js';
import { BudgetService } from '../services/BudgetService.js';
import { AuditStrategy } from './AuditStrategy.js';

export class BudgetLimitStrategy implements AuditStrategy {
  public readonly name = 'Budget Limit Auditor';
  public readonly description =
    'Checks category spending against monthly budget limits';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // 1. Call BudgetService.getCategoryBudgets() asynchronously.
    const limits = await BudgetService.getCategoryBudgets();

    // 2. Group expenses (amounts < 0) by category and compute total spending for each category.
    const expenses = transactions
      .filter((t) => t.amount < 0)
      .reduce<Record<string, number>>((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
        return acc;
      }, {});

    // 3. Compare spending against the fetched limits.
    const summaryRows = Object.entries(limits).map(([category, limit]) => {
      const spent = expenses[category] ?? 0;
      const overage = spent - limit;
      const percent = limit > 0 ? (spent / limit) * 100 : 0;
      return { category, limit, spent, overage, percent };
    });

    // 4. Identify overages (categories where spending exceeds the budget).
    const overBudget = summaryRows.filter((row) => row.overage > 0);
    const overageTransactions = overBudget.flatMap((row) =>
      transactions.filter((t) => t.category === row.category && t.amount < 0),
    );

    // 5. Format and return a text-based audit report outlining limits, actuals, overage amounts, percentages, and lists of transactions causing the overage.
    const lines: string[] = ['Budget Limit Report', ''];

    lines.push('Summary:');
    summaryRows.forEach((r) => {
      lines.push(
        `  ${r.category}: $${r.spent.toFixed(2)} / $${r.limit.toFixed(2)}`,
      );
    });

    lines.push('', 'Over Budget:');
    if (overBudget.length === 0) {
      lines.push('  None');
    } else {
      overBudget.forEach((r) => {
        lines.push(
          `  ${r.category}: over by $${r.overage.toFixed(2)} (${r.percent.toFixed(0)}%)`,
        );
      });
    }

    lines.push('', 'Transactions causing overage:');
    if (overageTransactions.length === 0) {
      lines.push('  None');
    } else {
      overageTransactions.forEach((t) => {
        lines.push(
          `  ${t.date} | ${t.category} | ${t.description} | $${Math.abs(t.amount).toFixed(2)}`,
        );
      });
    }

    return lines.join('\n');
  }
}
