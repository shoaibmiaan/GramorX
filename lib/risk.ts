export type RiskMetadata = {
  ip: string;
  userAgent?: string;
  [key: string]: any;
};

const RISK_THRESHOLD = Number(process.env.RISK_THRESHOLD || '0.8');
const RISK_API_URL = process.env.RISK_API_URL;

export async function evaluateRisk(
  metadata: RiskMetadata,
): Promise<{ score: number }> {
  if (!RISK_API_URL) {
    // No risk model configured; treat as low risk
    return { score: 0 };
  }

  try {
    const response = await fetch(RISK_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      throw new Error(`Risk API responded ${response.status}`);
    }

    const data = (await response.json()) as { score?: number };
    return { score: data.score ?? 0 };
  } catch (error) {
    console.error('Failed to evaluate risk', error);
    // Fallback to allow request when risk model fails
    return { score: 0 };
  }
}

export const riskThreshold = RISK_THRESHOLD;
