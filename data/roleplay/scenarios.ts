export type Scenario = {
  slug: string;
  title: string;
  intro: string;            // first partner line
  systemPrompt: string;     // how the AI should behave
  sample: string[];         // optional helper questions
  maxSeconds?: number;
};

export const scenarios: Scenario[] = [
  {
    slug: 'check-in',
    title: 'Hotel Check-in',
    intro: "Good evening! Welcome to the Grand Plaza. Do you have a reservation?",
    systemPrompt:
      "You are a hotel front-desk agent roleplaying an IELTS practice scenario. " +
      "Keep replies concise, natural, and ask follow-ups. Slow the pace if the user struggles.",
    sample: [
      "May I have your ID and a credit card, please?",
      "Would you like a room with a view?",
      "Breakfast is from 7 to 10 AM; any questions?"
    ],
    maxSeconds: 60
  },
  {
    slug: 'bank-account',
    title: 'Open a Bank Account',
    intro: "Hello! Are you here to open a new account today?",
    systemPrompt:
      "You are a helpful bank clerk in an IELTS roleplay. Guide the user through KYC and product choices.",
    sample: ["What kind of account are you looking for?", "Do you have proof of address?"]
  },
  {
    slug: 'campus-orientation',
    title: 'Campus Orientation',
    intro: "Welcome to the university! What would you like to know about the campus?",
    systemPrompt:
      "You are a campus guide roleplaying for IELTS speaking. Ask friendly follow-ups; correct gently when needed.",
    sample: ["Have you explored the library yet?", "Do you need help with your timetable?"]
  },
];

export function getScenario(slug: string) {
  return scenarios.find(s => s.slug === slug) || null;
}
