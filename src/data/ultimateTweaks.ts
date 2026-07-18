import { gamerTweaks, type Tweak } from './gamerTweaks';
import { developerTweaks } from './developerTweaks';

// Extreme options only available in Ultimate. Off by default / excluded from Recommended.
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
    id: 'ult-remove-xbox-full',
    name: 'Remove Xbox & Xbox Live Apps',
    description: 'Fully removes the Xbox app, Xbox Live components, and related overlays. Game Pass and Xbox networking features will stop working.',
    category: 'Apps',
    risk: 'aggressive',
    recommended: false,
    type: 'appx',
    target: 'Microsoft.GamingApp,Microsoft.XboxApp,Microsoft.Xbox.TCUI,Microsoft.XboxGameCallableUI,Microsoft.XboxIdentityProvider,Microsoft.XboxGamingOverlay,Microsoft.XboxSpeechToTextOverlay,Microsoft.XboxGameOverlay',
    permanent: true,
    undo: { command: 'reinstall' },
  },
  {
    id: 'ult-disable-xbox-services',
    name: 'Disable Xbox Live Services',
    description: 'Stops Xbox Live auth and networking services that keep running in the background even when you are not gaming.',
    category: 'Services',
    risk: 'aggressive',
    recommended: false,
    type: 'service',
    target: 'XblAuthManager,XblGameSave,XboxNetApiSvc,XboxGipSvc',
    value: { startup: 'disabled' },
    undo: { startup: 'manual' },
  },
  {
    id: 'ult-remove-bing-search',
    name: 'Remove Bing Search App',
    description: 'Removes the Bing Search / Windows Search companion app that stays tied to Edge and web results.',
    category: 'Apps',
    risk: 'moderate',
    recommended: false,
    type: 'appx',
    target: 'Microsoft.BingSearch',
    permanent: true,
    undo: { command: 'reinstall' },
  },
  {
    id: 'ult-remove-edge',
    name: 'Remove Microsoft Edge',
    description: 'Force-uninstalls Microsoft Edge (browser). Some Windows panels that embed Edge may break.',
    category: 'Apps',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    target: "$ErrorActionPreference='SilentlyContinue'; Get-Process msedge,MicrosoftEdge,MicrosoftEdgeUpdate -ErrorAction SilentlyContinue | Stop-Process -Force; $setups = @(); $setups += Get-ChildItem 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application' -Recurse -Filter setup.exe -ErrorAction SilentlyContinue; $setups += Get-ChildItem 'C:\\Program Files\\Microsoft\\Edge\\Application' -Recurse -Filter setup.exe -ErrorAction SilentlyContinue; foreach ($s in $setups) { Write-Output \"Running Edge uninstaller: $($s.FullName)\"; Start-Process $s.FullName -ArgumentList '--uninstall','--system-level','--force-uninstall','--verbose-logging' -Wait -ErrorAction SilentlyContinue }; winget uninstall --id Microsoft.Edge -e --silent --accept-package-agreements --accept-source-agreements --disable-interactivity 2>$null; Write-Output 'Edge removal attempted'",
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

function dedupeKey(tweak: Tweak): string {
  const baseId = tweak.id.replace(/^(dev-|ult-)/, '');
  // Collapse profile variants of the same logical change (e.g. two OneDrive entries).
  if (baseId.includes('onedrive') || /onedrive/i.test(tweak.name)) return 'logical:onedrive';
  if (baseId.includes('memory-compression')) return 'logical:memory-compression';
  if (baseId.includes('program-data-updater')) return 'logical:program-data-updater';
  if (baseId.includes('disable-fax')) return 'logical:fax';
  if (baseId.includes('enable-ultimate-performance')) return 'logical:ultimate-perf';
  if (baseId.includes('disable-power-throttling')) return 'logical:power-throttling';
  if (baseId.includes('disable-diagtrack')) return 'logical:diagtrack';
  if (baseId.includes('disable-sysmain')) return 'logical:sysmain';
  if (baseId.includes('disable-wsearch')) return 'logical:wsearch';
  if (baseId.includes('disable-telemetry-policy')) return 'logical:telemetry-policy';
  if (baseId.includes('disable-advertising-id')) return 'logical:advertising-id';
  if (baseId.includes('disable-consumer-features')) return 'logical:consumer-features';
  if (baseId.includes('disable-compat-appraiser')) return 'logical:compat-appraiser';
  if (baseId.includes('ceip')) return 'logical:ceip';
  return `${tweak.type}:${tweak.target}`;
}

const seen = new Set<string>();
const merged: Tweak[] = [];
for (const tweak of [...gamerTweaks, ...developerTweaks, ...ultimateExtra]) {
  const key = dedupeKey(tweak);
  if (seen.has(key)) continue;
  seen.add(key);
  merged.push(tweak);
}

export const ultimateTweaks: Tweak[] = merged;
