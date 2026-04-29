import { useEffect, useMemo, useRef, useState } from "react";
import type { JSX, PointerEvent } from "react";
import { DEFAULT_SETTINGS } from "../../shared/constants";
import { i18n, LANGUAGE_OPTIONS, resolveLanguage } from "../../shared/i18n";
import type {
  AppSnapshot,
  DemoTrigger,
  Language,
  PetState,
  Settings,
  SpeechBubble,
  TodayStats
} from "../../shared/types";

type PawseWindow = Window & { pawse?: Window["pawse"] };

function pawseApi(): Window["pawse"] | undefined {
  return (window as PawseWindow).pawse;
}

function createAssetUrls(): Record<PetState, string> {
  return {
    walking: window.pawse.assetUrl("lovart_footage/puppy/1 - playing outside.gif"),
    idle: window.pawse.assetUrl("lovart_footage/puppy/standing pose.gif"),
    sitting: window.pawse.assetUrl("lovart_footage/puppy/3 - welcome to work.gif"),
    happy: window.pawse.assetUrl("lovart_footage/puppy/1 - waiting for playing outside.gif"),
    knocking: window.pawse.assetUrl("lovart_footage/puppy/2 - standing reminder.gif"),
    thirsty: window.pawse.assetUrl("lovart_footage/water_gifs/want_water.gif"),
    drinking: window.pawse.assetUrl("lovart_footage/water_gifs/got_water.gif"),
    focusGuard: window.pawse.assetUrl("lovart_footage/puppy/standing pose4.gif"),
    annoyed: window.pawse.assetUrl("lovart_footage/puppy/4 - sleeping.gif")
  };
}

const initialSettings: Settings = DEFAULT_SETTINGS;

const initialStats: TodayStats = {
  date: "",
  breaksTaken: 0,
  watersLogged: 0,
  focusMinutes: 0,
  focusWarnings: 0
};

type DragRef = {
  pointerId: number;
  startX: number;
  startY: number;
  dragging: boolean;
};

function useSnapshot(): AppSnapshot {
  const [snapshot, setSnapshot] = useState<AppSnapshot>({
    settings: initialSettings,
    stats: initialStats,
    timers: {
      breakDueAt: null,
      hydrationDueAt: null,
      focusEndsAt: null
    },
    distraction: {
      state: "idle",
      activeApp: "",
      activeWindowTitle: "",
      matchedRule: null,
      lastCheckedAt: null,
      lastWarningAt: null,
      error: null
    },
    petState: "walking",
    blockingMode: null,
    focusActive: false,
    petParked: false,
    dogVisible: true
  });

  useEffect(() => {
    let mounted = true;
    void window.pawse.getSnapshot().then((next) => {
      if (mounted) setSnapshot(next);
    });
    const offPet = window.pawse.onPetState((petState) =>
      setSnapshot((current) => ({ ...current, petState }))
    );
    const offSettings = window.pawse.onSettingsUpdated((settings) =>
      setSnapshot((current) => ({ ...current, settings }))
    );
    const offStats = window.pawse.onStatsUpdated((stats) =>
      setSnapshot((current) => ({ ...current, stats }))
    );
    const offSnapshot = window.pawse.onSnapshot(setSnapshot);
    return () => {
      mounted = false;
      offPet();
      offSettings();
      offStats();
      offSnapshot();
    };
  }, []);

  return snapshot;
}

function useNow(refreshMs = 30_000): number {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), refreshMs);
    return () => window.clearInterval(timer);
  }, [refreshMs]);

  return now;
}

function localeFor(language: Language): string {
  return language === "zh-CN" ? "zh-CN" : "en-US";
}

function formatTimer(
  timestamp: number | null,
  now: number,
  language: Language,
  labels: ReturnType<typeof i18n>["settings"]
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

function formatTimestamp(
  timestamp: number | null,
  language: Language,
  labels: ReturnType<typeof i18n>["settings"]
): string {
  if (!timestamp) return labels.never;
  return new Intl.DateTimeFormat(localeFor(language), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(timestamp);
}

function distractionHelp(
  snapshot: AppSnapshot,
  labels: ReturnType<typeof i18n>["settings"]
): string {
  if (!snapshot.settings.distractionDetectionEnabled) {
    return labels.detectionOffHelp;
  }
  if (snapshot.distraction.error) return snapshot.distraction.error;
  if (!snapshot.distraction.lastCheckedAt) {
    return labels.detectionWaitingHelp;
  }
  if (!snapshot.focusActive) {
    return labels.detectionPreviewHelp;
  }
  return labels.detectionFocusHelp;
}

function PetView(): JSX.Element {
  const snapshot = useSnapshot();
  const [bubble, setBubble] = useState<SpeechBubble | null>(null);
  const assetUrls = useMemo(createAssetUrls, []);
  const dragRef = useRef<DragRef | null>(null);
  const labels = i18n(resolveLanguage(snapshot.settings.language)).settings;

  useEffect(() => {
    const offBubble = window.pawse.onShowBubble(setBubble);
    const offHide = window.pawse.onHideBubble(() => setBubble(null));
    return () => {
      offBubble();
      offHide();
    };
  }, []);

  const state = snapshot.petState;
  const altText = `Pawse ${state}`;

  function startPointer(event: PointerEvent<HTMLButtonElement>): void {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false
    };
  }

  function movePointer(event: PointerEvent<HTMLButtonElement>): void {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (!drag.dragging && distance > 4) {
      drag.dragging = true;
      window.pawse.petDragStart({ offsetX: drag.startX, offsetY: drag.startY });
    }
  }

  function stopPointer(event: PointerEvent<HTMLButtonElement>): void {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    if (drag.dragging) {
      window.pawse.petDragStop();
      return;
    }
    window.pawse.petClicked();
  }

  function cancelPointer(event: PointerEvent<HTMLButtonElement>): void {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (drag.dragging) window.pawse.petDragStop();
  }

  return (
    <main
      className="pet-shell"
      aria-label="Pawse desktop pet"
      onContextMenu={(event) => {
        event.preventDefault();
        window.pawse.petContextMenu();
      }}
    >
      {bubble ? (
        <section className="speech-bubble">
          <p>{bubble.message}</p>
          {bubble.actions?.length ? (
            <div className="bubble-actions">
              {bubble.actions.map((action) => (
                <button
                  className={`bubble-button ${action.kind ?? "secondary"}`}
                  key={action.id}
                  onClick={() => window.pawse.bubbleAction(action.id)}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {snapshot.focusActive && state === "focusGuard" ? (
        <div className="focus-badge">{labels.focus}</div>
      ) : null}

      <button
        className={`pet-button state-${state}`}
        onPointerCancel={cancelPointer}
        onPointerDown={startPointer}
        onPointerMove={movePointer}
        onPointerUp={stopPointer}
        type="button"
      >
        <img draggable={false} src={assetUrls[state]} alt={altText} />
      </button>
    </main>
  );
}

function ToggleField({
  label,
  checked,
  onChange
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}): JSX.Element {
  return (
    <label className="number-row">
      <span>{label}</span>
      <input
        min={min}
        max={max}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <label className="select-row">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ListField({
  label,
  value,
  onChange
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}): JSX.Element {
  return (
    <label className="list-row">
      <span>{label}</span>
      <textarea
        value={value.join(", ")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          )
        }
      />
    </label>
  );
}

function DemoButton({
  trigger,
  children
}: {
  trigger: DemoTrigger;
  children: string;
}): JSX.Element {
  return (
    <button className="command-button" type="button" onClick={() => window.pawse.triggerDemo(trigger)}>
      {children}
    </button>
  );
}

function SettingsView(): JSX.Element {
  const snapshot = useSnapshot();
  const { settings, stats } = snapshot;
  const [draft, setDraft] = useState(settings);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const now = useNow();
  const savedSettingsKey = JSON.stringify(settings);
  const language = resolveLanguage(draft.language);
  const labels = i18n(language).settings;

  useEffect(() => {
    setDraft(settings);
    setSettingsDirty(false);
  }, [savedSettingsKey]);

  function updateDraft(partial: Partial<Settings>): void {
    setDraft((current) => ({ ...current, ...partial }));
    setSettingsDirty(true);
  }

  function save(): void {
    window.pawse.updateSettings(draft);
    setSettingsDirty(false);
  }

  return (
    <main className="settings-shell">
      <header>
        <p className="eyebrow">Pawse</p>
        <h1>{labels.title}</h1>
      </header>

      <section className="settings-section">
        <SelectField
          label={labels.language}
          value={language}
          options={LANGUAGE_OPTIONS}
          onChange={(value) => updateDraft({ language: resolveLanguage(value) })}
        />
      </section>

      <section className="settings-section">
        <h2>{labels.reminders}</h2>
        <ToggleField
          label={labels.enableBreakReminder}
          checked={draft.breakReminderEnabled}
          onChange={(breakReminderEnabled) => updateDraft({ breakReminderEnabled })}
        />
        <NumberField
          label={labels.breakInterval}
          value={draft.breakIntervalMinutes}
          min={1}
          max={180}
          onChange={(breakIntervalMinutes) => updateDraft({ breakIntervalMinutes })}
        />
        <ToggleField
          label={labels.enableHydrationReminder}
          checked={draft.hydrationReminderEnabled}
          onChange={(hydrationReminderEnabled) => updateDraft({ hydrationReminderEnabled })}
        />
        <NumberField
          label={labels.hydrationInterval}
          value={draft.hydrationIntervalMinutes}
          min={1}
          max={240}
          onChange={(hydrationIntervalMinutes) => updateDraft({ hydrationIntervalMinutes })}
        />
      </section>

      <section className="settings-section">
        <h2>{labels.focus}</h2>
        <NumberField
          label={labels.focusDuration}
          value={draft.focusDurationMinutes}
          min={1}
          max={120}
          onChange={(focusDurationMinutes) => updateDraft({ focusDurationMinutes })}
        />
        <ToggleField
          label={labels.enableDistractionDetection}
          checked={draft.distractionDetectionEnabled}
          onChange={(distractionDetectionEnabled) => updateDraft({ distractionDetectionEnabled })}
        />
        <NumberField
          label={labels.detectionGrace}
          value={draft.distractionGraceSeconds}
          min={0}
          max={120}
          onChange={(distractionGraceSeconds) => updateDraft({ distractionGraceSeconds })}
        />
        <ListField
          label={labels.blockedApps}
          value={draft.distractionBlockedApps}
          onChange={(distractionBlockedApps) => updateDraft({ distractionBlockedApps })}
        />
        <ListField
          label={labels.blockedKeywords}
          value={draft.distractionBlockedKeywords}
          onChange={(distractionBlockedKeywords) => updateDraft({ distractionBlockedKeywords })}
        />
        <ToggleField
          label={labels.enableSoundEffects}
          checked={draft.soundEnabled}
          onChange={(soundEnabled) => updateDraft({ soundEnabled })}
        />
      </section>

      <section className="settings-section">
        <h2>{labels.today}</h2>
        <dl className="stats-grid">
          <div>
            <dt>{labels.breaks}</dt>
            <dd>{stats.breaksTaken}</dd>
          </div>
          <div>
            <dt>{labels.waters}</dt>
            <dd>{stats.watersLogged}</dd>
          </div>
          <div>
            <dt>{labels.focusMin}</dt>
            <dd>{stats.focusMinutes}</dd>
          </div>
          <div>
            <dt>{labels.warnings}</dt>
            <dd>{stats.focusWarnings}</dd>
          </div>
        </dl>
      </section>

      <section className="settings-section">
        <h2>{labels.runtime}</h2>
        <dl className="runtime-grid">
          <div>
            <dt>{labels.state}</dt>
            <dd>{snapshot.petState}</dd>
          </div>
          <div>
            <dt>{labels.mode}</dt>
            <dd>{snapshot.focusActive ? labels.focus : snapshot.petParked ? labels.parked : labels.walking}</dd>
          </div>
          <div>
            <dt>{labels.reminder}</dt>
            <dd>{snapshot.blockingMode ?? labels.none}</dd>
          </div>
          <div>
            <dt>{labels.dog}</dt>
            <dd>{snapshot.dogVisible ? labels.visible : labels.hidden}</dd>
          </div>
        </dl>
      </section>

      <section className="settings-section">
        <h2>{labels.distraction}</h2>
        <dl className="runtime-grid">
          <div>
            <dt>{labels.status}</dt>
            <dd>{snapshot.distraction.state}</dd>
          </div>
          <div>
            <dt>{labels.matched}</dt>
            <dd>{snapshot.distraction.matchedRule ?? labels.none}</dd>
          </div>
          <div>
            <dt>{labels.app}</dt>
            <dd>{snapshot.distraction.activeApp || labels.none}</dd>
          </div>
          <div>
            <dt>{labels.checked}</dt>
            <dd>{formatTimestamp(snapshot.distraction.lastCheckedAt, language, labels)}</dd>
          </div>
        </dl>
        <p className="diagnostic-copy">
          {snapshot.distraction.activeWindowTitle || labels.noActiveWindowTitle}
        </p>
        <p className="diagnostic-copy warning-copy">{distractionHelp(snapshot, labels)}</p>
      </section>

      <section className="settings-section">
        <h2>{labels.timers}</h2>
        <dl className="runtime-grid">
          <div>
            <dt>{labels.break}</dt>
            <dd>{formatTimer(snapshot.timers.breakDueAt, now, language, labels)}</dd>
          </div>
          <div>
            <dt>{labels.water}</dt>
            <dd>{formatTimer(snapshot.timers.hydrationDueAt, now, language, labels)}</dd>
          </div>
          <div>
            <dt>{labels.focusEnd}</dt>
            <dd>{formatTimer(snapshot.timers.focusEndsAt, now, language, labels)}</dd>
          </div>
          <div>
            <dt>{labels.updated}</dt>
            <dd>
              {new Intl.DateTimeFormat(localeFor(language), {
                hour: "2-digit",
                minute: "2-digit"
              }).format(now)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="settings-section">
        <h2>{labels.demo}</h2>
        <div className="demo-grid">
          <DemoButton trigger="break">{labels.demoBreak}</DemoButton>
          <DemoButton trigger="hydration">{labels.demoWater}</DemoButton>
          <DemoButton trigger="focusWarning">{labels.demoFocusWarning}</DemoButton>
          <DemoButton trigger="happy">{labels.demoHappy}</DemoButton>
        </div>
      </section>

      <footer className="settings-actions">
        <button className="secondary-action" type="button" onClick={window.pawse.resetToday}>
          {labels.resetToday}
        </button>
        <button className="secondary-action" type="button" onClick={window.pawse.startFocus}>
          {labels.startFocus}
        </button>
        <button className="secondary-action" type="button" onClick={window.pawse.stopFocus}>
          {labels.stopFocus}
        </button>
        <button className="secondary-action" type="button" onClick={window.pawse.resumeWalking}>
          {labels.resumeWalk}
        </button>
        <button className="primary-action" type="button" disabled={!settingsDirty} onClick={save}>
          {labels.save}
        </button>
      </footer>
    </main>
  );
}

export default function App(): JSX.Element {
  if (!pawseApi()) {
    const labels = i18n("zh-CN").settings;
    return (
      <main className="settings-shell">
        <header>
          <p className="eyebrow">Pawse</p>
          <h1>{labels.preloadUnavailable}</h1>
        </header>
        <section className="settings-section">
          <p className="diagnostic-copy">{labels.preloadCopy}</p>
        </section>
      </main>
    );
  }

  const route = window.location.hash.replace("#", "");
  if (route === "settings") return <SettingsView />;
  return <PetView />;
}
