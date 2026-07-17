import { gamerTweaks, type Tweak } from './gamerTweaks';
import { developerTweaks } from './developerTweaks';

// The most aggressive, system-altering options. These are OFF by default and
// deliberately excluded from the "Recommended" preset. They can leave the PC
// less secure or less functional, which is why the Ultimate tab is gated behind
// a warning screen.
const ultimateExtra: Tweak[] = [
  // ============================================================
  //  SECURITY (extreme)
  // ============================================================
  {
    id: 'ult-disable-defender',
    name: 'Disable Microsoft Defender',
    description: 'Turns off Defender antivirus via policy. Only do this if you run a third party antivirus.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows Defender',
    value: { name: 'DisableAntiSpyware', type: 'DWORD', data: 1 },
    undo: { name: 'DisableAntiSpyware', type: 'DWORD', data: 0 },
  },
  {
    id: 'ult-disable-smartscreen',
    name: 'Disable SmartScreen',
    description: 'Disables the SmartScreen filter so downloaded files and apps run without reputation warnings.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer',
    value: { name: 'SmartScreenEnabled', type: 'SZ', data: 'Off' },
    undo: { name: 'SmartScreenEnabled', type: 'SZ', data: 'On' },
  },
  {
    id: 'ult-disable-firewall',
    name: 'Disable Windows Firewall',
    description: 'Turns off the Windows Firewall for all network profiles. Leaves the PC exposed on the network.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    target: 'netsh advfirewall set allprofiles state off',
    undo: 'netsh advfirewall set allprofiles state on',
  },
  {
    id: 'ult-disable-uac',
    name: 'Disable User Account Control (UAC)',
    description: 'Stops the "Do you want to allow this app to make changes" prompts. Requires a reboot.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System',
    value: { name: 'EnableLUA', type: 'DWORD', data: 0 },
    undo: { name: 'EnableLUA', type: 'DWORD', data: 1 },
  },

  // ============================================================
  //  APPS (extreme)
  // ============================================================
  {
    id: 'ult-remove-edge',
    name: 'Remove Microsoft Edge',
    description: 'Attempts to fully uninstall Microsoft Edge. Some Windows features that rely on Edge may break.',
    category: 'Apps',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    target: "$base = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application'; $s = Get-ChildItem $base -Recurse -Filter setup.exe -ErrorAction SilentlyContinue | Select-Object -First 1; if ($s) { Start-Process $s.FullName -ArgumentList '--uninstall','--system-level','--force-uninstall' -Wait }",
    undo: 'winget install Microsoft.Edge --silent --accept-package-agreements --accept-source-agreements',
  },

  // ============================================================
  //  WINDOWS UPDATE (extreme)
  // ============================================================
  {
    id: 'ult-disable-update-service',
    name: 'Disable Windows Update Service',
    description: 'Stops and disables the Windows Update services so updates no longer download or install automatically.',
    category: 'Services',
    risk: 'aggressive',
    recommended: false,
    type: 'service',
    target: 'wuauserv,UsoSvc',
    value: { startup: 'disabled' },
    undo: { startup: 'manual' },
  },
  {
    id: 'ult-block-update-policy',
    name: 'Block Automatic Windows Updates',
    description: 'Sets a policy so Windows never downloads or installs updates on its own. You can still update manually.',
    category: 'Services',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU',
    value: { name: 'NoAutoUpdate', type: 'DWORD', data: 1 },
    undo: { name: 'NoAutoUpdate', type: 'DWORD', data: 0 },
  },
];

// Combine every Gamer + Developer tweak with the extreme extras, de-duplicated
// by type+target so the same underlying change never appears twice. The first
// occurrence wins (Gamer entries take priority over Developer duplicates).
const seen = new Set<string>();
const merged: Tweak[] = [];
for (const tweak of [...gamerTweaks, ...developerTweaks, ...ultimateExtra]) {
  const key = `${tweak.type}:${tweak.target}`;
  if (seen.has(key)) continue;
  seen.add(key);
  merged.push(tweak);
}

export const ultimateTweaks: Tweak[] = merged;
