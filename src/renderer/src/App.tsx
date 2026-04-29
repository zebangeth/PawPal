import type { JSX } from "react";
import { i18n } from "../../shared/i18n";
import { PetView } from "./components/PetView";
import { SettingsView } from "./components/SettingsView";
import { pawseApi } from "./pawseApi";

function PreloadUnavailable(): JSX.Element {
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

export default function App(): JSX.Element {
  if (!pawseApi()) return <PreloadUnavailable />;

  const route = window.location.hash.replace("#", "");
  if (route === "settings") return <SettingsView />;
  return <PetView />;
}
