// lib/routes.ts

export const routes = {
  home: () => '/',
  dashboard: () => '/dashboard',

  // Onboarding
  onboarding: {
    goal: () => '/onboarding/goal',
    date: () => '/onboarding/date',
    skills: () => '/onboarding/skills',
    schedule: () => '/onboarding/schedule',
  },

  // Mocks
  listeningMock: (id: string) => `/mock/listening/${id}`,
  readingMock: (id: string) => `/mock/reading/${id}`,
  writingMock: (id: string) => `/mock/writing/${id}`,
  speakingMock: (id: string) => `/mock/speaking/${id}`,

  // Reviews
  listeningReview: (id: string) => `/review/listening/${id}`,
  readingReview: (id: string) => `/review/reading/${id}`,
  writingReview: (id: string) => `/review/writing/${id}`,
  speakingReview: (id: string) => `/review/speaking/${id}`,

  // Modules pickers
  listeningIndex: () => '/listening',
  readingIndex: () => '/reading',
  writingIndex: () => '/writing',
  speakingSimulator: () => '/speaking/simulator',

  // Paywall/Billing
  pricing: () => '/pricing',
  checkout: (plan?: string) => (plan ? `/checkout?plan=${encodeURIComponent(plan)}` : '/checkout'),
  settingsBilling: () => '/settings/billing',

  // Platform
  studyPlan: () => '/study-plan',
  progress: () => '/progress',

  // Optional AI hub
  ai: () => '/ai',
} as const;

export type RouteBuilder = typeof routes;
