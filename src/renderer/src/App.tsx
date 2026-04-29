import { useEffect, useMemo, useState } from "react";
import type { JSX } from "react";
import type {
  AppSnapshot,
  DemoTrigger,
  PetState,
  Settings,
  SpeechBubble,
  TodayStats
} from "../../shared/types";

const assetUrls: Record<PetState, string> = {
  walking: new URL("../../../lovart_footage/puppy/1 - playing outside.gif", import.meta.url)
    .href,
  idle: new URL("../../../lovart_footage/puppy/standing pose.gif", import.meta.url).href,
  sitting: new URL("../../../lovart_footage/puppy/3 - welcome to work.gif", import.meta.url)
    .href,
  happy: new URL("../../../lovart_footage/puppy/1 - waiting for playing outside.gif", import.meta.url)
    .href,
  knocking: new URL("../../../lovart_footage/puppy/2 - standing reminder.gif", import.meta.url)
    .href,
  thirsty: new URL("../../../lovart_footage/water_gifs/want_water.gif", import.meta.url).href,
  drinking: new URL("../../../lovart_footage/water_gifs/got_water.gif", import.meta.url).href,
  focusGuard: new URL("../../../lovart_footage/puppy/standing pose4.gif", import.meta.url).href,
  annoyed: new URL("../../../lovart_footage/puppy/4 - sleeping.gif", import.meta.url).href
};

const initialSettings: Settings = {
  breakReminderEnabled: true,
  breakIntervalMinutes: 45,
  hydrationReminderEnabled: true,
  hydrationIntervalMinutes: 90,
  focusDurationMinutes: 25,
  distractionDetectionEnabled: false,
  soundEnabled: false
};

const initialStats: TodayStats = {
  date: "",
  breaksTaken: 0,
  watersLogged: 0,
  focusMinutes: 0,
  focusWarnings: 0
};

function useSnapshot(): AppSnapshot {
  const [snapshot, setSnapshot] = useState<AppSnapshot>({
    settings: initialSettings,
    stats: initialStats,
    petState: "walking",
    focusActive: false
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

function PetView(): JSX.Element {
  const snapshot = useSnapshot();
  const [bubble, setBubble] = useState<SpeechBubble | null>(null);

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

  return (
    <main className="pet-shell" aria-label="Pawse desktop pet">
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
        <div className="focus-badge">Focus</div>
      ) : null}

      <button className={`pet-button state-${state}`} onClick={window.pawse.petClicked} type="button">
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

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const canSave = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  function updateDraft(partial: Partial<Settings>): void {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function save(): void {
    window.pawse.updateSettings(draft);
  }

  return (
    <main className="settings-shell">
      <header>
        <p className="eyebrow">Pawse</p>
        <h1>Settings</h1>
      </header>

      <section className="settings-section">
        <h2>Reminders</h2>
        <ToggleField
          label="Enable Break Reminder"
          checked={draft.breakReminderEnabled}
          onChange={(breakReminderEnabled) => updateDraft({ breakReminderEnabled })}
        />
        <NumberField
          label="Break Interval"
          value={draft.breakIntervalMinutes}
          min={1}
          max={180}
          onChange={(breakIntervalMinutes) => updateDraft({ breakIntervalMinutes })}
        />
        <ToggleField
          label="Enable Hydration Reminder"
          checked={draft.hydrationReminderEnabled}
          onChange={(hydrationReminderEnabled) => updateDraft({ hydrationReminderEnabled })}
        />
        <NumberField
          label="Hydration Interval"
          value={draft.hydrationIntervalMinutes}
          min={1}
          max={240}
          onChange={(hydrationIntervalMinutes) => updateDraft({ hydrationIntervalMinutes })}
        />
      </section>

      <section className="settings-section">
        <h2>Focus</h2>
        <NumberField
          label="Focus Duration"
          value={draft.focusDurationMinutes}
          min={1}
          max={120}
          onChange={(focusDurationMinutes) => updateDraft({ focusDurationMinutes })}
        />
        <ToggleField
          label="Enable Distraction Detection"
          checked={draft.distractionDetectionEnabled}
          onChange={(distractionDetectionEnabled) => updateDraft({ distractionDetectionEnabled })}
        />
        <ToggleField
          label="Enable Sound Effects"
          checked={draft.soundEnabled}
          onChange={(soundEnabled) => updateDraft({ soundEnabled })}
        />
      </section>

      <section className="settings-section">
        <h2>Today</h2>
        <dl className="stats-grid">
          <div>
            <dt>Breaks</dt>
            <dd>{stats.breaksTaken}</dd>
          </div>
          <div>
            <dt>Waters</dt>
            <dd>{stats.watersLogged}</dd>
          </div>
          <div>
            <dt>Focus min</dt>
            <dd>{stats.focusMinutes}</dd>
          </div>
          <div>
            <dt>Warnings</dt>
            <dd>{stats.focusWarnings}</dd>
          </div>
        </dl>
      </section>

      <section className="settings-section">
        <h2>Demo</h2>
        <div className="demo-grid">
          <DemoButton trigger="break">Break</DemoButton>
          <DemoButton trigger="hydration">Water</DemoButton>
          <DemoButton trigger="focusWarning">Focus Warning</DemoButton>
          <DemoButton trigger="happy">Happy</DemoButton>
        </div>
      </section>

      <footer className="settings-actions">
        <button className="secondary-action" type="button" onClick={window.pawse.resetToday}>
          Reset Today
        </button>
        <button className="secondary-action" type="button" onClick={window.pawse.startFocus}>
          Start Focus
        </button>
        <button className="secondary-action" type="button" onClick={window.pawse.stopFocus}>
          Stop Focus
        </button>
        <button className="primary-action" type="button" disabled={!canSave} onClick={save}>
          Save
        </button>
      </footer>
    </main>
  );
}

export default function App(): JSX.Element {
  const route = window.location.hash.replace("#", "");
  if (route === "settings") return <SettingsView />;
  return <PetView />;
}
