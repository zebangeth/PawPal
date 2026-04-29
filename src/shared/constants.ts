import type { Settings, TodayStats } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  breakReminderEnabled: true,
  breakIntervalMinutes: 45,
  hydrationReminderEnabled: true,
  hydrationIntervalMinutes: 90,
  focusDurationMinutes: 25,
  distractionDetectionEnabled: false,
  soundEnabled: false
};

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function createEmptyStats(date = todayKey()): TodayStats {
  return {
    date,
    breaksTaken: 0,
    watersLogged: 0,
    focusMinutes: 0,
    focusWarnings: 0
  };
}

export const COPY = {
  woof: "woof!",
  breakReminder: "你坐太久啦，陪我站起来走一分钟吧",
  breakDone: "好耶，尾巴批准！",
  breakIgnore: "好吧……但我会担心你的。",
  hydrationReminder: "我有点渴了……你也喝口水吧？",
  hydrationDone: "补水成功！",
  focusStart: "我会帮你守住这 25 分钟。",
  focusWarning: "嘿，说好专注的",
  focusComplete: "守护成功！尾巴批准。",
  focusBack: "好，我继续守着。"
} as const;
