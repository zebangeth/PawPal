import { execFile, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
const productName = packageJson.build?.productName ?? "DeskPet";
const version = packageJson.version;
const distDir = path.join(repoRoot, "dist");
const unpackedExe = path.join(distDir, "win-unpacked", `${productName}.exe`);
const portableExe = path.join(distDir, `${productName} ${version}.exe`);
const zipFile = path.join(distDir, `${productName}-${version}-win.zip`);
const defaultPort = 9200 + Math.floor(Math.random() * 700);
const port = Number(process.env.DESKPET_SMOKE_PORT ?? defaultPort);
const userDataDir = path.join(tmpdir(), `deskpet-smoke-${Date.now()}-${process.pid}`);

const snapshotKeys = [
  "blockingMode",
  "dogVisible",
  "focusActive",
  "petFacing",
  "petState",
  "settings",
  "stats",
  "statsHistory",
  "timers"
];

const settingsKeys = [
  "breakIntervalMinutes",
  "breakReminderEnabled",
  "focusDurationMinutes",
  "hydrationIntervalMinutes",
  "hydrationReminderEnabled",
  "language",
  "onboardingDismissed",
  "petAppearanceId"
];

const persistedSettings = {
  breakReminderEnabled: false,
  breakIntervalMinutes: 17,
  hydrationReminderEnabled: false,
  hydrationIntervalMinutes: 31,
  focusDurationMinutes: 12,
  language: "en",
  petAppearanceId: "lovartPuppy",
  onboardingDismissed: true
};

const forbiddenTerms = [
  "readActiveWindow",
  "classifyDistraction",
  "distractionDetection",
  "distractionBlocked",
  "focusWarning",
  "frontmost",
  "windowTitle",
  "desktopCapturer",
  "capturePage",
  "globalShortcut",
  "setLoginItemSettings",
  "autoUpdater",
  "electron-updater",
  "auto-launch",
  "telemetry",
  "analytics",
  "uiohook",
  "iohook",
  "robotjs",
  "active-win",
  "node-window-manager",
  "screenshot-desktop",
  "tesseract",
  "ocr-space",
  "ffi-napi",
  "automation.apple-events"
];

const textExtensions = new Set([
  ".css",
  ".html",
  ".json",
  ".lock",
  ".plist",
  ".ts",
  ".tsx",
  ".yml",
  ".yaml"
]);

function log(message) {
  console.log(`[smoke:m1] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function execFileAsync(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    execFile(command, args, { windowsHide: true, ...options }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

async function assertFile(filePath, label) {
  const info = await stat(filePath);
  assert(info.isFile(), `${label} is not a file: ${filePath}`);
  assert(info.size > 0, `${label} is empty: ${filePath}`);
  log(`${label}: ${path.relative(repoRoot, filePath)} (${info.size} bytes)`);
}

async function assertAsciiAbsent(filePath, term, label) {
  const content = await readFile(filePath);
  assert(
    !content.includes(Buffer.from(term, "ascii")),
    `${label} contains forbidden packaged marker: ${term}`
  );
}

async function getZipAudit(filePath) {
  const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($env:DESKPET_ZIP_PATH)
try {
  $entries = @($archive.Entries | ForEach-Object { $_.FullName })
  [PSCustomObject]@{
    EntryCount = $entries.Count
    ElevateEntryCount = @($entries | Where-Object { $_ -match '(^|/)elevate\\.exe$' }).Count
    ExeEntryCount = @($entries | Where-Object { $_ -match '\\.exe$' }).Count
  } | ConvertTo-Json -Compress
} finally {
  $archive.Dispose()
}
`;
  const { stdout } = await execFileAsync(
    "powershell.exe",
    ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
    { env: { ...process.env, DESKPET_ZIP_PATH: filePath } }
  );
  return JSON.parse(stdout);
}

async function walkFiles(startPath) {
  const info = await stat(startPath);
  if (info.isFile()) return [startPath];
  const entries = await readdir(startPath, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const nextPath = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkFiles(nextPath)));
    } else if (entry.isFile()) {
      results.push(nextPath);
    }
  }
  return results;
}

async function walkDirs(startPath) {
  const entries = await readdir(startPath, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const nextPath = path.join(startPath, entry.name);
    if (entry.isDirectory()) {
      results.push(nextPath, ...(await walkDirs(nextPath)));
    }
  }
  return results;
}

async function runSafetyScan() {
  const scanRoots = ["src", "package.json", "pnpm-lock.yaml", "build", ".github"].map((entry) =>
    path.join(repoRoot, entry)
  );
  const matches = [];
  for (const root of scanRoots) {
    if (!existsSync(root)) continue;
    const files = await walkFiles(root);
    for (const file of files) {
      const extension = path.extname(file);
      if (!textExtensions.has(extension) && path.basename(file) !== "pnpm-lock.yaml") continue;
      const content = await readFile(file, "utf8");
      const lower = content.toLowerCase();
      for (const term of forbiddenTerms) {
        if (lower.includes(term.toLowerCase())) {
          matches.push(`${path.relative(repoRoot, file)} -> ${term}`);
        }
      }
    }
  }
  assert(matches.length === 0, `Forbidden safety terms found:\n${matches.join("\n")}`);
  log("Safety scan passed for source/config paths.");
}

async function runPackageChecks() {
  await assertFile(unpackedExe, "Unpacked app");
  await assertFile(portableExe, "Portable artifact");
  await assertFile(zipFile, "Zip artifact");

  const targets = packageJson.build?.win?.target?.map((target) => target.target) ?? [];
  assert(targets.includes("portable"), "Windows target does not include portable.");
  assert(targets.includes("zip"), "Windows target does not include zip.");
  assert(!targets.includes("nsis"), "NSIS must not be a default Windows target.");

  const nsis = packageJson.build?.nsis ?? {};
  assert(nsis.perMachine === false, "NSIS must not default to per-machine install.");
  assert(nsis.allowElevation === false, "NSIS elevation must be disabled.");
  assert(nsis.packElevateHelper === false, "NSIS elevate helper must not be packaged.");
  assert(packageJson.dependencies?.["electron-updater"] === undefined, "electron-updater must not be a runtime dependency.");

  await assertAsciiAbsent(portableExe, "elevate.exe", "Portable artifact");
  const zipAudit = await getZipAudit(zipFile);
  assert(zipAudit.ElevateEntryCount === 0, "Zip artifact contains elevate.exe.");
  log(`Zip audit passed: ${zipAudit.EntryCount} entries, ${zipAudit.ExeEntryCount} executable entries, no elevate.exe.`);

  const assetRoot = path.join(distDir, "win-unpacked", "resources", "pet_assets");
  const dirs = await walkDirs(assetRoot);
  const blocked = dirs
    .map((dir) => path.basename(dir))
    .filter((name) => ["focusAlert", "main_pixel_avatar", "paired_pixel_avatar"].includes(name));
  assert(blocked.length === 0, `Blocked asset directories are packaged: ${blocked.join(", ")}`);
  log("Package target and resource checks passed.");
}

async function waitFor(label, fn, timeoutMs = 20000, intervalMs = 250) {
  const startedAt = Date.now();
  let lastError;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const value = await fn();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out waiting for ${label}${lastError ? `: ${lastError.message}` : ""}`);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} returned ${response.status}`);
  return response.json();
}

class CdpClient {
  constructor(url) {
    this.url = url;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("message", (event) => this.handleMessage(event));
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
  }

  handleMessage(event) {
    const raw = typeof event.data === "string" ? event.data : Buffer.from(event.data).toString("utf8");
    const message = JSON.parse(raw);
    if (!message.id || !this.pending.has(message.id)) return;
    const { resolve, reject } = this.pending.get(message.id);
    this.pending.delete(message.id);
    if (message.error) {
      reject(new Error(message.error.message));
      return;
    }
    resolve(message.result);
  }

  send(method, params = {}) {
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(payload);
    });
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
      userGesture: true
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text ?? "Runtime.evaluate failed");
    }
    return result.result?.value;
  }

  close() {
    this.socket?.close();
  }
}

async function connectToPetTarget() {
  const targets = await waitFor("CDP target list", async () => {
    const list = await fetchJson(`http://127.0.0.1:${port}/json`);
    return Array.isArray(list) && list.length > 0 ? list : null;
  });
  const page =
    targets.find((target) => target.type === "page" && target.url?.includes("#pet")) ??
    targets.find((target) => target.type === "page");
  assert(page?.webSocketDebuggerUrl, "No page target with a debugger URL was found.");
  const cdp = new CdpClient(page.webSocketDebuggerUrl);
  await cdp.connect();
  await cdp.send("Runtime.enable");
  await waitFor("preload bridge", () => cdp.evaluate("Boolean(window.pawpal?.getSnapshot)"));
  log("Connected to packaged renderer through CDP.");
  return cdp;
}

function assertSameKeys(actual, expected, label) {
  const sortedActual = [...actual].sort();
  const sortedExpected = [...expected].sort();
  assert(
    JSON.stringify(sortedActual) === JSON.stringify(sortedExpected),
    `${label} keys changed. Expected ${sortedExpected.join(", ")}, got ${sortedActual.join(", ")}`
  );
}

function assertSettingsMatch(actual, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    assert(actual[key] === value, `${label} expected ${key}=${value}, got ${actual[key]}`);
  }
}

async function getSnapshot(cdp) {
  const snapshot = await cdp.evaluate("window.pawpal.getSnapshot()");
  assertSameKeys(Object.keys(snapshot), snapshotKeys, "Snapshot");
  assertSameKeys(Object.keys(snapshot.settings), settingsKeys, "Settings");
  assert(snapshot.dogVisible === true, "Pet window is not visible according to snapshot.");
  assert(snapshot.settings.focusDurationMinutes >= 1, "Focus duration is below timer minimum.");
  return snapshot;
}

async function runCdpChecks(cdp) {
  const initial = await getSnapshot(cdp);
  assert(initial.focusActive === false, "Focus should not be active on a fresh smoke profile.");
  assert(initial.blockingMode === null, "Blocking mode should be clear on startup.");

  await cdp.evaluate("window.pawpal.startFocus(); true");
  const active = await waitFor("manual focus active state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.focusActive === true &&
      snapshot.petState === "focusGuard" &&
      typeof snapshot.timers.focusEndsAt === "number"
      ? snapshot
      : null;
  });
  assert(active.blockingMode === null, "Manual focus should not set a blocking mode.");

  await cdp.evaluate("window.pawpal.stopFocus(); true");
  await waitFor("manual focus stopped state", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.focusActive === false ? snapshot : null;
  });

  await cdp.evaluate('window.pawpal.triggerDemo("break"); true');
  await waitFor("break reminder prompt", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === "break" && snapshot.petState === "breakPrompt" ? snapshot : null;
  });
  await cdp.evaluate('window.pawpal.bubbleAction("break:snooze"); true');
  await waitFor("break reminder snooze", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === null ? snapshot : null;
  });

  await cdp.evaluate('window.pawpal.triggerDemo("hydration"); true');
  await waitFor("hydration reminder prompt", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === "hydration" && snapshot.petState === "hydrationPrompt" ? snapshot : null;
  });
  await cdp.evaluate('window.pawpal.bubbleAction("hydration:snooze"); true');
  await waitFor("hydration reminder snooze", async () => {
    const snapshot = await getSnapshot(cdp);
    return snapshot.blockingMode === null ? snapshot : null;
  });

  log("CDP focus and reminder checks passed.");
}

async function writeSettingsForPersistence(cdp) {
  const payload = JSON.stringify(persistedSettings);
  await cdp.evaluate(`window.pawpal.updateSettings(${payload}); true`);
  await waitFor("settings update", async () => {
    const snapshot = await getSnapshot(cdp);
    try {
      assertSettingsMatch(snapshot.settings, persistedSettings, "Updated settings");
      return snapshot;
    } catch {
      return null;
    }
  });
  log("Settings update check passed.");
}

async function runSettingsPersistenceCheck(cdp) {
  const snapshot = await getSnapshot(cdp);
  assertSettingsMatch(snapshot.settings, persistedSettings, "Persisted settings");
  assert(snapshot.focusActive === false, "Focus should not auto-resume after restart.");
  assert(snapshot.blockingMode === null, "Blocking mode should not persist after restart.");
  log("Settings persistence check passed after restart.");
}

async function getWindowSnapshot(rootPid) {
  const script = `
$rootPid = ${Number(rootPid)}
$all = Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId
$ids = New-Object 'System.Collections.Generic.HashSet[int]'
[void]$ids.Add($rootPid)
$changed = $true
while ($changed) {
  $changed = $false
  foreach ($proc in $all) {
    if ($ids.Contains([int]$proc.ParentProcessId) -and -not $ids.Contains([int]$proc.ProcessId)) {
      [void]$ids.Add([int]$proc.ProcessId)
      $changed = $true
    }
  }
}
Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class DeskPetWin32 {
  [StructLayout(LayoutKind.Sequential)]
  public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT rect);
  [DllImport("user32.dll", SetLastError=true)] public static extern int GetWindowLong(IntPtr hWnd, int nIndex);
}
'@
$rows = @()
foreach ($proc in Get-Process -Id @($ids) -ErrorAction SilentlyContinue) {
  $handle = $proc.MainWindowHandle
  if ($handle -eq 0 -or -not [DeskPetWin32]::IsWindowVisible($handle)) { continue }
  $rect = New-Object DeskPetWin32+RECT
  [void][DeskPetWin32]::GetWindowRect($handle, [ref]$rect)
  $exStyle = [DeskPetWin32]::GetWindowLong($handle, -20)
  $rows += [PSCustomObject]@{
    ProcessId = $proc.Id
    Title = $proc.MainWindowTitle
    Width = $rect.Right - $rect.Left
    Height = $rect.Bottom - $rect.Top
    TopMost = (($exStyle -band 0x00000008) -ne 0)
  }
}
$rows | ConvertTo-Json -Compress
`;
  const { stdout } = await execFileAsync("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    script
  ]);
  if (!stdout.trim()) return [];
  const parsed = JSON.parse(stdout);
  return Array.isArray(parsed) ? parsed : [parsed];
}

async function runWindowChecks(rootPid) {
  const windows = await waitFor("visible DeskPet window", async () => {
    const rows = await getWindowSnapshot(rootPid);
    return rows.length > 0 ? rows : null;
  });
  const petWindow = windows.find((win) => win.Width === 220 && win.Height === 340 && win.TopMost === true);
  assert(
    petWindow,
    `Expected a 220x340 topmost pet window. Observed: ${JSON.stringify(windows)}`
  );
  log(`Window check passed: ${petWindow.Width}x${petWindow.Height}, TopMost=${petWindow.TopMost}.`);
}

async function stopProcessTree(rootPid) {
  if (!rootPid) return;
  try {
    await execFileAsync("taskkill.exe", ["/PID", String(rootPid), "/T", "/F"]);
  } catch (error) {
    if (!String(error.stderr ?? error.stdout ?? "").includes("not found")) {
      throw error;
    }
  }
}

async function removeWithRetry(targetPath, attempts = 12, delayMs = 500) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await rm(targetPath, { recursive: true, force: true });
      return;
    } catch (error) {
      lastError = error;
      if (!["EBUSY", "ENOTEMPTY", "EPERM"].includes(error.code)) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

async function launchPackagedApp(label) {
  const child = spawn(unpackedExe, [`--remote-debugging-port=${port}`], {
    env: {
      ...process.env,
      DESKPET_USER_DATA_DIR: userDataDir
    },
    stdio: "ignore",
    windowsHide: false
  });

  log(`Launched ${path.relative(repoRoot, unpackedExe)} (${label}) with pid ${child.pid}.`);
  const cdp = await connectToPetTarget();
  await runWindowChecks(child.pid);
  return { child, cdp };
}

async function closePackagedApp(session) {
  if (!session) return;
  session.cdp?.close();
  await stopProcessTree(session.child?.pid);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

async function runAppSmoke() {
  assert(process.platform === "win32", "smoke:m1 must run on Windows.");
  await mkdir(userDataDir, { recursive: true });

  let session;
  let cdp;
  try {
    session = await launchPackagedApp("initial");
    cdp = session.cdp;
    await runCdpChecks(cdp);
    await writeSettingsForPersistence(cdp);
    await closePackagedApp(session);
    session = null;

    session = await launchPackagedApp("restart");
    cdp = session.cdp;
    await runSettingsPersistenceCheck(cdp);
  } finally {
    await closePackagedApp(session);
    await removeWithRetry(userDataDir);
  }
  log("Process tree cleaned.");
}

await runSafetyScan();
await runPackageChecks();
await runAppSmoke();
log("M1 smoke passed.");
