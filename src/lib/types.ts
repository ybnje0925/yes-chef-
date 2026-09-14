export interface Step {
  id: string;
  title: string;
  instruction: string;
  detail: string;
  minimumDuration: number;
  recommendedDuration: number;
  maximumDuration: number;
  timerRequired: boolean;
  chefStartMessage: string;
  earlyWarningMessages: string[];
  lateWarningMessages: string[];
  successMessages: string[];
}
export interface Recipe {
  id: string;
  name: string;
  englishName: string;
  description: string;
  estimatedMinutes: number;
  difficulty: number;
  thumbnail: string;
  chefIntro: string;
  ingredients: string[];
  steps: Step[];
}
export interface Counters {
  disobedience: number;
  early: number;
  late: number;
  scolded: number;
}
export interface ClockState {
  startedAt: number;
  pausedAt: number | null;
  pausedMs: number;
}
export interface Session {
  id: string;
  recipeId: string;
  index: number;
  startedAt: number;
  clock: ClockState;
  counters: Counters;
  warned: boolean;
  lateWarned: boolean;
  timerNotified: boolean;
  finishedAt: number | null;
  demo: boolean;
  pastaSeconds: number;
}
export type Grade = "S" | "A" | "B" | "C" | "D" | "F";
export interface Stats {
  count: number;
  best: Grade | null;
  recent: string | null;
  lastSessionId: string | null;
}
