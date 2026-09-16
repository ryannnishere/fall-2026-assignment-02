import { describe, it, expect, vi, afterEach } from 'vitest';
import { TrendAnalysisStrategy } from '../src/strategies/TrendAnalysisStrategy.js';
import { HistoricalDataService } from '../src/services/HistoricalDataService.js';
import { Transaction } from '../src/models.js';

describe('TrendAnalysisStrategy (Feature 3)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('flags significant growth and savings categories correctly', async () => {
    vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue({
      Groceries: 200,
      Entertainment: 100,
      Utilities: 150,
    });

    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-01-01',
        category: 'Groceries',
        description: 'Weekly shop',
        amount: -260,
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-01-02',
        category: 'Entertainment',
        description: 'Movies',
        amount: -60,
        status: 'completed',
      },
      {
        id: '3',
        date: '2026-01-03',
        category: 'Utilities',
        description: 'Electric bill',
        amount: -155,
        status: 'completed',
      },
    ];

    const strategy = new TrendAnalysisStrategy();
    const report = await strategy.execute(transactions);

    // Groceries: (260 - 200) / 200 = +30% -> growth
    expect(report).toContain('Groceries');
    expect(report).toContain('+30.0%');

    // Entertainment: (60 - 100) / 100 = -40% -> savings
    expect(report).toContain('Entertainment');
    expect(report).toContain('-40.0%');

    // Utilities: (155 - 150) / 150 = +3.3% -> not significant either way
    expect(report).toContain('Utilities');

    expect(report).toContain('Significant Growth Categories');
    expect(report).toContain('Significant Savings Categories');
  });

  it('handles an empty transaction list without crashing', async () => {
    vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue({
      Groceries: 200,
    });

    const strategy = new TrendAnalysisStrategy();
    const report = await strategy.execute([]);

    // Spending nothing against a $200 historical average is a -100% variance,
    // which correctly surfaces as a significant savings category.
    expect(report).toContain('Groceries');
    expect(report).toContain('-100.0%');
    expect(report).toContain('Significant Savings Categories');
  });

  it('avoids division by zero for a category with no historical average', async () => {
    vi.spyOn(HistoricalDataService, 'getHistoricalAverages').mockResolvedValue(
      {},
    );

    const transactions: Transaction[] = [
      {
        id: '1',
        date: '2026-01-01',
        category: 'NewSubscription',
        description: 'Streaming service',
        amount: -50,
        status: 'completed',
      },
    ];

    const strategy = new TrendAnalysisStrategy();
    const report = await strategy.execute(transactions);

    expect(report).toContain('NewSubscription');
    expect(report).not.toContain('NaN');
    expect(report).not.toContain('Infinity');
  });
});
