import { gamerTweaks, type Tweak } from './gamerTweaks';
import { developerTweaks } from './developerTweaks';

// ------------------------------------------------------------------
//  Ultimate-only tweaks: the aggressive "nuke it" options that do not
//  belong in the Gamer or Developer presets. These leave the system
//  faster/leaner but far less protected. Every one is recommended:false
//  so the "Recommended" preset never enables them by accident.
// ------------------------------------------------------------------
const ultimateExtra: Tweak[] = [
  // ============================================================
  //  SECURITY  (danger zone)
  // ============================================================
  {
    id: 'ult-disable-defender-policy',
    name: 'Completely Disable Windows Defender',
    description: 'Turns off Microsoft Defender antivirus entirely via policy (real-time + cloud protection). Your PC will have NO built-in antivirus. Requires Tamper Protection to be off first.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows Defender',
    value: { name: 'DisableAntiSpyware', type: 'DWORD', data: 1 },
    undo: { name: 'DisableAntiSpyware', type: 'DWORD', data: 0 },
  },
  {
    id: 'ult-disable-defender-services',
    name: 'Disable Defender Services',
    description: 'Disables the Defender background services (WinDefend, network inspection, and the Advanced Threat sensor) so nothing scans in the background.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'service',
    target: 'WinDefend,WdNisSvc,Sense',
    value: { startup: 'disabled' },
    undo: { startup: 'auto' },
  },
  {
    id: 'ult-disable-security-center',
    name: 'Disable Security Center',
    description: 'Disables the Windows Security Center service (wscsvc) and its tray notifications.',
    category: 'Security',
    risk: 'moderate',
    recommended: false,
    type: 'service',
    target: 'wscsvc',
    value: { startup: 'disabled' },
    undo: { startup: 'auto' },
  },
  {
    id: 'ult-disable-smartscreen',
    name: 'Disable SmartScreen',
    description: 'Turns off the SmartScreen reputation check for apps and downloads. Removes the "Windows protected your PC" prompt.',
    category: 'Security',
    risk: 'moderate',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\System',
    value: { name: 'EnableSmartScreen', type: 'DWORD', data: 0 },
    undo: { name: 'EnableSmartScreen', type: 'DWORD', data: 1 },
  },
  {
    id: 'ult-disable-firewall',
    name: 'Disable Windows Firewall',
    description: 'Turns off the firewall for all profiles (Domain, Private, Public). Your PC will accept all inbound/outbound traffic unfiltered.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    target: 'netsh advfirewall set allprofiles state off',
    undo: 'netsh advfirewall set allprofiles state on',
  },
  {
    id: 'ult-disable-uac',
    name: 'Disable UAC Prompts',
    description: 'Stops Windows from asking for admin confirmation. Apps can make system changes without prompting. Requires a reboot.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    value: { name: 'EnableLUA', type: 'DWORD', data: 0 },
    undo: { name: 'EnableLUA', type: 'DWORD', data: 1 },
  },

  // ============================================================
  //  APPS  (complete removals)
  // ============================================================
  {
    id: 'ult-remove-edge',
    name: 'Completely Remove Microsoft Edge',
    description: 'Force-uninstalls Microsoft Edge and its updater. WARNING: some Windows features (widgets, certain help/search panels) rely on Edge WebView and may break.',
    category: 'Apps',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    target: 'setup.exe --uninstall --system-level --verbose-logging --force-uninstall',
    undo: 'winget install Microsoft.Edge --silent',
  },
  {
    id: 'ult-remove-edge-update',
    name: 'Block Edge Reinstall',
    description: 'Disables the Edge update services (edgeupdate, edgeupdatem) so Windows cannot silently reinstall Edge.',
    category: 'Apps',
    risk: 'moderate',
    recommended: false,
    type: 'service',
    target: 'edgeupdate,edgeupdatem',
    value: { startup: 'disabled' },
    undo: { startup: 'auto' },
  },

  // ============================================================
  //  SERVICES  (Windows Update kill switch)
  // ============================================================
  {
    id: 'ult-disable-wu-services',
    name: 'Completely Disable Windows Update',
    description: 'Disables the Windows Update services (wuauserv, UsoSvc, WaaSMedicSvc) so Windows can never re-update itself. Manual Store/app updates still work.',
    category: 'Services',
    risk: 'aggressive',
    recommended: false,
    type: 'service',
    target: 'wuauserv,UsoSvc,WaaSMedicSvc',
    value: { startup: 'disabled' },
    undo: { startup: 'manual' },
  },
  {
    id: 'ult-disable-wu-policy',
    name: 'Lock Out Windows Update (Policy)',
    description: 'Sets the NoAutoUpdate policy so the system will never automatically download or install Windows updates.',
    category: 'Services',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU',
    value: { name: 'NoAutoUpdate', type: 'DWORD', data: 1 },
    undo: { name: 'NoAutoUpdate', type: 'DWORD', data: 0 },
  },

  // ============================================================
  //  SCHEDULED TASKS  (Windows Update + Defender tasks)
  // ============================================================
  {
    id: 'ult-disable-wu-task',
    name: 'Disable Windows Update Task',
    description: 'Disables the scheduled task that silently kicks off Windows Update in the background.',
    category: 'Scheduled Tasks',
    risk: 'aggressive',
    recommended: false,
    type: 'task',
    target: '\\Microsoft\\Windows\\WindowsUpdate\\Scheduled Start',
    value: 'disable',
    undo: 'enable',
  },
  {
    id: 'ult-disable-uso-task',
    name: 'Disable Update Orchestrator Scan',
    description: 'Disables the Update Orchestrator scheduled scan that re-arms Windows Update.',
    category: 'Scheduled Tasks',
    risk: 'aggressive',
    recommended: false,
    type: 'task',
    target: '\\Microsoft\\Windows\\UpdateOrchestrator\\Schedule Scan',
    value: 'disable',
    undo: 'enable',
  },

  // ============================================================
  //  PERFORMANCE  (extra-aggressive)
  // ============================================================
  {
    id: 'ult-disable-prefetch',
    name: 'Disable Prefetch',
    description: 'Turns off the Prefetcher. Recommended only on SSDs; can slow first-launch of apps on HDDs.',
    category: 'Performance',
    risk: 'moderate',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management\\PrefetchParameters',
    value: { name: 'EnablePrefetcher', type: 'DWORD', data: 0 },
    undo: { name: 'EnablePrefetcher', type: 'DWORD', data: 3 },
  },
  {
    id: 'ult-disable-reserved-storage',
    name: 'Disable Reserved Storage',
    description: 'Frees the ~7GB Windows reserves for updates. Pairs well with disabling Windows Update.',
    category: 'Performance',
    risk: 'moderate',
    recommended: false,
    type: 'command',
    target: 'DISM /Online /Set-ReservedStorageState /State:Disabled',
    undo: 'DISM /Online /Set-ReservedStorageState /State:Enabled',
  },
];

// De-duplicate the merged Gamer + Developer sets by type+target so the
// same underlying change never appears twice in the Ultimate list.
const seen = new Set<string>();
const merged: Tweak[] = [];
for (const t of [...gamerTweaks, ...developerTweaks]) {
  const key = `${t.type}:${t.target}`;
  if (seen.has(key)) continue;
  seen.add(key);
  merged.push(t);
}

export const ultimateTweaks: Tweak[] = [...merged, ...ultimateExtra];
