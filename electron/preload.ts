import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  
  // System information
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Optimization operations
  applyOptimization: (profile: string, options: string[]) => 
    ipcRenderer.invoke('apply-optimization', profile, options),
  restoreOptimization: (backupId: string) => 
    ipcRenderer.invoke('restore-optimization', backupId),
  createRestorePoint: () => ipcRenderer.invoke('create-restore-point'),
  
  // Platform detection
  platform: process.platform
});
