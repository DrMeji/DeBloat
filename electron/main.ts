import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

/**
 * App icon for the window / tray.
 * Packaged builds embed build/icon.ico into the .exe (taskbar), and also
 * ship icon.ico/png under resources for BrowserWindow.
 */
function getIconImage() {
  const candidates = app.isPackaged
    ? [
        path.join(process.resourcesPath, 'icon.ico'),
        path.join(process.resourcesPath, 'icon.png'),
      ]
    : [
        path.join(__dirname, '../build/icon.ico'),
        path.join(__dirname, '../build/icon.png'),
      ];

  for (const iconPath of candidates) {
    try {
      if (!fs.existsSync(iconPath)) continue;
      const img = nativeImage.createFromPath(iconPath);
      if (!img.isEmpty()) return img;
      console.error(`Icon at path ${iconPath} is empty.`);
    } catch (err) {
      console.error(`Could not load icon from path: ${iconPath}`, err);
    }
  }

  return nativeImage.createEmpty();
}

function getTrayImage() {
  const icon = getIconImage();
  // For tray, we need a small, resized icon.
  return icon.isEmpty() ? icon : icon.resize({ width: 16, height: 16 });
}

function createTray() {
  if (tray) return;
  try {
    tray = new Tray(getTrayImage());
    tray.setToolTip('DeBloat');
    const menu = Menu.buildFromTemplate([
      { label: 'Open DeBloat', click: () => showWindow() },
      { type: 'separator' },
      { label: 'Quit', click: () => app.quit() },
    ]);
    tray.setContextMenu(menu);
    tray.on('click', () => showWindow());
  } catch (err) {
    console.error('Could not create tray icon:', err);
    tray = null;
  }
}

function showWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }
  mainWindow.show();
  mainWindow.focus();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    backgroundColor: '#0d1117',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: getIconImage()
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('minimize-to-tray', () => {
  createTray();
  mainWindow?.hide();
});

ipcMain.handle('close-window', () => {
  app.quit();
});

// ------------------------------------------------------------------
//  Tweak execution engine
// ------------------------------------------------------------------

type TweakPayload = {
  id: string;
  name?: string;
  type: 'appx' | 'service' | 'registry' | 'task' | 'command';
  target: string;
  value?: unknown;
  undo?: unknown;
  permanent?: boolean;
};

const REG_HIVES: Record<string, string> = {
  HKEY_LOCAL_MACHINE: 'HKLM',
  HKEY_CURRENT_USER: 'HKCU',
  HKEY_CLASSES_ROOT: 'HKCR',
  HKEY_USERS: 'HKU',
  HKEY_CURRENT_CONFIG: 'HKCC',
};

const REG_TYPES: Record<string, string> = {
  DWORD: 'REG_DWORD',
  QWORD: 'REG_QWORD',
  SZ: 'REG_SZ',
  EXPAND_SZ: 'REG_EXPAND_SZ',
  MULTI_SZ: 'REG_MULTI_SZ',
};

const SERVICE_STARTUP: Record<string, string> = {
  disabled: 'Disabled',
  auto: 'Automatic',
  manual: 'Manual',
  boot: 'Boot',
  system: 'System',
};

function buildRegistryCommand(target: string, val: Record<string, unknown>): string {
  const segments = target.split('\\');
  const hive = REG_HIVES[segments[0]] || segments[0];
  const keyPath = [hive, ...segments.slice(1)].join('\\');
  const regType = REG_TYPES[String(val.type)] || 'REG_SZ';
  return `reg add "${keyPath}" /v "${val.name}" /t ${regType} /d "${val.data}" /f`;
}

function buildServiceCommand(target: string, val: Record<string, unknown>): string {
  const startup = SERVICE_STARTUP[String(val.startup)] || 'Manual';
  const names = target.split(',').map(s => s.trim()).filter(Boolean);
  const parts: string[] = ["$ErrorActionPreference = 'SilentlyContinue'"];
  for (const name of names) {
    // Prefer sc.exe for stubborn/protected services; never fail the whole tweak.
    parts.push(
      `if (Get-Service -Name '${name}' -ErrorAction SilentlyContinue) { ` +
      `Write-Output \"Service ${name}\"; ` +
      `Stop-Service -Name '${name}' -Force -ErrorAction SilentlyContinue; ` +
      `Set-Service -Name '${name}' -StartupType ${startup} -ErrorAction SilentlyContinue; ` +
      `sc.exe config '${name}' start= ${startup === 'Disabled' ? 'disabled' : startup === 'Automatic' ? 'auto' : 'demand'} | Out-Null ` +
      `} else { Write-Output \"Service ${name} not present (skipped)\" }`
    );
  }
  parts.push('exit 0');
  return parts.join('; ');
}

function buildTaskCommand(target: string, action: string): string {
  // Split the full task path into TaskPath + TaskName, then use the scheduler
  // cmdlets so a missing task is a no-op (success) instead of a hard error.
  const idx = target.lastIndexOf('\\');
  const taskPath = idx >= 0 ? target.slice(0, idx + 1) : '\\';
  const taskName = idx >= 0 ? target.slice(idx + 1) : target;
  const verb = action === 'enable' ? 'Enable-ScheduledTask' : 'Disable-ScheduledTask';
  return `$t = Get-ScheduledTask -TaskName '${taskName}' -TaskPath '${taskPath}' -ErrorAction SilentlyContinue; if ($t) { Write-Output \"Updating task: ${taskPath}${taskName}\"; ${verb} -TaskName '${taskName}' -TaskPath '${taskPath}' -ErrorAction SilentlyContinue | Out-Null; Write-Output 'Task updated' } else { Write-Output \"Task not present (skipped): ${taskPath}${taskName}\" }; exit 0`;
}

function buildAppxRemoveCommand(target: string, permanent?: boolean): string {
  const names = target.split(',').map(s => s.trim()).filter(Boolean);
  const parts: string[] = ['$ErrorActionPreference = \'SilentlyContinue\''];
  for (const name of names) {
    parts.push(`Write-Output \"Looking for app: ${name}\"`);
    parts.push(`$pkgs = @(Get-AppxPackage -AllUsers '*${name}*')`);
    parts.push(`if ($pkgs.Count -eq 0) { Write-Output \"  (not installed)\" } else { $pkgs | ForEach-Object { Write-Output \"  Removing $($_.Name)\"; $_ | Remove-AppxPackage -ErrorAction SilentlyContinue } }`);
    if (permanent) {
      parts.push(`Get-AppxProvisionedPackage -Online | Where-Object { $_.PackageName -like '*${name}*' } | ForEach-Object { Write-Output \"  Removing provisioned $($_.PackageName)\"; $_ | Remove-AppxProvisionedPackage -Online -ErrorAction SilentlyContinue }`);
    }
  }
  return parts.join('; ');
}

function buildAppxRestoreCommand(target: string, undo: unknown): string {
  if (undo && typeof undo === 'object' && typeof (undo as { command?: string }).command === 'string') {
    const cmd = (undo as { command: string }).command;
    if (cmd.startsWith('winget')) return cmd;
  }
  // Best-effort re-register from the local install location.
  const names = target.split(',').map(s => s.trim()).filter(Boolean);
  return names
    .map(name => `Get-AppxPackage -AllUsers '*${name}*' | ForEach-Object { Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml" -ErrorAction SilentlyContinue }`)
    .join('; ');
}

function buildTweakCommand(tweak: TweakPayload, mode: 'apply' | 'undo'): string {
  switch (tweak.type) {
    case 'registry': {
      const v = (mode === 'apply' ? tweak.value : tweak.undo) as Record<string, unknown>;
      return buildRegistryCommand(tweak.target, v);
    }
    case 'service': {
      const v = (mode === 'apply' ? tweak.value : tweak.undo) as Record<string, unknown>;
      return buildServiceCommand(tweak.target, v);
    }
    case 'task': {
      const action = String(mode === 'apply' ? tweak.value : tweak.undo);
      return buildTaskCommand(tweak.target, action);
    }
    case 'command': {
      const cmd = String(mode === 'apply' ? tweak.target : tweak.undo);
      // PowerShell 5.1 does not support '&&'; use ';' for sequential execution.
      const normalized = cmd.replace(/&&/g, ';');
      // Stubborn services (e.g. TabletInput) can leave a non-zero native exit code;
      // always force success so the tweak is reported correctly.
      if (/\bexit\s+0\b/i.test(normalized)) return normalized;
      return `${normalized}; exit 0`;
    }
    case 'appx': {
      return mode === 'apply'
        ? buildAppxRemoveCommand(tweak.target, tweak.permanent)
        : buildAppxRestoreCommand(tweak.target, tweak.undo);
    }
    default:
      return '';
  }
}

function runPowershell(
  command: string,
  onOutput?: (chunk: string) => void,
  timeoutMs = 300000
): Promise<{ success: boolean; error?: string }> {
  const { spawn } = require('child_process');
  return new Promise((resolve) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
      { windowsHide: true }
    );
    let stderr = '';
    const timer = setTimeout(() => {
      try { child.kill(); } catch { /* ignore */ }
      resolve({ success: false, error: `Timed out after ${Math.round(timeoutMs / 60000)} minutes` });
    }, timeoutMs);

    child.stdout?.on('data', (buf: Buffer) => {
      const text = buf.toString();
      onOutput?.(text);
    });
    child.stderr?.on('data', (buf: Buffer) => {
      const text = buf.toString();
      stderr += text;
      onOutput?.(text);
    });
    child.on('error', (err: Error) => {
      clearTimeout(timer);
      resolve({ success: false, error: err.message });
    });
    child.on('close', (code: number | null) => {
      clearTimeout(timer);
      // 0 = ok, 3010 = success but reboot required (DISM / features)
      if (code === 0 || code === 3010 || code === null) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: (stderr || `Exit code ${code}`).trim().slice(0, 500) });
      }
    });
  });
}

function createQuietOutputPump(
  onLine: (line: string) => void
): (chunk: string) => void {
  let buffer = '';
  let lastProgressAt = 0;
  let lastProgressKey = '';

  const isSpinner = (line: string) => /^[\s\\|\/\-]+$/.test(line);
  const isProgressBar = (line: string) =>
    /[█▒░]/.test(line) || /\d+(\.\d+)?\s*MB\s*\/\s*\d+(\.\d+)?\s*MB/i.test(line);
  const isNoise = (line: string) =>
    isSpinner(line) ||
    /^[\s\u0000-\u001f]*$/.test(line) ||
    line === 'This application is licensed to you by its owner.' ||
    line === 'Microsoft is not responsible for, nor does it grant any licenses to, third-party packages.';

  const emitProgress = (line: string) => {
    const match = line.match(/([\d.]+)\s*MB\s*\/\s*([\d.]+)\s*MB/i);
    if (!match) return;
    const cur = parseFloat(match[1]);
    const total = parseFloat(match[2]);
    if (!total) return;
    const pct = Math.min(99, Math.round((cur / total) * 100));
    const key = `${Math.floor(pct / 10)}`;
    const now = Date.now();
    if (key === lastProgressKey && now - lastProgressAt < 2500) return;
    lastProgressKey = key;
    lastProgressAt = now;
    onLine(`Downloading… ${cur} MB / ${total} MB (${pct}%)`);
  };

  const handlePiece = (raw: string) => {
    const line = raw.replace(/\u001b\[[0-9;]*m/g, '').trim();
    if (!line || isNoise(line)) return;
    if (isProgressBar(line)) {
      emitProgress(line);
      return;
    }
    onLine(line);
  };

  return (chunk: string) => {
    buffer += chunk;
    const parts = buffer.split(/\r|\n/);
    buffer = parts.pop() || '';
    for (const part of parts) handlePiece(part);
  };
}

function buildDirectInstallCommand(app: {
  id: string;
  name?: string;
  downloadUrl: string;
  installer?: string;
  installerArgs?: string;
}): string {
  const url = app.downloadUrl.replace(/'/g, "''");
  const ext =
    app.installer === 'msi' ? '.msi'
      : app.installer === 'msix' ? '.msix'
        : app.downloadUrl.toLowerCase().includes('.msi') ? '.msi'
          : '.exe';
  const fileName = `${app.id}${ext}`;
  const args = (app.installerArgs || '').replace(/'/g, "''");

  let runBlock: string;
  if (ext === '.msi' || app.installer === 'msi') {
    runBlock =
      `$p = Start-Process -FilePath 'msiexec.exe' -ArgumentList '/i', $out, '/qn', '/norestart' -Wait -PassThru; ` +
      `if ($p.ExitCode -ne 0 -and $p.ExitCode -ne 3010) { Write-Output \"msiexec exit $($p.ExitCode)\"; exit $p.ExitCode }`;
  } else if (app.installer === 'msix' || ext === '.msix') {
    runBlock = `Add-AppxPackage -Path $out -ErrorAction Stop; Write-Output 'AppX package registered'`;
  } else {
    const argList = args ? `-ArgumentList '${args}'` : '';
    runBlock =
      `$p = Start-Process -FilePath $out ${argList} -Wait -PassThru; ` +
      `if ($null -ne $p.ExitCode -and $p.ExitCode -ne 0) { Write-Output \"installer exit $($p.ExitCode)\"; exit $p.ExitCode }`;
  }

  return (
    `$ErrorActionPreference='Stop'; ` +
    `$dir = Join-Path $env:TEMP 'DeBloat-Installers'; ` +
    `New-Item -ItemType Directory -Force -Path $dir | Out-Null; ` +
    `$out = Join-Path $dir '${fileName}'; ` +
    `Write-Output 'Downloading from official site...'; ` +
    `Write-Output '${url}'; ` +
    `& curl.exe -L --fail --silent --show-error --retry 3 --connect-timeout 30 -o $out '${url}'; ` +
    `if ($LASTEXITCODE -ne 0) { Write-Output \"Download failed (curl exit $LASTEXITCODE)\"; exit 1 }; ` +
    `if (-not (Test-Path $out) -or (Get-Item $out).Length -lt 1024) { Write-Output 'Download failed (empty file)'; exit 1 }; ` +
    `$mb = [math]::Round((Get-Item $out).Length / 1MB, 1); ` +
    `Write-Output \"Download complete ($mb MB)\"; ` +
    `Write-Output 'Running installer...'; ` +
    `${runBlock}; ` +
    `Write-Output 'Install finished'; ` +
    `exit 0`
  );
}

function sendLog(event: { sender: { send: (channel: string, payload: unknown) => void } }, payload: Record<string, unknown>) {
  try {
    event.sender.send('tweak-log', payload);
  } catch {
    // Window may have closed mid-run.
  }
}

const NESTED_VIRT_MARKERS = [
  'Microsoft-Windows-Subsystem-Linux',
  'VirtualMachinePlatform',
  'Microsoft-Hyper-V',
];

function isNestedVirtTweak(tweak: TweakPayload): boolean {
  if (tweak.type !== 'command') return false;
  return NESTED_VIRT_MARKERS.some(marker => String(tweak.target).includes(marker));
}

function detectVirtualMachine(): { isVm: boolean; label: string } {
  try {
    const { execFileSync } = require('child_process');
    const out = execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        "$cs = Get-CimInstance Win32_ComputerSystem; Write-Output ($cs.Manufacturer + '|' + $cs.Model)",
      ],
      { encoding: 'utf8', windowsHide: true, timeout: 20000 }
    ) as string;
    const lower = out.toLowerCase();
    const markers = [
      'virtualbox',
      'vmware',
      'virtual machine',
      'qemu',
      'xen',
      'parallels',
      'innotek',
      'kvm',
      'bochs',
      'microsoft corporation|virtual',
    ];
    const isVm = markers.some(m => {
      if (m.includes('|')) {
        const [a, b] = m.split('|');
        return lower.includes(a) && lower.includes(b);
      }
      return lower.includes(m);
    });
    return { isVm, label: out.trim().replace(/\r?\n/g, ' ') };
  } catch {
    return { isVm: false, label: 'unknown' };
  }
}

// Apply (or undo) a batch of tweaks, streaming live progress to the renderer.
ipcMain.handle('apply-tweaks', async (event, tweaks: TweakPayload[], mode: 'apply' | 'undo' = 'apply') => {
  const results: { id: string; success: boolean; skipped?: boolean; error?: string }[] = [];
  const total = tweaks.length;
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  const vm = detectVirtualMachine();
  if (vm.isVm) {
    sendLog(event, {
      type: 'output',
      line: `Virtual machine detected (${vm.label}). WSL / Hyper-V / Virtual Machine Platform will be skipped here.`,
    });
  }

  for (let i = 0; i < tweaks.length; i++) {
    const tweak = tweaks[i];
    const label = tweak.name || tweak.id;
    sendLog(event, { type: 'start', id: tweak.id, name: label, index: i + 1, total });

    // These features need real hardware (or nested virtualization). Inside VirtualBox
    // they almost always fail with DISM exit code 1 — skip cleanly instead of FAIL.
    if (mode === 'apply' && vm.isVm && isNestedVirtTweak(tweak)) {
      skipCount += 1;
      const reason = 'Skipped inside a virtual machine (needs bare-metal PC or nested virtualization)';
      results.push({ id: tweak.id, success: true, skipped: true, error: reason });
      sendLog(event, { type: 'skip', id: tweak.id, name: label, error: reason });
      continue;
    }

    const command = buildTweakCommand(tweak, mode);
    if (!command) {
      failCount += 1;
      results.push({ id: tweak.id, success: false, error: 'Unsupported tweak type' });
      sendLog(event, { type: 'fail', id: tweak.id, name: label, error: 'Unsupported tweak type' });
      continue;
    }

    const preview = command.length > 180 ? `${command.slice(0, 180)}...` : command;
    sendLog(event, { type: 'command', id: tweak.id, line: preview });

    const result = await runPowershell(command, (chunk) => {
      chunk.split(/\r?\n/).forEach((line) => {
        if (line.trim()) sendLog(event, { type: 'output', id: tweak.id, line });
      });
    });

    if (result.success) {
      successCount += 1;
      sendLog(event, { type: 'success', id: tweak.id, name: label });
    } else {
      failCount += 1;
      sendLog(event, { type: 'fail', id: tweak.id, name: label, error: result.error });
    }
    results.push({ id: tweak.id, success: result.success, error: result.error });
  }

  sendLog(event, {
    type: 'done',
    successCount,
    failCount,
    skipCount,
    total,
    skippedNames: results.filter(r => r.skipped).map(r => {
      const t = tweaks.find(x => x.id === r.id);
      return t?.name || r.id;
    }),
  });
  return { results, successCount, failCount, skipCount, total };
});

async function runPowershellFile(
  scriptBody: string,
  onOutput?: (chunk: string) => void,
  timeoutMs = 900000
): Promise<{ success: boolean; error?: string }> {
  const fs = require('fs');
  const os = require('os');
  const scriptPath = path.join(os.tmpdir(), `debloat-${Date.now()}-${Math.random().toString(36).slice(2)}.ps1`);
  fs.writeFileSync(scriptPath, scriptBody, 'utf8');
  try {
    const escaped = scriptPath.replace(/'/g, "''");
    return await runPowershell(`& '${escaped}'`, onOutput, timeoutMs);
  } finally {
    try { fs.unlinkSync(scriptPath); } catch { /* ignore */ }
  }
}

/** Match catalog apps against winget list + uninstall registry names. */
async function detectInstalledAppIds(
  apps: { id: string; name?: string; winget?: string }[]
): Promise<Set<string>> {
  const installed = new Set<string>();
  let blob = '';
  await runPowershellFile(
    `$ErrorActionPreference='SilentlyContinue'
$winget = winget list --source winget --accept-source-agreements --disable-interactivity 2>&1 | Out-String
'---WINGET---'
$winget
'---REG---'
$paths = @(
  'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',
  'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
)
Get-ItemProperty $paths -ErrorAction SilentlyContinue | ForEach-Object { if ($_.DisplayName) { $_.DisplayName } }
exit 0
`,
    (chunk) => { blob += chunk; },
    180000
  );

  const lowerBlob = blob.toLowerCase();
  for (const app of apps) {
    if (app.winget && lowerBlob.includes(app.winget.toLowerCase())) {
      installed.add(app.id);
      continue;
    }
    if (app.name && app.name.length >= 5 && lowerBlob.includes(app.name.toLowerCase())) {
      installed.add(app.id);
    }
  }
  return installed;
}

function buildResolvedVendorInstallScript(app: {
  id: string;
  winget: string;
  installerArgs?: string;
}): string {
  const id = app.winget.replace(/'/g, "''");
  const fileId = app.id.replace(/'/g, "''");
  const extraArgs = (app.installerArgs || '').replace(/'/g, "''");
  return `$ErrorActionPreference = 'Continue'
$id = '${id}'
Write-Output 'Resolving official installer URL...'
$raw = & winget show -e --id $id --source winget --accept-source-agreements 2>&1 | Out-String
$url = $null
if ($raw -match '(?im)Installer Url:\\s+(\\S+)') { $url = $Matches[1] }
elseif ($raw -match '(?im)InstallerURL:\\s+(\\S+)') { $url = $Matches[1] }

if (-not $url) {
  Write-Output 'No direct URL in catalog — installing via winget community source (vendor CDN, not Microsoft Store)'
  & winget install --id $id -e --source winget --silent --accept-package-agreements --accept-source-agreements
  $code = $LASTEXITCODE
  if ($code -eq 0 -or $code -eq -1978335189 -or $code -eq -1978335212) { Write-Output 'Install finished'; exit 0 }
  Write-Output "winget exit $code"; exit $code
}

$dir = Join-Path $env:TEMP 'DeBloat-Installers'
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$ext = '.exe'
if ($url -match '\\.msi(\\?|$)') { $ext = '.msi' }
elseif ($url -match '\\.msix') { $ext = '.msix' }
elseif ($url -match '\\.appx') { $ext = '.appx' }
$out = Join-Path $dir ('${fileId}' + $ext)

Write-Output 'Downloading from official site...'
Write-Output $url
& curl.exe -L --fail --silent --show-error --retry 3 --connect-timeout 30 -o $out $url
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $out) -or (Get-Item $out).Length -lt 1024) {
  Write-Output 'Direct download failed — falling back to winget install'
  & winget install --id $id -e --source winget --silent --accept-package-agreements --accept-source-agreements
  $code = $LASTEXITCODE
  if ($code -eq 0 -or $code -eq -1978335189 -or $code -eq -1978335212) { Write-Output 'Install finished'; exit 0 }
  exit $code
}

$mb = [math]::Round((Get-Item $out).Length / 1MB, 1)
Write-Output "Download complete ($mb MB)"
Write-Output 'Running installer...'

if ($ext -eq '.msi') {
  $p = Start-Process -FilePath 'msiexec.exe' -ArgumentList '/i', $out, '/qn', '/norestart' -Wait -PassThru
  if ($p.ExitCode -ne 0 -and $p.ExitCode -ne 3010) { Write-Output "msiexec exit $($p.ExitCode)"; exit $p.ExitCode }
} elseif ($ext -eq '.msix' -or $ext -eq '.appx') {
  Add-AppxPackage -Path $out -ErrorAction Stop
} else {
  $extra = '${extraArgs}'.Trim()
  $tried = $false
  $ok = $false
  if ($extra) {
    $tried = $true
    $p = Start-Process -FilePath $out -ArgumentList $extra -Wait -PassThru -ErrorAction SilentlyContinue
    if ($null -eq $p -or $null -eq $p.ExitCode -or $p.ExitCode -eq 0) { $ok = $true }
  }
  if (-not $ok) {
    foreach ($a in @('/S', '/silent', '/VERYSILENT', '/quiet', '-s')) {
      $tried = $true
      $p = Start-Process -FilePath $out -ArgumentList $a -Wait -PassThru -ErrorAction SilentlyContinue
      if ($null -eq $p -or $null -eq $p.ExitCode -or $p.ExitCode -eq 0) { $ok = $true; break }
    }
  }
  if (-not $ok) {
    Write-Output 'Silent install uncertain — finishing with winget install (in-place upgrade if present)'
    & winget install --id $id -e --source winget --silent --accept-package-agreements --accept-source-agreements
    $code = $LASTEXITCODE
    if ($code -ne 0 -and $code -ne -1978335189 -and $code -ne -1978335212) { exit $code }
  }
}

Write-Output 'Install finished'
exit 0
`;
}

// Scan which catalog apps are already on this PC
ipcMain.handle('check-installed-apps', async (_event, apps: { id: string; name?: string; winget?: string }[]) => {
  const set = await detectInstalledAppIds(apps || []);
  return Array.from(set);
});

// Install apps: skip if present; prefer official URL (direct or winget-resolved); never msstore.
ipcMain.handle('install-apps', async (event, apps: {
  id: string;
  name?: string;
  winget?: string;
  downloadUrl?: string;
  installer?: string;
  installerArgs?: string;
}[]) => {
  const results: { id: string; success: boolean; skipped?: boolean; error?: string }[] = [];
  const total = apps.length;
  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  sendLog(event, { type: 'output', line: 'Checking which apps are already installed...' });
  const already = await detectInstalledAppIds(apps);

  for (let i = 0; i < apps.length; i++) {
    const app = apps[i];
    const label = app.name || app.id;
    sendLog(event, { type: 'start', id: app.id, name: `Install ${label}`, index: i + 1, total });

    if (already.has(app.id)) {
      skipCount += 1;
      results.push({ id: app.id, success: true, skipped: true, error: 'Already installed' });
      sendLog(event, {
        type: 'skip',
        id: app.id,
        name: `Install ${label}`,
        error: 'Already installed on this PC — skipped (no duplicate install)',
      });
      continue;
    }

    const useDirect = Boolean(app.downloadUrl);
    if (!useDirect && !app.winget) {
      failCount += 1;
      results.push({ id: app.id, success: false, error: 'No download URL or winget id available' });
      sendLog(event, {
        type: 'fail',
        id: app.id,
        name: `Install ${label}`,
        error: 'No download URL or winget id available',
      });
      continue;
    }

    let preview: string;
    let result: { success: boolean; error?: string };

    const pump = createQuietOutputPump((line) => {
      sendLog(event, { type: 'output', id: app.id, line });
    });

    if (useDirect && app.downloadUrl) {
      preview = 'Download from official site + silent install';
      sendLog(event, { type: 'command', id: app.id, line: preview });
      const command = buildDirectInstallCommand({
        id: app.id,
        name: app.name,
        downloadUrl: app.downloadUrl,
        installer: app.installer,
        installerArgs: app.installerArgs,
      });
      result = await runPowershell(command, pump, 900000);
    } else {
      preview = `Resolve official URL for ${app.winget} → download + install`;
      sendLog(event, { type: 'command', id: app.id, line: preview });
      const script = buildResolvedVendorInstallScript({
        id: app.id,
        winget: app.winget!,
        installerArgs: app.installerArgs,
      });
      result = await runPowershellFile(script, pump, 900000);
    }

    if (result.success) {
      successCount += 1;
      already.add(app.id);
      sendLog(event, { type: 'success', id: app.id, name: `Install ${label}` });
    } else {
      failCount += 1;
      sendLog(event, { type: 'fail', id: app.id, name: `Install ${label}`, error: result.error });
    }
    results.push({ id: app.id, success: result.success, error: result.error });
  }

  sendLog(event, {
    type: 'done',
    successCount,
    failCount,
    skipCount,
    total,
    finishedLabel: 'installed',
    skippedNames: results.filter(r => r.skipped).map(r => {
      const a = apps.find(x => x.id === r.id);
      return a?.name || r.id;
    }),
  });
  return { results, successCount, failCount, skipCount, total };
});

ipcMain.handle('create-restore-point', async (_event, description?: string) => {
  const { execFile } = require('child_process');
  const label = String(description || `DeBloat ${new Date().toLocaleString()}`).slice(0, 240);
  const script =
    `$ErrorActionPreference='Stop'; ` +
    `Checkpoint-Computer -Description '${label.replace(/'/g, "''")}' -RestorePointType 'MODIFY_SETTINGS'; ` +
    `Write-Output 'Restore point created'; ` +
    `exit 0`;
  return new Promise((resolve) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { windowsHide: true, timeout: 180000 },
      (error: Error | null, _stdout: string, stderr: string) => {
        if (error) {
          resolve({ success: false, error: (stderr || error.message || 'Failed').trim().slice(0, 400) });
        } else {
          resolve({ success: true, description: label });
        }
      }
    );
  });
});

ipcMain.handle('restart-computer', async () => {
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec('shutdown /r /t 3 /c "DeBloat: restarting to finish applied changes"', (error: Error | null) => {
      resolve({ success: !error, error: error?.message });
    });
  });
});

ipcMain.handle('open-external', async (_event, url: string) => {
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
    return { success: false, error: 'Invalid URL' };
  }
  await shell.openExternal(url);
  return { success: true };
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
