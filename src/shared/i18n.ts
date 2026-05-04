import type { Language } from "./types";

export const LANGUAGE_OPTIONS: Array<{ value: Language; label: string }> = [
  { value: "zh-CN", label: "中文" },
  { value: "en", label: "English" }
];

export function resolveLanguage(value: unknown): Language {
  return value === "en" ? "en" : "zh-CN";
}

export function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export const I18N = {
  "zh-CN": {
    bubble: {
      woof: ["汪!", "陪你一下~", "我在这儿"],
      breakReminder: [
        "坐太久了，起来走一分钟吧",
        "我想活动一下，你也一起吧",
        "休息一下眼睛和肩膀吧"
      ],
      breakDone: ["好耶，休息完成", "回来啦，继续陪你", "状态恢复中"],
      breakRun: [
        (seconds: number) => `再活动 ${seconds} 秒，先别回屏幕前~`,
        (seconds: number) => `倒计时 ${seconds} 秒，走动一下吧`
      ],
      breakRunComplete: ["休息完成，回来坐好吧", "我回来了，继续陪你"],
      breakIgnore: ["好吧，今天先放过你", "那下次记得站起来"],
      hydrationReminder: ["喝口水吧", "水杯该出场了", "补一点水再继续"],
      hydrationDone: ["喝水完成", "水分补给到位", "很好，继续"],
      focusStart: [
        (minutes: number) => `开始 ${minutes} 分钟专注计时，我会陪着你`,
        (minutes: number) => `专注 ${minutes} 分钟，只做计时提醒`
      ],
      focusComplete: ["专注时间到", "计时结束，休息一下吧"],
      focusCancelled: ["专注已停止", "计时取消了"]
    },
    actions: {
      breakDone: "我站起来了",
      breakRunDone: "我回来了",
      breakSnooze: "10 分钟后提醒",
      breakMute: "今天先别提醒",
      hydrationDone: "我喝水了",
      hydrationSnooze: "稍后提醒",
      focusEnd: "结束专注"
    },
    menu: {
      showDog: "显示宠物",
      hideDog: "隐藏宠物",
      startFocusMode: "开始专注计时",
      stopFocusMode: "停止专注计时",
      demoBreakReminder: "演示: 休息提醒",
      demoHydrationReminder: "演示: 喝水提醒",
      demoHappyReaction: "演示: 开心反馈",
      settings: "设置",
      resetToday: "重置今日",
      quit: "退出"
    },
    settings: {
      title: "设置",
      welcomeTitle: "欢迎使用 DeskPet",
      welcomeCopy:
        "DeskPet 会在桌面上陪你，提醒你休息、喝水，并提供手动专注计时。它不会读取当前打开的应用、窗口标题、进程、截图或输入。",
      dismissWelcome: "知道了",
      appearance: "外观",
      quickActions: "快捷操作",
      testTools: "测试工具",
      language: "语言",
      petAppearance: "宠物形象",
      reminders: "提醒",
      enableBreakReminder: "开启休息提醒",
      breakInterval: "休息间隔",
      enableHydrationReminder: "开启喝水提醒",
      hydrationInterval: "喝水间隔",
      focus: "专注",
      focusDuration: "专注时长",
      today: "今日",
      breaks: "休息",
      waters: "喝水",
      focusMin: "专注",
      minuteUnit: "分钟",
      secondUnit: "秒",
      countUnit: "次",
      addListItem: "添加...",
      removeListItem: (entry: string) => `移除 ${entry}`,
      runtime: "运行状态",
      state: "状态",
      mode: "模式",
      reminder: "提醒",
      dog: "宠物",
      status: "状态",
      timers: "计时器",
      break: "休息",
      water: "喝水",
      focusEnd: "专注结束",
      updated: "更新",
      demo: "演示",
      demoBreak: "休息",
      demoWater: "喝水",
      demoHappy: "开心",
      resetToday: "重置今日",
      startFocus: "开始专注",
      stopFocus: "停止专注",
      diagnostics: "诊断信息",
      preloadUnavailable: "Preload 不可用",
      preloadCopy:
        "Electron preload 没有注入，桌宠控制接口暂时不可用。请重启 pnpm dev，或检查 preload 路径和 sandbox 设置。",
      off: "关闭",
      now: "现在",
      never: "从未",
      none: "无",
      visible: "显示",
      hidden: "隐藏",
      idle: "空闲"
    }
  },
  en: {
    bubble: {
      woof: ["woof!", "I'm here~", "keeping you company"],
      breakReminder: [
        "You've been sitting for a while. Walk for a minute?",
        "Let's move around for a minute.",
        "Rest your eyes and shoulders for a bit."
      ],
      breakDone: ["Nice break!", "Back with you.", "Reset complete."],
      breakRun: [
        (seconds: number) => `${seconds}s left. Stay away from the screen~`,
        (seconds: number) => `Move around for ${seconds}s.`
      ],
      breakRunComplete: ["Break complete. Come back when ready.", "I'm back with you."],
      breakIgnore: ["Okay, skipping reminders for today.", "Remember to stand next time."],
      hydrationReminder: ["Drink some water.", "Time for your cup.", "Hydrate before continuing."],
      hydrationDone: ["Water logged.", "Hydration done.", "Good, keep going."],
      focusStart: [
        (minutes: number) => `Starting a ${minutes}-minute manual focus timer.`,
        (minutes: number) => `Focus timer: ${minutes} minutes.`
      ],
      focusComplete: ["Focus time is up.", "Timer done. Take a short break."],
      focusCancelled: ["Focus stopped.", "Timer cancelled."]
    },
    actions: {
      breakDone: "I stood up",
      breakRunDone: "I'm back",
      breakSnooze: "Remind in 10 min",
      breakMute: "Skip today",
      hydrationDone: "I drank water",
      hydrationSnooze: "Remind later",
      focusEnd: "End Focus"
    },
    menu: {
      showDog: "Show Pet",
      hideDog: "Hide Pet",
      startFocusMode: "Start Focus Timer",
      stopFocusMode: "Stop Focus Timer",
      demoBreakReminder: "Demo: Break Reminder",
      demoHydrationReminder: "Demo: Hydration Reminder",
      demoHappyReaction: "Demo: Happy Reaction",
      settings: "Settings",
      resetToday: "Reset Today",
      quit: "Quit"
    },
    settings: {
      title: "Settings",
      welcomeTitle: "Welcome to DeskPet",
      welcomeCopy:
        "DeskPet keeps you company on the desktop, reminds you to rest and drink water, and provides a manual focus timer. It does not read open apps, window titles, processes, screenshots, or input.",
      dismissWelcome: "Got it",
      appearance: "Appearance",
      quickActions: "Quick Actions",
      testTools: "Test Tools",
      language: "Language",
      petAppearance: "Pet",
      reminders: "Reminders",
      enableBreakReminder: "Enable Break Reminder",
      breakInterval: "Break Interval",
      enableHydrationReminder: "Enable Hydration Reminder",
      hydrationInterval: "Hydration Interval",
      focus: "Focus",
      focusDuration: "Focus Duration",
      today: "Today",
      breaks: "Breaks",
      waters: "Water",
      focusMin: "Focus",
      minuteUnit: "min",
      secondUnit: "s",
      countUnit: "",
      addListItem: "Add...",
      removeListItem: (entry: string) => `Remove ${entry}`,
      runtime: "Runtime",
      state: "State",
      mode: "Mode",
      reminder: "Reminder",
      dog: "Pet",
      status: "Status",
      timers: "Timers",
      break: "Break",
      water: "Water",
      focusEnd: "Focus End",
      updated: "Updated",
      demo: "Demo",
      demoBreak: "Break",
      demoWater: "Water",
      demoHappy: "Happy",
      resetToday: "Reset Today",
      startFocus: "Start Focus",
      stopFocus: "Stop Focus",
      diagnostics: "Diagnostics",
      preloadUnavailable: "Preload unavailable",
      preloadCopy:
        "Electron preload was not injected, so the pet control API is unavailable. Restart pnpm dev, or check the preload path and sandbox settings.",
      off: "off",
      now: "now",
      never: "never",
      none: "none",
      visible: "visible",
      hidden: "hidden",
      idle: "idle"
    }
  }
} as const;

export type I18nBundle = (typeof I18N)[Language];

export function i18n(language: Language): I18nBundle {
  return I18N[language];
}
