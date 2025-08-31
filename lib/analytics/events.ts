export type AnalyticsEventName =
  | 'signup'
  | 'onboarding_completed'
  | 'mock_started'
  | 'mock_completed'
  | 'ai_feedback_viewed'
  | 'paywall_view'
  | 'subscribe_clicked'
  | 'plan_purchased'
  | 'referral_link_created'
  | 'referral_redeemed'
  | 'partner_code_applied'
  | 'predictor_completed'
  | 'challenge_joined'
  | 'certificate_shared';

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;
