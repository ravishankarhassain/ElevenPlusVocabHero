
export interface Word {
  id: string;
  word: string;
  definition: string;
  part_of_speech: string;
  synonyms: string[];
  antonyms: string[];
  example_sentence: string;
  level: number; // 4, 5, or 6
  phonetic?: string;
  // Spaced Repetition Fields
  nextReviewDate?: string; // ISO string
  intervalDays?: number;
  masteryLevel?: number; // 0 to 5
  isStarred?: boolean;
}

export type WordCategory = 
  | 'Describing Emotion'
  | 'Giving People Instruction'
  | 'Persuade people'
  | 'Delicious Describing'
  | 'Less Dramatic doing Words'
  | 'More Dramatic doing Words'
  | 'General Word Groups'
  | 'Exciting Words'
  | 'Sound Onomatopoeia'
  | 'Intelligent Words';

export interface StudyTask {
  id: string;
  task: string;
  isCompleted: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  level: number;
  selectedCategories: WordCategory[];
  stats: UserStats;
  studyPlan: StudyTask[];
}

export interface UserStats {
  masteredWords: number;
  totalXp: number;
  streak: number;
  accuracy: number;
}

export interface GameAnswer {
  wordId: string;
  definition: string;
  synonyms: string;
  antonyms: string;
  sentence: string;
}

export interface ValidationResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  corrections: {
    definition?: string;
    synonyms?: string;
    antonyms?: string;
    sentence?: string;
  };
}
