import { env, bool } from './env';

export type FeatureFlag =
  | 'trial'
  | 'paywall'
  | 'referral'
  | 'partner'
  | 'predictor'
  | 'challenge';

const map: Record<FeatureFlag, boolean> = {
  trial: bool(env.NEXT_PUBLIC_FEATURE_TRIAL, true),
  paywall: bool(env.NEXT_PUBLIC_FEATURE_PAYWALL, true),
  referral: bool(env.NEXT_PUBLIC_FEATURE_REFERRAL, false),
  partner: bool(env.NEXT_PUBLIC_FEATURE_PARTNER, false),
  predictor: bool(env.NEXT_PUBLIC_FEATURE_PREDICTOR, true),
  challenge: bool(env.NEXT_PUBLIC_FEATURE_CHALLENGE, false),
};

export const flags = {
  enabled(name: FeatureFlag) {
    return map[name];
  },
  snapshot() {
    return { ...map };
  },
} as const;
