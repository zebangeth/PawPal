import { useEffect, useMemo, useState } from "react";
import type { DragEvent, JSX, ReactNode } from "react";
import { i18n, LANGUAGE_OPTIONS, resolveLanguage } from "../../../shared/i18n";
import {
  hasRequiredCustomPetAssets,
  PET_STATE_ORDER,
  petAppearanceOptions,
  REQUIRED_CUSTOM_PET_STATES,
  resolveBuiltInPetAppearanceId,
  resolvePetAppearanceId
} from "../../../shared/petAppearances";
import type {
  BuiltInPetAppearanceId,
  CustomPetAppearance,
  CustomPetAsset,
  DemoTrigger,
  PetState,
  Settings,
  UpdateCheckResult
} from "../../../shared/types";
import { getPetAsset } from "../assets";
import { distractionHelp, formatDistractionState, formatTimer, formatTimestamp, localeFor } from "../format";
import { useNow, useSnapshot } from "../hooks";

type SettingsCopy = ReturnType<typeof i18n>["settings"];

function Row({
  label,
  hint,
  control
}: {
  label: string;
  hint?: string;
  control: JSX.Element;
}): JSX.Element {
  return (
    <div className="pref-row">
      <div className="pref-row__label">
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </div>
      <div className="pref-row__control">{control}</div>
    </div>
  );
}

function ToggleControl({
  checked,
  onChange,
  ariaLabel
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  ariaLabel: string;
}): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`pref-toggle${checked ? " is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="pref-toggle__thumb" />
    </button>
  );
}

function NumberControl({
  value,
  min,
  max,
  unit,
  onChange
}: {
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (next: number) => void;
}): JSX.Element {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  function commitDraft(raw: string): void {
    const next = Number(raw);
    if (!Number.isFinite(next)) {
      setDraft(String(value));
      return;
    }

    const normalized = Math.min(max, Math.max(min, Math.round(next)));
    setDraft(String(normalized));
    onChange(normalized);
  }

  function step(next: number): void {
    const normalized = Math.min(max, Math.max(min, next));
    setDraft(String(normalized));
    onChange(normalized);
  }

  return (
    <div className="pref-stepper">
      <button
        type="button"
        className="pref-stepper__btn"
        aria-label="−"
        disabled={value <= min}
        onClick={() => step(value - 1)}
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={draft}
        onChange={(event) => {
          const nextDraft = event.target.value;
          setDraft(nextDraft);

          const next = Number(nextDraft);
          if (Number.isFinite(next) && next >= min && next <= max) {
            onChange(Math.round(next));
          }
        }}
        onBlur={() => commitDraft(draft)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
      />
      <span className="pref-stepper__unit">{unit}</span>
      <button
        type="button"
        className="pref-stepper__btn"
        aria-label="+"
        disabled={value >= max}
        onClick={() => step(value + 1)}
      >
        +
      </button>
    </div>
  );
}

function SelectControl({
  value,
  options,
  onChange
}: {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}): JSX.Element {
  return (
    <select className="pref-select" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function ChipsControl({
  value,
  onChange,
  labels
}: {
  value: string[];
  onChange: (next: string[]) => void;
  labels: SettingsCopy;
}): JSX.Element {
  const [draft, setDraft] = useState("");

  function commit(raw: string): void {
    const trimmed = raw.trim().replace(/,$/, "").trim();
    if (!trimmed) return;
    if (value.some((entry) => entry.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, trimmed]);
    setDraft("");
  }

  return (
    <div className="pref-chips">
      <div className="pref-chips__list">
        {value.map((entry) => (
          <span key={entry} className="pref-chip">
            {entry}
            <button
              type="button"
              aria-label={labels.removeListItem(entry)}
              onClick={() => onChange(value.filter((item) => item !== entry))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="pref-chips__input"
          placeholder={labels.addListItem}
          value={draft}
          onChange={(event) => {
            const next = event.target.value;
            if (next.endsWith(",")) commit(next);
            else setDraft(next);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(draft);
            }
            if (event.key === "Backspace" && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => commit(draft)}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  unit
}: {
  label: string;
  value: number;
  unit?: string;
}): JSX.Element {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">
        {value}
        {unit ? <small>{unit}</small> : null}
      </strong>
    </div>
  );
}

function formatUpdateStatus(updateCheck: UpdateCheckResult, labels: SettingsCopy): string {
  if (updateCheck.status === "checking") return labels.updateChecking;
  if (updateCheck.status === "available" && updateCheck.latestVersion) {
    return labels.updateAvailable(updateCheck.latestVersion);
  }
  if (updateCheck.status === "up-to-date") {
    return labels.updateCurrent(updateCheck.currentVersion);
  }
  if (updateCheck.status === "error") {
    return labels.updateError(updateCheck.error ?? labels.none);
  }
  return labels.updateIdle;
}

function updateCustomPetAsset(
  customPetAppearance: CustomPetAppearance | null,
  state: PetState,
  asset: CustomPetAsset,
  name: string
): CustomPetAppearance {
  return {
    name: customPetAppearance?.name ?? name,
    assets: {
      ...customPetAppearance?.assets,
      [state]: asset
    }
  };
}

function removeCustomPetState(
  customPetAppearance: CustomPetAppearance | null,
  state: PetState,
  name: string
): CustomPetAppearance | null {
  if (!customPetAppearance) return null;
  const { [state]: _removed, ...assets } = customPetAppearance.assets;
  if (Object.keys(assets).length === 0) return null;
  return {
    name: customPetAppearance.name || name,
    assets
  };
}

function customPetStateKind(state: PetState, labels: SettingsCopy): string {
  return REQUIRED_CUSTOM_PET_STATES.includes(state)
    ? labels.customPetRequired
    : labels.customPetOptional;
}

function customPetStateKindClass(state: PetState): string {
  return REQUIRED_CUSTOM_PET_STATES.includes(state) ? " is-required" : "";
}

function customPetAssetPreviewSrc(asset: CustomPetAsset): string {
  return new URL(window.pawpal.assetUrl(asset.relativePath)).href;
}

export function SettingsView(): JSX.Element {
  const snapshot = useSnapshot();
  const { settings, stats, updateCheck } = snapshot;
  const [draft, setDraft] = useState(settings);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [customEditorOpen, setCustomEditorOpen] = useState(settings.petAppearanceId === "custom");
  const now = useNow();
  const savedSettingsKey = JSON.stringify(settings);
  const language = resolveLanguage(draft.language);
  const labels = i18n(language).settings;
  const customPetReady = hasRequiredCustomPetAssets(draft.customPetAppearance);

  const petAvatar = useMemo(
    () =>
      getPetAsset(
        resolvePetAppearanceId(draft.petAppearanceId),
        "happy",
        0,
        0,
        draft.customPetAppearance
      ),
    [draft.customPetAppearance, draft.petAppearanceId]
  );

  useEffect(() => {
    setDraft(settings);
    setSettingsDirty(false);
    if (settings.petAppearanceId === "custom") setCustomEditorOpen(true);
  }, [savedSettingsKey, settings]);

  useEffect(() => {
    if (!settingsDirty) return;
    const timer = window.setTimeout(() => {
      window.pawpal.updateSettings(draft);
      setSettingsDirty(false);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draft, settingsDirty]);

  function updateDraft(partial: Partial<Settings>): void {
    setDraft((current) => ({ ...current, ...partial }));
    setSettingsDirty(true);
  }

  async function checkForUpdates(): Promise<void> {
    await window.pawpal.checkForUpdates();
  }

  async function uploadCustomPetAsset(state: PetState): Promise<void> {
    const asset = await window.pawpal.selectCustomPetAsset(state);
    if (!asset) return;
    applyCustomPetAsset(state, asset);
  }

  async function uploadDroppedCustomPetAsset(state: PetState, file: File): Promise<void> {
    if (!file.name.toLowerCase().endsWith(".gif")) return;
    const sourcePath = window.pawpal.pathForFile(file);
    if (!sourcePath) return;
    const asset = await window.pawpal.importCustomPetAsset(state, sourcePath);
    if (!asset) return;
    applyCustomPetAsset(state, asset);
  }

  function applyCustomPetAsset(state: PetState, asset: CustomPetAsset): void {
    setCustomEditorOpen(true);
    const customPetAppearance = updateCustomPetAsset(
      draft.customPetAppearance,
      state,
      asset,
      labels.customPet
    );
    updateDraft({
      customPetAppearance,
      petAppearanceId: hasRequiredCustomPetAssets(customPetAppearance)
        ? "custom"
        : draft.petAppearanceId
    });
  }

  function removeCustomPetAsset(state: PetState): void {
    const customPetAppearance = removeCustomPetState(draft.customPetAppearance, state, labels.customPet);
    updateDraft({
      customPetAppearance,
      petAppearanceId:
        draft.petAppearanceId === "custom" && !hasRequiredCustomPetAssets(customPetAppearance)
          ? "lineDog"
          : draft.petAppearanceId
    });
  }

  return (
    <main className="prefs">
      <header className="prefs__head">
        <img className="prefs__avatar" src={petAvatar.src} alt="" />
        <div className="prefs__intro">
          <p className="prefs__eyebrow">PawPal</p>
          <h1 className="prefs__title">{labels.today}</h1>
        </div>
      </header>

      <section className="prefs__stats" aria-label={labels.today}>
        <StatCard label={labels.breaks} value={stats.breaksTaken} unit={labels.countUnit} />
        <StatCard label={labels.waters} value={stats.watersLogged} unit={labels.countUnit} />
        <StatCard label={labels.focusMin} value={stats.focusMinutes} unit={labels.minuteUnit} />
        <StatCard label={labels.warnings} value={stats.focusWarnings} unit={labels.countUnit} />
      </section>

      {!draft.onboardingDismissed ? (
        <aside className="prefs__welcome">
          <p>
            <strong>{labels.welcomeTitle}.</strong> {labels.welcomeCopy}
          </p>
          <button
            type="button"
            className="text-link"
            onClick={() => updateDraft({ onboardingDismissed: true })}
          >
            {labels.dismissWelcome}
          </button>
        </aside>
      ) : null}

      <section className="prefs__group">
        <h2 className="prefs__group-title">{labels.appearance}</h2>
        <Row
          label={labels.language}
          control={
            <SelectControl
              value={language}
              options={[...LANGUAGE_OPTIONS]}
              onChange={(value) => updateDraft({ language: resolveLanguage(value) })}
            />
          }
        />
        <div className="pref-block">
          <span className="pref-block__label">{labels.petAppearance}</span>
          <div className="pet-picker">
            {petAppearanceOptions(language).map((option) => (
              <PetCard
                key={option.value}
                appearanceId={option.value}
                label={option.label}
                selected={
                  !customEditorOpen &&
                  draft.petAppearanceId !== "custom" &&
                  resolveBuiltInPetAppearanceId(draft.petAppearanceId) === option.value
                }
                onSelect={() => {
                  setCustomEditorOpen(false);
                  updateDraft({ petAppearanceId: resolvePetAppearanceId(option.value) });
                }}
              />
            ))}
            <PetCard
              label={labels.customPet}
              previewSrc={
                customPetReady
                  ? getPetAsset("custom", "idle", 0, 0, draft.customPetAppearance).src
                  : undefined
              }
              selected={customEditorOpen || draft.petAppearanceId === "custom"}
              onSelect={() => {
                setCustomEditorOpen(true);
                if (customPetReady) updateDraft({ petAppearanceId: "custom" });
              }}
            />
          </div>
        </div>
        {customEditorOpen ? (
          <CustomPetEditor
            customPetAppearance={draft.customPetAppearance}
            labels={labels}
            onDrop={uploadDroppedCustomPetAsset}
            onRemove={removeCustomPetAsset}
            onUpload={(state) => void uploadCustomPetAsset(state)}
          />
        ) : null}
      </section>

      <section className="prefs__group">
        <h2 className="prefs__group-title">{labels.reminders}</h2>
        <Row
          label={labels.enableBreakReminder}
          control={
            <ToggleControl
              checked={draft.breakReminderEnabled}
              onChange={(breakReminderEnabled) => updateDraft({ breakReminderEnabled })}
              ariaLabel={labels.enableBreakReminder}
            />
          }
        />
        <Row
          label={labels.breakInterval}
          control={
            <NumberControl
              value={draft.breakIntervalMinutes}
              min={1}
              max={900}
              unit={labels.minuteUnit}
              onChange={(breakIntervalMinutes) => updateDraft({ breakIntervalMinutes })}
            />
          }
        />
        <Row
          label={labels.breakRunDuration}
          control={
            <NumberControl
              value={draft.breakRunDurationSeconds}
              min={10}
              max={900}
              unit={labels.secondUnit}
              onChange={(breakRunDurationSeconds) => updateDraft({ breakRunDurationSeconds })}
            />
          }
        />
        <Row
          label={labels.enableHydrationReminder}
          control={
            <ToggleControl
              checked={draft.hydrationReminderEnabled}
              onChange={(hydrationReminderEnabled) => updateDraft({ hydrationReminderEnabled })}
              ariaLabel={labels.enableHydrationReminder}
            />
          }
        />
        <Row
          label={labels.hydrationInterval}
          control={
            <NumberControl
              value={draft.hydrationIntervalMinutes}
              min={1}
              max={900}
              unit={labels.minuteUnit}
              onChange={(hydrationIntervalMinutes) => updateDraft({ hydrationIntervalMinutes })}
            />
          }
        />
      </section>

      <section className="prefs__group">
        <h2 className="prefs__group-title">{labels.focus}</h2>
        <Row
          label={labels.focusDuration}
          control={
            <NumberControl
              value={draft.focusDurationMinutes}
              min={1}
              max={900}
              unit={labels.minuteUnit}
              onChange={(focusDurationMinutes) => updateDraft({ focusDurationMinutes })}
            />
          }
        />
        <Row
          label={labels.enableDistractionDetection}
          hint={
            draft.distractionDetectionEnabled
              ? labels.detectionFocusHelp
              : labels.detectionOffHelp
          }
          control={
            <ToggleControl
              checked={draft.distractionDetectionEnabled}
              onChange={(distractionDetectionEnabled) => updateDraft({ distractionDetectionEnabled })}
              ariaLabel={labels.enableDistractionDetection}
            />
          }
        />
        {draft.distractionDetectionEnabled ? (
          <>
            <Row
              label={labels.detectionGrace}
              control={
                <NumberControl
                  value={draft.distractionGraceSeconds}
                  min={0}
                  max={900}
                  unit={labels.secondUnit}
                  onChange={(distractionGraceSeconds) => updateDraft({ distractionGraceSeconds })}
                />
              }
            />
            <Row
              label={labels.blockedApps}
              control={
                <ChipsControl
                  value={draft.distractionBlockedApps}
                  labels={labels}
                  onChange={(distractionBlockedApps) => updateDraft({ distractionBlockedApps })}
                />
              }
            />
            <Row
              label={labels.blockedKeywords}
              control={
                <ChipsControl
                  value={draft.distractionBlockedKeywords}
                  labels={labels}
                  onChange={(distractionBlockedKeywords) => updateDraft({ distractionBlockedKeywords })}
                />
              }
            />
          </>
        ) : null}
        <div className="prefs__inline-actions">
          {snapshot.focusActive ? (
            <button type="button" className="pref-button" onClick={window.pawpal.stopFocus}>
              {labels.stopFocus}
            </button>
          ) : (
            <button type="button" className="pref-button is-primary" onClick={window.pawpal.startFocus}>
              {labels.startFocus}
            </button>
          )}
        </div>
      </section>

      {!window.pawpal.isPackaged && (
        <section className="prefs__group">
          <h2 className="prefs__group-title">{labels.testTools}</h2>
          <div className="test-tools">
            <DemoChip trigger="break" label={labels.demoBreak} />
            <DemoChip trigger="hydration" label={labels.demoWater} />
            <DemoChip trigger="focusWarning" label={labels.demoFocusWarning} />
            <DemoChip trigger="happy" label={labels.demoHappy} />
            <button type="button" className="pref-chip-button" onClick={window.pawpal.resetToday}>
              {labels.resetToday}
            </button>
          </div>
        </section>
      )}

      <section className="prefs__group">
        <h2 className="prefs__group-title">{labels.system}</h2>
        <Row
          label={labels.launchAtLogin}
          hint={labels.launchAtLoginHelp}
          control={
            <ToggleControl
              checked={draft.launchAtLoginEnabled}
              onChange={(launchAtLoginEnabled) => updateDraft({ launchAtLoginEnabled })}
              ariaLabel={labels.launchAtLogin}
            />
          }
        />
        <Row
          label={labels.updateCheckOnLaunch}
          hint={labels.updateCheckOnLaunchHelp}
          control={
            <ToggleControl
              checked={draft.checkUpdatesOnLaunchEnabled}
              onChange={(checkUpdatesOnLaunchEnabled) =>
                updateDraft({ checkUpdatesOnLaunchEnabled })
              }
              ariaLabel={labels.updateCheckOnLaunch}
            />
          }
        />
      </section>

      <section className="prefs__group">
        <h2 className="prefs__group-title">{labels.about}</h2>
        <Row
          label={labels.version}
          hint={
            updateCheck.latestVersion
              ? labels.latestVersion(updateCheck.latestVersion)
              : undefined
          }
          control={
            <span className="pref-static-value">{snapshot.appInfo.version || labels.none}</span>
          }
        />
        <Row
          label={labels.updates}
          hint={formatUpdateStatus(updateCheck, labels)}
          control={
            <div className="pref-button-group">
              <button
                type="button"
                className="pref-button"
                disabled={updateCheck.status === "checking"}
                onClick={() => void checkForUpdates()}
              >
                {updateCheck.status === "checking"
                  ? labels.checkingUpdates
                  : labels.checkForUpdates}
              </button>
              {updateCheck.status === "available" ? (
                <button
                  type="button"
                  className="pref-button is-primary"
                  onClick={window.pawpal.openReleaseNotes}
                >
                  {labels.openReleaseNotes}
                </button>
              ) : null}
            </div>
          }
        />
        <Row
          label={labels.releaseNotes}
          control={
            <button type="button" className="pref-button" onClick={window.pawpal.openReleaseNotes}>
              {labels.openReleaseNotes}
            </button>
          }
        />
      </section>

      <section className="prefs__group prefs__group--quiet">
        <button
          type="button"
          className="prefs__disclosure"
          onClick={() => setDiagnosticsOpen((open) => !open)}
          aria-expanded={diagnosticsOpen}
        >
          <span>{labels.diagnostics}</span>
          <span className="prefs__disclosure-caret">{diagnosticsOpen ? "▾" : "▸"}</span>
        </button>
        {diagnosticsOpen ? (
          <div className="prefs__diag">
            <DiagGroup title={labels.runtime}>
              <DiagCard label={labels.state} value={snapshot.petState} />
              <DiagCard
                label={labels.mode}
                value={
                  snapshot.focusActive
                    ? labels.focus
                    : labels.idle
                }
              />
              <DiagCard label={labels.reminder} value={snapshot.blockingMode ?? labels.none} />
              <DiagCard
                label={labels.dog}
                value={snapshot.dogVisible ? labels.visible : labels.hidden}
              />
            </DiagGroup>

            <DiagGroup title={labels.distraction}>
              <DiagCard
                label={labels.status}
                value={formatDistractionState(snapshot.distraction.state, labels)}
              />
              <DiagCard
                label={labels.matched}
                value={snapshot.distraction.matchedRule ?? labels.none}
              />
              <DiagCard
                label={labels.app}
                value={snapshot.distraction.activeApp || labels.none}
              />
              <DiagCard
                label={labels.checked}
                value={formatTimestamp(snapshot.distraction.lastCheckedAt, language, labels)}
              />
            </DiagGroup>

            {snapshot.distraction.activeWindowTitle ? (
              <p className="prefs__diag-note">{snapshot.distraction.activeWindowTitle}</p>
            ) : null}
            <p className="prefs__diag-hint">{distractionHelp(snapshot, labels)}</p>

            <DiagGroup title={labels.timers}>
              <DiagCard
                label={labels.break}
                value={formatTimer(snapshot.timers.breakDueAt, now, language, labels)}
              />
              <DiagCard
                label={labels.water}
                value={formatTimer(snapshot.timers.hydrationDueAt, now, language, labels)}
              />
              <DiagCard
                label={labels.focusEnd}
                value={formatTimer(snapshot.timers.focusEndsAt, now, language, labels)}
              />
              <DiagCard
                label={labels.updated}
                value={new Intl.DateTimeFormat(localeFor(language), {
                  hour: "2-digit",
                  minute: "2-digit"
                }).format(now)}
              />
            </DiagGroup>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function PetCard({
  appearanceId,
  label,
  previewSrc,
  selected,
  disabled = false,
  onSelect
}: {
  appearanceId?: BuiltInPetAppearanceId;
  label: string;
  previewSrc?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}): JSX.Element {
  const asset = useMemo(
    () => (appearanceId ? getPetAsset(appearanceId, "idle") : null),
    [appearanceId]
  );
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`pet-card${selected ? " is-selected" : ""}`}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="pet-card__preview">
        {previewSrc || asset ? <img src={previewSrc ?? asset?.src} alt="" /> : <span>+</span>}
      </span>
      <span className="pet-card__name">{label}</span>
    </button>
  );
}

function CustomPetEditor({
  customPetAppearance,
  labels,
  onDrop,
  onUpload,
  onRemove
}: {
  customPetAppearance: CustomPetAppearance | null;
  labels: SettingsCopy;
  onDrop: (state: PetState, file: File) => void;
  onUpload: (state: PetState) => void;
  onRemove: (state: PetState) => void;
}): JSX.Element {
  function allowGifDrop(event: DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>, state: PetState): void {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;
    onDrop(state, file);
  }

  return (
    <div className="custom-pet">
      <div className="custom-pet__head">
        <div className="custom-pet__title">
          <span className="pref-block__label">{labels.customPetAssets}</span>
          <span className="custom-pet__help">
            <button
              type="button"
              className="custom-pet__help-button"
              aria-label={labels.customPetRequirements}
            >
              ?
            </button>
            <span className="custom-pet__tooltip" role="tooltip">
              {labels.customPetRequirements}
            </span>
          </span>
        </div>
        <span className="custom-pet__status">
          {hasRequiredCustomPetAssets(customPetAppearance)
            ? labels.customPetReady
            : labels.customPetMissingRequired}
        </span>
      </div>
      <div className="custom-pet__grid">
        {PET_STATE_ORDER.map((state) => {
          const reference = getPetAsset("lineDog", state);
          const customAsset = customPetAppearance?.assets[state] ?? null;
          const customPreview = customAsset ? customPetAssetPreviewSrc(customAsset) : null;
          return (
            <div className="custom-pet-slot" key={state}>
              <div className="custom-pet-slot__meta">
                <span className="custom-pet-slot__state">{labels.petStates[state]}</span>
                <span className="custom-pet-slot__description">
                  {labels.petStateDescriptions[state]}
                </span>
                <span className={`custom-pet-slot__kind${customPetStateKindClass(state)}`}>
                  {customPetStateKind(state, labels)}
                </span>
              </div>
              <div className="custom-pet-slot__media">
                <div className="custom-pet-slot__preview">
                  <span className="custom-pet-slot__badge">{labels.referenceAsset}</span>
                  <img src={reference.src} alt="" />
                </div>
                <div
                  className={`custom-pet-slot__preview custom-pet-slot__dropzone${
                    customPreview ? "" : " is-empty"
                  }`}
                  onDragOver={allowGifDrop}
                  onDrop={(event) => handleDrop(event, state)}
                >
                  {customPreview ? <img src={customPreview} alt="" /> : <strong>+</strong>}
                  {!customAsset ? (
                    <button
                      type="button"
                      className="pref-button custom-pet-slot__upload"
                      onClick={() => onUpload(state)}
                    >
                      {labels.uploadGif}
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="custom-pet-slot__actions">
                {customAsset ? (
                  <>
                    <button type="button" className="pref-button" onClick={() => onUpload(state)}>
                      {labels.replaceGif}
                    </button>
                    <button
                      type="button"
                      className="pref-button"
                      onClick={() => onRemove(state)}
                    >
                      {labels.removeGif}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DemoChip({ trigger, label }: { trigger: DemoTrigger; label: string }): JSX.Element {
  return (
    <button
      type="button"
      className="pref-chip-button"
      onClick={() => window.pawpal.triggerDemo(trigger)}
    >
      {label}
    </button>
  );
}

function DiagGroup({
  title,
  children
}: {
  title: string;
  children: ReactNode;
}): JSX.Element {
  return (
    <section className="diag-group">
      <h3 className="diag-group__title">{title}</h3>
      <div className="diag-group__grid">{children}</div>
    </section>
  );
}

function DiagCard({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="diag-card">
      <span className="diag-card__label">{label}</span>
      <span className="diag-card__value">{value}</span>
    </div>
  );
}
