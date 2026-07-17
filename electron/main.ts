import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
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

ipcMain.handle('close-window', () => {
  mainWindow?.close();
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

ipcMain.handle('apply-optimization', async (event, profile: string, options: string[]) => {
  // This will execute PowerShell scripts for actual optimizations
  // For now, return a success response
  return { success: true, profile, options };
});

ipcMain.handle('restore-optimization', async (event, backupId: string) => {
  // Restore from backup
  return { success: true, backupId };
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

app.whenReady().then(createWindow);

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
