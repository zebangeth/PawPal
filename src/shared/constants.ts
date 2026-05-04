import type { Settings, TodayStats } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  language: "zh-CN",
  petAppearanceId: "lineDog",
  onboardingDismissed: false,
  breakReminderEnabled: true,
  breakIntervalMinutes: 45,
  hydrationReminderEnabled: true,
  hydrationIntervalMinutes: 90,
  focusDurationMinutes: 25
};

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createEmptyStats(date = todayKey()): TodayStats {
  return {
    date,
    breaksTaken: 0,
    watersLogged: 0,
    focusMinutes: 0
  };
}
