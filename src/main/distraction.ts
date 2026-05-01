import { execFile } from "node:child_process";
import type { Settings } from "../shared/types";

export type ActiveWindowInfo = {
  appName: string;
  windowTitle: string;
};

const IGNORED_DISTRACTION_APPS = ["PawPal", "Electron"];

function normalizeRule(value: string): string {
  return value.trim().toLowerCase();
}

function activeWindowScript(): string {
  return `
tell application "System Events"
  set frontAppProcess to first application process whose frontmost is true
  set frontApp to name of frontAppProcess
  set frontWindow to ""
  try
    set frontWindow to name of front window of frontAppProcess
  end try
end tell
return frontApp & linefeed & frontWindow
`;
}

export function readActiveWindow(): Promise<ActiveWindowInfo> {
  return new Promise((resolve, reject) => {
    execFile("/usr/bin/osascript", ["-e", activeWindowScript()], { timeout: 2500 }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const [appName = "", ...titleParts] = stdout.trimEnd().split("\n");
      resolve({
        appName: appName.trim(),
        windowTitle: titleParts.join("\n").trim()
      });
    });
  });
}

export function classifyDistraction(active: ActiveWindowInfo, settings: Settings): string | null {
  const appName = active.appName.trim();
  const title = active.windowTitle.trim();
  const appNameLower = appName.toLowerCase();
  const titleLower = title.toLowerCase();

  if (IGNORED_DISTRACTION_APPS.some((ignored) => ignored.toLowerCase() === appNameLower)) {
    return null;
  }

  const blockedApp = settings.distractionBlockedApps
    .map(normalizeRule)
    .filter(Boolean)
    .find((rule) => appNameLower.includes(rule));
  if (blockedApp) return `app:${blockedApp}`;

  const blockedKeyword = settings.distractionBlockedKeywords
    .map(normalizeRule)
    .filter(Boolean)
    .find((rule) => titleLower.includes(rule) || appNameLower.includes(rule));
  if (blockedKeyword) return `keyword:${blockedKeyword}`;

  return null;
}

export function isPermissionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("not allowed assistive access") ||
    message.includes("System Events got an error") ||
    message.includes("not authorized") ||
    message.includes("Operation not permitted")
  );
}
