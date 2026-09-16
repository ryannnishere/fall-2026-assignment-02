import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BudgetLimitStrategy } from '../src/strategies/BudgetLimitStrategy.js';
import { BudgetService } from '../src/services/BudgetService.js';
import { Transaction } from '../src/models.js';

describe('BudgetLimitStrategy (Feature 1)', () => {
  let strategy: BudgetLimitStrategy;

  beforeEach(() => {
    strategy = new BudgetLimitStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should correctly identify categories that are over budget', async () => {
  //   // 1. Mock the BudgetService asynchronously
  //   const mockBudgets = { Food: 100, Rent: 1000 };
  //   const spy = vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue(mockBudgets);
  //
  //   // 2. Set up test transactions
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -150.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Over budget
  //     { id: '2', date: '2026-05-02', amount: -900.00, category: 'Rent', description: 'Apartment', status: 'completed' }, // Under budget
  //   ];
  //
  //   // 3. Execute
  //   const result = await strategy.execute(testTransactions);
  //
  //   // 4. Assert
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Food');
  //   expect(result).toContain('OVER BUDGET'); // or whatever formatting you choose
  //   expect(result).not.toContain('Rent over budget');
  // });

  it('should group expenses correctly by category and sum them', async () => {
    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({
      Food: 200,
    });

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -50,
        category: 'Food',
        description: 'Lunch',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-02',
        amount: -30,
        category: 'Food',
        description: 'Snacks',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    // 50 + 30 = 80 total spent for Food
    expect(result).toContain('Food: $80.00 / $200.00');
  });

  it('should calculate absolute overage amounts and percentage exceeded', async () => {
    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({
      Food: 100,
    });

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -150,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    // spent 150, limit 100 -> overage $50.00, 150%
    expect(result).toContain('over by $50.00 (150%)');
  });

  it('should list the specific transactions contributing to categories that are over budget', async () => {
    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({
      Food: 50,
      Rent: 1000,
    });

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -80,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
      {
        id: '2',
        date: '2026-05-02',
        amount: -900,
        category: 'Rent',
        description: 'Apartment',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('2026-05-01 | Food | Groceries | $80.00');
    expect(result).not.toContain('Apartment'); // Rent is under budget, shouldn't show up here
  });

  it('should handle scenarios where no categories are over budget', async () => {
    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({
      Food: 200,
    });

    const testTransactions: Transaction[] = [
      {
        id: '1',
        date: '2026-05-01',
        amount: -50,
        category: 'Food',
        description: 'Groceries',
        status: 'completed',
      },
    ];

    const result = await strategy.execute(testTransactions);

    expect(result).toContain('Over Budget:\n  None');
    expect(result).toContain('Transactions causing overage:\n  None');
  });

  it('should handle empty transaction list gracefully', async () => {
    vi.spyOn(BudgetService, 'getCategoryBudgets').mockResolvedValue({
      Food: 200,
    });

    const result = await strategy.execute([]);

    expect(result).toContain('Food: $0.00 / $200.00');
    expect(result).toContain('None');
  });
});
