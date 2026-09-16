import { AnomalyRulesService } from "./services/AnomalyRulesService.js";
import { TransactionAuditor } from "./TransactionAuditor.js";

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  status: 'completed' | 'pending' | 'flagged';
}

// Student 1 Service Model
export type BudgetLimits = Record<string, number>;

// Student 2 Service Model
export interface AnomalyRules {
  maxTransactionAmount: number;
  flaggedStatuses: ('completed' | 'pending' | 'flagged')[];
}
async function DuplicatesAndAnomalies(){

  const anomaly = await AnomalyRulesService.getRules() 
  const transactions: Transaction[] = [];
  const outliers = [] //array to hold outliers
  const duplicates: Transaction[][] = []; //array to hold dupes
  const flaggedStatus = []

const anomalousTrans = new Set<string>(); //create a set to hold all anamolous transactrions, sets wont have duplicates.

for (const transaction of transactions)
  if (Math.abs(transaction.amount) > anomaly.maxTransactionAmount) { //need to use absolute value, as transaction could be negative
    outliers.push(transaction) // push the transaction into outlier array if greater than max
    anomalousTrans.add(transaction.id)
  }


let dupeMap = new Map<string, Transaction[]>
for (const transaction of transactions) {
const key = `${transaction.date}|${transaction.amount}|${transaction.category}|${transaction.description}`
if (!dupeMap.has(key)) {
  dupeMap.set(key, [transaction]) // set the key and put the transaction into array
} else {
  dupeMap.get(key)!.push(transaction) // get the key and push the transaction into array corresponding to the key
}
for (const sameKey of dupeMap.values()) { //get the key values, and see if the length of array is more than two, if they have more than 2, then they have dupes and mush be pushed to duplicates.
if (sameKey.length >= 2) {
  duplicates.push(sameKey)
  anomalousTrans.add(transaction.id)
}
}
for (const transaction of transactions) {
 if (anomaly.flaggedStatuses.includes(transaction.status)) // if the transaction Status has one of the flagged statues, push it to the flaggedstatus array
  flaggedStatus.push(transaction)
  anomalousTrans.add(transaction.id)
}

//transactions would be the total
// anamolies would count all duplicates, outliers, and flagged. but there could be multiple in each. for example, a duplicate could be an outlier, so now that counts for 2 instead of 1. we just need number of transactions that are anamolous, not how many anamolys are altogether.
const total = transactions.length;
const anomalyCount = anomalousTrans.size
const percent = anomalyCount/ total * 100

 

//output
console.log("The outlier transactions are: " + outliers)
console.log("The duplicate transactions are: " + dupeMap)
console.log("The flagged transactions are: " + flaggedStatus)
console.log("The percentage of anomalous transactions are: " + percent)




}
}

DuplicatesAndAnomalies();

// Student 3 Service Model
export type HistoricalAverages = Record<string, number>;

// Student 4 Service Model
export interface TaxConfig {
  standardTaxRate: number; // e.g. 0.08 for 8%
  deductibleCategories: string[]; // e.g. ['Charity', 'Business', 'Medical']
}

// Student 5 Service Model
export interface ExchangeRates {
  base: string;
  rates: Record<string, number>; // e.g. { EUR: 0.92, GBP: 0.79, JPY: 155.4 }
}
