export type FooterLink = {
  href: string;
  label: string; // translation key
};

export const resources: FooterLink[] = [
  { href: '/predictor', label: 'footer.resources.bandScorePredictor' },
  { href: '/listening', label: 'footer.resources.listeningPractice' },
  { href: '/reading', label: 'footer.resources.readingPractice' },
  { href: '/writing', label: 'footer.resources.writingTaskSamples' },
  { href: '/speaking', label: 'footer.resources.speakingQuestions' },
];

export const quickLinks: FooterLink[] = [
  { href: '/pricing', label: 'footer.quickLinks.pricingPlans' },
  { href: '/account/referrals', label: 'footer.quickLinks.referralRewards' },
  { href: '/partners', label: 'footer.quickLinks.partnerProgram' },
  { href: '/support', label: 'footer.quickLinks.support' },
  { href: '/blog', label: 'footer.quickLinks.blog' },
  { href: '/faq', label: 'footer.quickLinks.faq' },
];

export const contactInfo = {
  email: 'footer.contact.email',
  phone: 'footer.contact.phone',
  location: 'footer.contact.location',
  support: 'footer.contact.supportHours',
} as const;

