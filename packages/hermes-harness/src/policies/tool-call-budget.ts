export type HermesToolCallBudget = {
  readonly currentToolCallCount: number;
  readonly maxToolCalls: number;
};

export function assertHermesToolCallBudget(budget: HermesToolCallBudget): void {
  assertNonNegativeInteger('currentToolCallCount', budget.currentToolCallCount);
  assertPositiveInteger('maxToolCalls', budget.maxToolCalls);

  if (budget.currentToolCallCount >= budget.maxToolCalls) {
    throw new Error('Tool call budget exceeded.');
  }
}

function assertNonNegativeInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }
}

function assertPositiveInteger(name: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
}
