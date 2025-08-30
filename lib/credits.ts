export type CreditLedger = Record<string, number>;

const ledger: CreditLedger = {};

/**
 * Records a credit usage for a given user. Defaults to 1 credit per call.
 */
export function recordReevaluationCredit(userId: string, amount = 1) {
  ledger[userId] = (ledger[userId] || 0) + amount;
}

/**
 * Returns the total credits consumed by the user so far in this process.
 */
export function getCreditUsage(userId: string): number {
  return ledger[userId] || 0;
}
