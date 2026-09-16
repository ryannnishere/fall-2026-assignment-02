import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnomalyDetectionStrategy } from '../src/strategies/AnomalyDetectionStrategy.js';
import { AnomalyRulesService } from '../src/services/AnomalyRulesService.js';
import { Transaction, AnomalyRules } from '../src/models.js';

describe('AnomalyDetectionStrategy (Feature 2)', () => {
  let strategy: AnomalyDetectionStrategy;

  beforeEach(() => {
    strategy = new AnomalyDetectionStrategy();
    vi.restoreAllMocks();
  });

  // Example of how to write and mock in your tests:
  //
  // it('should detect outlier transactions exceeding threshold', async () => {
  //   const mockRules = { maxTransactionAmount: 500.00, flaggedStatuses: ['flagged'] };
  //   const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
  //
  //   const testTransactions: Transaction[] = [
  //     { id: '1', date: '2026-05-01', amount: -600.00, category: 'Shopping', description: 'Laptop', status: 'completed' }, // Outlier
  //     { id: '2', date: '2026-05-02', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Normal
  //   ];
  //
  //   const result = await strategy.execute(testTransactions);
  //
  //   expect(spy).toHaveBeenCalled();
  //   expect(result).toContain('Laptop');
  //   expect(result).toContain('Outlier');
  // });





  it(
    'should detect outlier transactions exceeding the configured max amount limit', async () => {
      const mockRules = { maxTransactionAmount : 500, flaggedStatuses: ['flagged'] };
      const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
      const testTransactions: Transaction[] = [
       { id: '1', date: '2026-09-15', amount: -1900.00, category: 'Shopping', description: 'Xbox', status: 'completed' }, // Outlier
       { id: '2', date: '2026-09-15', amount: -100.00, category: 'Food', description: 'Grocery', status: 'completed' }, // Normal
      ];
        const result = await strategy.execute(testTransactions);
  
     expect(spy).toHaveBeenCalled();
     expect(result).toContain('Xbox');
     expect(result).toContain('Outlier');
     ;
    }
  );

  it(
    'should react to empty array', async () => {
      const mockRules = { maxTransactionAmount : 500, flaggedStatuses: ['flagged'] };
      const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
      const testTransactions: Transaction[] = [];
        const result = await strategy.execute(testTransactions);
  
     expect(spy).toHaveBeenCalled();
     expect(result).toBeDefined();
     ;
    }
  );

    it(
    'should react to edge case', async () => {
      const mockRules = { maxTransactionAmount : 500, flaggedStatuses: ['flagged'] };
      const spy = vi.spyOn(AnomalyRulesService, 'getRules').mockResolvedValue(mockRules);
      const testTransactions: Transaction[] = [
       { id: '1', date: '2026-09-15', amount: -500.00, category: 'Shopping', description: 'Xbox', status: 'completed' }, // Edge Case
       
      ];
        const result = await strategy.execute(testTransactions);
  
     expect(spy).toHaveBeenCalled();
     expect(result).toContain('Xbox');
     ;
     ;
    }
  );

  it.todo(
    'should flag transactions matching standard flagged statuses in the rules',
  );

  it.todo(
    'should calculate correct transaction anomaly rates and total flagged valuation',
  );

  it.todo(
    'should output a clean, readable text audit report detailing warnings',
  );
});
