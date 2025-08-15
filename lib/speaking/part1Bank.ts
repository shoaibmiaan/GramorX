// lib/speaking/part1Bank.ts
export type Part1Topic = { topic: string; questions: string[] };

export const PART1_BANK: Part1Topic[] = [
  { topic: "Work or studies", questions: [
    "Do you work or are you a student?",
    "Why did you choose that job/subject?",
    "What do you like most about it?",
    "Is there anything you would change?",
  ]},
  { topic: "Hometown", questions: [
    "Where is your hometown?",
    "What is it famous for?",
    "How has it changed in recent years?",
    "Do you think you will live there in the future?",
  ]},
  { topic: "Accommodation", questions: [
    "Do you live in a house or an apartment?",
    "What is your favorite room?",
    "Who do you live with?",
    "What would you improve about your home?",
  ]},
  { topic: "Daily routine", questions: [
    "What time do you usually get up?",
    "Do you prefer mornings or evenings?",
    "How do you organize your day?",
    "Has your routine changed recently?",
  ]},
  { topic: "Free time", questions: [
    "What do you usually do in your free time?",
    "Do you prefer to spend free time alone or with others?",
    "How often do you try something new?",
    "Do you wish you had more free time?",
  ]},
  { topic: "Reading", questions: [
    "Do you like reading?",
    "What kinds of books or articles do you read?",
    "Do you prefer e-books or paper books?",
    "When do you usually read?",
  ]},
  { topic: "Films", questions: [
    "Do you like watching films?",
    "What kinds of films do you enjoy?",
    "Do you prefer watching at home or in the cinema?",
    "When was the last time you watched a film?",
  ]},
  { topic: "Music", questions: [
    "What kind of music do you listen to?",
    "When do you usually listen to music?",
    "Can you concentrate while listening to music?",
    "Have your music tastes changed?",
  ]},
  { topic: "Sport and exercise", questions: [
    "Do you play any sports?",
    "How often do you exercise?",
    "Do you prefer team sports or individual sports?",
    "Did you do much sport at school?",
  ]},
  { topic: "Food and cooking", questions: [
    "What is your favorite food?",
    "How often do you cook at home?",
    "Do you like trying new dishes?",
    "Is there any food you don’t like?",
  ]},
  { topic: "Travel", questions: [
    "Do you enjoy traveling?",
    "What kind of places do you like to visit?",
    "Do you prefer to travel alone or with others?",
    "What was your most recent trip?",
  ]},
  { topic: "Public holidays", questions: [
    "What public holidays are important in your country?",
    "How do you usually spend them?",
    "Do you think there should be more public holidays?",
    "Which holiday do you like most?",
  ]},
  { topic: "Weather", questions: [
    "What is the weather like where you live?",
    "Which season do you like best?",
    "How does the weather affect your mood?",
    "Do you check the weather forecast?",
  ]},
  { topic: "Shopping", questions: [
    "Do you like shopping?",
    "Do you prefer shopping online or in stores?",
    "How often do you buy clothes?",
    "What do you consider before buying something?",
  ]},
  { topic: "Clothes and fashion", questions: [
    "What kind of clothes do you usually wear?",
    "Do you follow fashion trends?",
    "Do you wear a uniform for work or study?",
    "Have your clothing preferences changed?",
  ]},
  { topic: "Technology and phones", questions: [
    "How often do you use your mobile phone?",
    "What do you mainly use it for?",
    "Do you think people use phones too much?",
    "What app do you use the most?",
  ]},
  { topic: "Internet and social media", questions: [
    "How often do you use social media?",
    "Which platforms do you use?",
    "What are the advantages of social media?",
    "Are there any downsides?",
  ]},
  { topic: "Photography", questions: [
    "Do you like taking photos?",
    "What do you usually photograph?",
    "Do you ever print your photos?",
    "Do you prefer to be in photos or take them?",
  ]},
  { topic: "Art and museums", questions: [
    "Do you enjoy visiting museums or galleries?",
    "When did you last visit one?",
    "Do you prefer traditional or modern art?",
    "Is art education important for children?",
  ]},
  { topic: "Parks and nature", questions: [
    "Do you often go to parks?",
    "What do you usually do there?",
    "Do you prefer the countryside or the city?",
    "Are there enough green spaces in your area?",
  ]},
  { topic: "Friends and socializing", questions: [
    "Do you prefer a small circle of friends or many acquaintances?",
    "How often do you meet your friends?",
    "What do you like to do together?",
    "Are you still in touch with childhood friends?",
  ]},
  { topic: "Family", questions: [
    "How many people are in your family?",
    "Who are you closest to?",
    "What activities do you do together?",
    "Do you resemble any family member?",
  ]},
  { topic: "Childhood and school", questions: [
    "What was your favorite subject at school?",
    "Did you enjoy your school life?",
    "What games did you play as a child?",
    "Is there anything you miss about childhood?",
  ]},
  { topic: "Learning English", questions: [
    "Why are you learning English?",
    "Which skill is the most difficult for you?",
    "What helps you improve your English?",
    "Do you plan to use English in the future?",
  ]},
  { topic: "Sleep and time management", questions: [
    "How many hours do you sleep each night?",
    "Are you good at managing your time?",
    "Do you prefer to plan things or be spontaneous?",
    "Are you usually early, on time, or late?",
  ]},
];

// ---- helpers to generate a 12-question, exam-style set (3 topics × 4 Q) ----
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export type Part1Item = { id: string; topic: string; text: string; index: number };

export function pickPart1Set(
  nTopics = 3,
  perTopic = 4,
  seed?: number
): Part1Item[] {
  const rnd = seededRand(seed);
  const topics = [...PART1_BANK];
  topics.sort(() => rnd() - 0.5);
  const chosen = topics.slice(0, nTopics);

  const items: Part1Item[] = [];
  let idx = 0;
  for (const t of chosen) {
    const qs = [...t.questions];
    qs.sort(() => rnd() - 0.5);
    for (const q of qs.slice(0, perTopic)) {
      items.push({ id: `${slug(t.topic)}-${slug(q).slice(0, 18)}-${idx}`, topic: t.topic, text: q, index: idx++ });
    }
  }
  return items;
}

function seededRand(seed?: number) {
  let s = (seed ?? Date.now()) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 48271) % 2147483647) / 2147483647;
}
