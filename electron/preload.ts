import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeToTray: () => ipcRenderer.invoke('minimize-to-tray'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  applyTweaks: (tweaks: unknown[], mode: 'apply' | 'undo' = 'apply') =>
    ipcRenderer.invoke('apply-tweaks', tweaks, mode),
  installApps: (apps: unknown[]) => ipcRenderer.invoke('install-apps', apps),
  checkInstalledApps: (apps: unknown[]) => ipcRenderer.invoke('check-installed-apps', apps),
  createRestorePoint: (description?: string) =>
    ipcRenderer.invoke('create-restore-point', description),
  restartComputer: () => ipcRenderer.invoke('restart-computer'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  onTweakLog: (callback: (payload: unknown) => void) => {
    const listener = (_event: unknown, payload: unknown) => callback(payload);
    ipcRenderer.on('tweak-log', listener);
    return () => ipcRenderer.removeListener('tweak-log', listener);
  },
});
