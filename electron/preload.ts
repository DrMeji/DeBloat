import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // System information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Optimization operations
  applyTweaks: (tweaks: unknown[], mode: 'apply' | 'undo' = 'apply') =>
    ipcRenderer.invoke('apply-tweaks', tweaks, mode),
  installApps: (apps: unknown[]) =>
    ipcRenderer.invoke('install-apps', apps),
  createRestorePoint: () => ipcRenderer.invoke('create-restore-point'),
  
  // Platform detection
  platform: process.platform
});
