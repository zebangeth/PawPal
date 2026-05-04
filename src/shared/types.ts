export type Language = "zh-CN" | "en";

export type PetAppearanceId = "lovartPuppy" | "lineDog";

export type PetFacing = "left" | "right";

export type PetState =
  | "idle"
  | "sitting"
  | "happy"
  | "breakPrompt"
  | "breakRunning"
  | "breakDone"
  | "hydrationPrompt"
  | "drinking"
  | "hydrationDone"
  | "focusGuard"
  | "focusDone"
  | "sad"
  | "sleeping";

export type BubbleAction = {
  id: string;
  label: string;
  kind?: "primary" | "secondary" | "danger";
};

export type SpeechBubble = {
  id: string;
  message: string;
  actions?: BubbleAction[];
  autoDismissMs?: number;
};

export type BlockingMode = "break" | "breakRun" | "hydration" | null;

export type Settings = {
  language: Language;
  petAppearanceId: PetAppearanceId;
  onboardingDismissed: boolean;
  breakReminderEnabled: boolean;
  breakIntervalMinutes: number;
  hydrationReminderEnabled: boolean;
  hydrationIntervalMinutes: number;
  focusDurationMinutes: number;
};

export type TodayStats = {
  date: string;
  breaksTaken: number;
  watersLogged: number;
  focusMinutes: number;
};

export type StatsHistory = Record<string, TodayStats>;

export type TimerStatus = {
  breakDueAt: number | null;
  hydrationDueAt: number | null;
  focusEndsAt: number | null;
};

export type AppSnapshot = {
  settings: Settings;
  stats: TodayStats;
  statsHistory: StatsHistory;
  timers: TimerStatus;
  petState: PetState;
  petFacing: PetFacing;
  blockingMode: BlockingMode;
  focusActive: boolean;
  dogVisible: boolean;
};

export type DemoTrigger =
  | "break"
  | "hydration"
  | "happy";

export type RendererEventMap = {
  "pet:set-state": PetState;
  "pet:show-bubble": SpeechBubble;
  "pet:hide-bubble": void;
  "settings:updated": Settings;
  "stats:updated": TodayStats;
  "app:snapshot": AppSnapshot;
};
