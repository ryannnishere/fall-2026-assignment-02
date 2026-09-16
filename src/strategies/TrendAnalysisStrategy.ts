import { Transaction } from '../models.js';
import { HistoricalDataService } from '../services/HistoricalDataService.js';
import { AuditStrategy } from './AuditStrategy.js';

type CategoryTrend = {
  category: string;
  currentTotal: number;
  historicalAverage: number;
  variancePercent: number;
};

export class TrendAnalysisStrategy implements AuditStrategy {
  public readonly name = 'Historical Trend Auditor';
  public readonly description =
    'Compares current monthly category spending against historical averages';

  public async execute(
    transactions: Transaction[],
    customParam?: string,
  ): Promise<string> {
    // TODO: Feature 3 - Implement this strategy.
    // 1. Call HistoricalDataService.getHistoricalAverages() asynchronously.
    const historicalAverages =
      await HistoricalDataService.getHistoricalAverages();
    // 2. Group current expenses (amount < 0) by category and compute category totals.
    const currentTotalsByCategory =
      this.groupCurrentExpensesByCategory(transactions);
    // 3. For each category, compare current total spending against the historical average.
    // 4. Calculate the rate of change / variance percentage: ((current - historical) / historical) * 100.
    const trends = this.buildCategoryTrends(
      currentTotalsByCategory,
      historicalAverages,
    );
    // 5. Highlight any category with a variance exceeding +/- 20%.
    const growthCategories = trends.filter(
      (trend) => trend.variancePercent > 20,
    );
    const savingsCategories = trends.filter(
      (trend) => trend.variancePercent < -20,
    );
    // 6. Format and return a text-based audit report detailing comparison metrics.
    return this.formatReport(trends, growthCategories, savingsCategories);

    //throw new Error('Method not implemented.');
  }

  private groupCurrentExpensesByCategory(
    transactions: Transaction[],
  ): Record<string, number> {
    const totals: Record<string, number> = {};

    for (const transaction of transactions) {
      if (transaction.amount < 0) {
        const category = transaction.category;
        totals[category] =
          (totals[category] ?? 0) + Math.abs(transaction.amount);
      }
    }

    return totals;
  }

  private buildCategoryTrends(
    currentTotalsByCategory: Record<string, number>,
    historicalAverages: Record<string, number>,
  ): CategoryTrend[] {
    const allCategories = new Set([
      ...Object.keys(currentTotalsByCategory),
      ...Object.keys(historicalAverages),
    ]);

    const trends: CategoryTrend[] = [];

    for (const category of allCategories) {
      const currentTotal = currentTotalsByCategory[category] ?? 0;
      const historicalAverage = historicalAverages[category] ?? 0;
      const variancePercent = this.calculateVariancePercent(
        currentTotal,
        historicalAverage,
      );

      trends.push({
        category,
        currentTotal,
        historicalAverage,
        variancePercent,
      });
    }

    return trends.sort((a, b) => a.category.localeCompare(b.category));
  }

  private calculateVariancePercent(
    currentTotal: number,
    historicalAverage: number,
  ): number {
    if (historicalAverage === 0) {
      // No historical baseline to compare against.
      return currentTotal === 0 ? 0 : 100;
    }

    return ((currentTotal - historicalAverage) / historicalAverage) * 100;
  }

  private formatReport(
    trends: CategoryTrend[],
    growthCategories: CategoryTrend[],
    savingsCategories: CategoryTrend[],
  ): string {
    const lines: string[] = [];

    lines.push('HISTORICAL TREND AUDIT REPORT');
    lines.push('==============================');
    lines.push('');
    lines.push('Category Comparison (Current vs Historical Average):');

    if (trends.length === 0) {
      lines.push('  No category data available.');
    } else {
      for (const trend of trends) {
        const sign = trend.variancePercent >= 0 ? '+' : '';
        lines.push(
          `  ${trend.category}: Current $${trend.currentTotal.toFixed(2)} | ` +
            `Historical $${trend.historicalAverage.toFixed(2)} | ` +
            `Change: ${sign}${trend.variancePercent.toFixed(1)}%`,
        );
      }
    }

    lines.push('');
    lines.push('Significant Growth Categories (> +20%):');
    if (growthCategories.length === 0) {
      lines.push('  None');
    } else {
      for (const trend of growthCategories) {
        lines.push(
          `  ${trend.category}: +${trend.variancePercent.toFixed(1)}%`,
        );
      }
    }

    lines.push('');
    lines.push('Significant Savings Categories (< -20%):');
    if (savingsCategories.length === 0) {
      lines.push('  None');
    } else {
      for (const trend of savingsCategories) {
        lines.push(`  ${trend.category}: ${trend.variancePercent.toFixed(1)}%`);
      }
    }

    return lines.join('\n');
  }
}
