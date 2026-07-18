import { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

function getTrayImage() {
  const candidates = [
    path.join(app.getAppPath(), 'src', 'assets', 'logo.png'),
    path.join(__dirname, '../src/assets/logo.png'),
    path.join(__dirname, '../public/icon.png'),
  ];
  for (const p of candidates) {
    const img = nativeImage.createFromPath(p);
    if (!img.isEmpty()) return img.resize({ width: 16, height: 16 });
  }
  return nativeImage.createEmpty();
}

function createTray() {
  if (tray) return;
  try {
    tray = new Tray(getTrayImage());
    tray.setToolTip('DeBloat');
    const menu = Menu.buildFromTemplate([
      { label: 'Open DeBloat', click: () => showWindow() },
      { type: 'separator' },
      { label: 'Quit', click: () => { isQuitting = true; app.quit(); } },
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
    width: 1400,
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
    icon: path.join(__dirname, '../public/icon.png')
  });

  // Load the app: use the Vite dev server URL in development,
  // otherwise fall back to the built files.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers for secure communication
ipcMain.handle('minimize-window', () => {
  mainWindow?.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

// Hide the window to the system tray instead of closing it.
ipcMain.handle('minimize-to-tray', () => {
  createTray();
  mainWindow?.hide();
});

// The X button fully exits the app.
ipcMain.handle('close-window', () => {
  isQuitting = true;
  app.quit();
});

ipcMain.handle('get-system-info', async () => {
  const os = require('os');
  const si = require('systeminformation');
  
  try {
    const [cpu, mem, osInfo, graphics] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.graphics()
    ]);

    return {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free
      },
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch
      },
      graphics: graphics.controllers.map(g => ({
        model: g.model,
        vendor: g.vendor,
        vram: g.vram
      }))
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return null;
  }
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
  const parts: string[] = [];
  for (const name of names) {
    // Only act if the service actually exists on this system. A service that
    // isn't installed (e.g. NVIDIA telemetry on a machine with no NVIDIA GPU)
    // is treated as "nothing to do" rather than a failure.
    let inner = `Set-Service -Name '${name}' -StartupType ${startup} -ErrorAction SilentlyContinue`;
    if (val.startup === 'disabled') {
      inner += `; Stop-Service -Name '${name}' -Force -ErrorAction SilentlyContinue`;
    }
    parts.push(`if (Get-Service -Name '${name}' -ErrorAction SilentlyContinue) { ${inner} }`);
  }
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
      return cmd.replace(/&&/g, ';');
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
  onOutput?: (chunk: string) => void
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
      resolve({ success: false, error: 'Timed out after 5 minutes' });
    }, 300000);

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

function sendLog(event: { sender: { send: (channel: string, payload: unknown) => void } }, payload: Record<string, unknown>) {
  try {
    event.sender.send('tweak-log', payload);
  } catch {
    // Window may have closed mid-run.
  }
}

// Apply (or undo) a batch of tweaks, streaming live progress to the renderer.
ipcMain.handle('apply-tweaks', async (event, tweaks: TweakPayload[], mode: 'apply' | 'undo' = 'apply') => {
  const results: { id: string; success: boolean; error?: string }[] = [];
  const total = tweaks.length;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < tweaks.length; i++) {
    const tweak = tweaks[i];
    const label = tweak.name || tweak.id;
    sendLog(event, { type: 'start', id: tweak.id, name: label, index: i + 1, total });

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

  sendLog(event, { type: 'done', successCount, failCount, total });
  return { results, successCount, failCount, total };
});

// Install a batch of apps via winget, returning a per-app result.
ipcMain.handle('install-apps', async (_event, apps: { id: string; winget?: string }[]) => {
  const results: { id: string; success: boolean; error?: string }[] = [];
  for (const app of apps) {
    if (!app.winget) {
      results.push({ id: app.id, success: false, error: 'No winget package id available' });
      continue;
    }
    const command = `winget install --id ${app.winget} -e --silent --accept-package-agreements --accept-source-agreements`;
    const result = await runPowershell(command);
    results.push({ id: app.id, success: result.success, error: result.error });
  }
  return results;
});

ipcMain.handle('create-restore-point', async () => {
  // Create system restore point
  const { exec } = require('child_process');
  const command = 'powershell.exe -Command "Checkpoint-Computer -Description \'DeBloat Optimization\' -RestorePointType \'MODIFY_SETTINGS\'"';
  
  return new Promise((resolve) => {
    exec(command, (error: Error | null) => {
      resolve({ success: !error, error: error?.message });
    });
  });
});

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('before-quit', () => {
  isQuitting = true;
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
