export type Metrics = {
  flaggedLoginAttempts: number;
  flaggedSignupAttempts: number;
};

const metrics: Metrics = {
  flaggedLoginAttempts: 0,
  flaggedSignupAttempts: 0,
};

export function incrementFlaggedLogin() {
  metrics.flaggedLoginAttempts += 1;
}

export function incrementFlaggedSignup() {
  metrics.flaggedSignupAttempts += 1;
}

export function getMetrics(): Metrics {
  return { ...metrics };
}
