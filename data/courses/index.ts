export type Lesson = {
  slug: string;
  title: string;
  content: string;
  skill: 'grammar' | 'vocabulary' | 'collocations';
  /** Lesson slugs that must be completed before this one unlocks */
  prerequisites?: string[];
};

export type Course = {
  slug: string;
  title: string;
  description: string;
  skill: Lesson['skill'];
  lessons: Lesson[];
};

const grammar: Course = {
  slug: 'grammar-basics',
  title: 'Grammar Basics',
  description: 'Core grammar rules for IELTS.',
  skill: 'grammar',
  lessons: [
    {
      slug: 'parts-of-speech',
      title: 'Parts of Speech',
      content: 'Nouns, verbs, adjectives and more.',
      skill: 'grammar',
    },
    {
      slug: 'tenses-overview',
      title: 'Tenses Overview',
      content: 'Present, past and future tenses in English.',
      skill: 'grammar',
      prerequisites: ['parts-of-speech'],
    },
  ],
};

const vocabulary: Course = {
  slug: 'vocab-builder',
  title: 'Vocabulary Builder',
  description: 'Grow academic vocabulary and themes.',
  skill: 'vocabulary',
  lessons: [
    {
      slug: 'high-frequency-words',
      title: 'High Frequency Words',
      content: 'Learn must-know IELTS words.',
      skill: 'vocabulary',
    },
    {
      slug: 'topic-technology',
      title: 'Topic: Technology',
      content: 'Vocabulary for technology-related topics.',
      skill: 'vocabulary',
      prerequisites: ['high-frequency-words'],
    },
  ],
};

export const courses: Course[] = [grammar, vocabulary];

/** Find a lesson by slug across all courses */
export function getLesson(slug: string): Lesson | undefined {
  return courses.flatMap(c => c.lessons).find(l => l.slug === slug);
}

/** Return lessons for a given skill */
export function lessonsBySkill(skill: Lesson['skill']): Lesson[] {
  return courses.filter(c => c.skill === skill).flatMap(c => c.lessons);
}
