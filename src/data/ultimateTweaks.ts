import type { Tweak } from './gamerTweaks';

export const ultimateTweaks: Tweak[] = [
  // ============================================================
  //  PERFORMANCE
  // ============================================================
  {
    id: 'ult-disable-spectre-meltdown',
    name: 'Disable Spectre & Meltdown Mitigations',
    description: 'Disables CPU security mitigations for a significant performance boost. This carries a security risk.',
    category: 'Performance',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management',
    value: { name: 'FeatureSettingsOverride', type: 'DWORD', data: 3 },
    undo: { name: 'FeatureSettingsOverride', type: 'DWORD', data: 0 },
  },
  {
    id: 'ult-disable-memory-compression',
    name: 'Disable Memory Compression',
    description: 'Disables RAM compression. Can improve performance on systems with 16GB+ RAM but may harm low-RAM systems.',
    category: 'Performance',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    target: 'Disable-MMAgent -MemoryCompression',
    undo: 'Enable-MMAgent -MemoryCompression',
  },
  {
    id: 'ult-enable-ultimate-performance',
    name: 'Enable Ultimate Performance Power Plan',
    description: 'Activates the hidden Ultimate Performance power plan for maximum system responsiveness.',
    category: 'Performance',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target: 'powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 && powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61',
    undo: 'powercfg /setactive 381b4222-f694-41f0-9685-ff5bb260df2e',
  },

  // ============================================================
  //  SERVICES
  // ============================================================
  {
    id: 'ult-disable-sysmain',
    name: 'Disable SysMain (Superfetch)',
    description: 'Disables the SysMain service, which can cause high disk usage. Recommended for systems with SSDs.',
    category: 'Services',
    risk: 'moderate',
    recommended: true,
    type: 'service',
    target: 'SysMain',
    value: { startup: 'disabled' },
    undo: { startup: 'auto' },
  },
  {
    id: 'ult-disable-wsearch',
    name: 'Disable Windows Search Indexing',
    description: 'Stops background file indexing, which can improve performance on large codebases but slows down manual file searches.',
    category: 'Services',
    risk: 'moderate',
    recommended: true,
    type: 'service',
    target: 'WSearch',
    value: { startup: 'disabled' },
    undo: { startup: 'auto' },
  },
  {
    id: 'ult-disable-delivery-optimization',
    name: 'Disable Update P2P Sharing',
    description: 'Stops your PC from uploading Windows Update files to other machines on the internet. May slightly slow down updates.',
    category: 'Services',
    risk: 'aggressive',
    recommended: false,
    type: 'service',
    target: 'DoSvc',
    value: { startup: 'disabled' },
    undo: { startup: 'auto' },
  },

  // ============================================================
  //  SECURITY
  // ============================================================
  {
    id: 'ult-disable-defender',
    name: 'Disable Microsoft Defender',
    description: 'Completely disables Microsoft Defender Antivirus. Only do this if you have a third-party antivirus installed.',
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
    description: 'Disables the SmartScreen filter for apps and files, which can speed up opening downloaded files but reduces security.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer',
    value: { name: 'SmartScreenEnabled', type: 'SZ', data: 'Off' },
    undo: { name: 'SmartScreenEnabled', type: 'SZ', data: 'On' },
  },
];
