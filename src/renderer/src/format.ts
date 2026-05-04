import type { i18n } from "../../shared/i18n";
import type { Language } from "../../shared/types";

type SettingsCopy = ReturnType<typeof i18n>["settings"];

export function localeFor(language: Language): string {
  return language === "zh-CN" ? "zh-CN" : "en-US";
}

export function formatTimer(
  timestamp: number | null,
  now: number,
  language: Language,
  labels: SettingsCopy
): string {
  if (!timestamp) return labels.off;
  const remainingMs = timestamp - now;
  const absolute = new Intl.DateTimeFormat(localeFor(language), {
    hour: "2-digit",
    minute: "2-digit"
  }).format(timestamp);
  if (remainingMs <= 0) return `${absolute} ${labels.now}`;
  const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60_000));
  return `${absolute} (${remainingMinutes}m)`;
}

export function formatTimestamp(
  timestamp: number | null,
  language: Language,
  labels: SettingsCopy
): string {
  if (!timestamp) return labels.never;
  return new Intl.DateTimeFormat(localeFor(language), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(timestamp);
}
