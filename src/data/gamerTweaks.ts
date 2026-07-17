export type Tweak = {
  id: string;
  name: string;
  description: string;
  category: 'Apps' | 'Services' | 'Performance' | 'Privacy' | 'Scheduled Tasks';
  risk: 'safe' | 'moderate' | 'aggressive';
  recommended: boolean;
  type: 'appx' | 'service' | 'registry' | 'task' | 'command';
  target: string;
  value?: Record<string, unknown> | string | number;
  undo: Record<string, unknown> | string | number;
};

export const gamerTweaks: Tweak[] = [
  // == APPS ==
  {
    id: 'remove-xbox-apps',
    name: 'Remove Unnecessary Xbox Apps',
    description: 'Removes optional Xbox apps like the Console Companion. Does not affect the main Xbox app required for PC Game Pass.',
    category: 'Apps',
    risk: 'safe',
    recommended: true,
    type: 'appx',
    target: 'Microsoft.XboxApp, Microsoft.XboxGamingOverlay, Microsoft.XboxSpeechToTextOverlay',
    undo: { command: 'Install-XboxApps' },
  },
  {
    id: 'remove-mixed-reality',
    name: 'Remove Mixed Reality Portal',
    description: 'Uninstalls the Mixed Reality Portal and related components, freeing up space and resources.',
    category: 'Apps',
    risk: 'safe',
    recommended: true,
    type: 'appx',
    target: 'Microsoft.Windows.MixedReality.Portal',
    undo: { command: 'Install-MixedReality' },
  },
  {
    id: 'remove-solitaire',
    name: 'Remove Solitaire Collection',
    description: 'Removes the pre-installed Microsoft Solitaire Collection and its related background services.',
    category: 'Apps',
    risk: 'safe',
    recommended: true,
    type: 'appx',
    target: 'Microsoft.MicrosoftSolitaireCollection',
    undo: { command: 'Install-Solitaire' },
  },

  // == SERVICES ==
  {
    id: 'disable-diagtrack',
    name: 'Disable Telemetry Service',
    description: "Disables the 'Connected User Experiences and Telemetry' service to prevent data collection by Microsoft.",
    category: 'Services',
    risk: 'safe',
    recommended: true,
    type: 'service',
    target: 'DiagTrack',
    value: { startup: 'disabled' },
    undo: { startup: 'auto' },
  },
  {
    id: 'disable-dmwappushservice',
    name: 'Disable WAP Push Message Routing Service',
    description: 'Disables a service related to device management that is not required for gaming.',
    category: 'Services',
    risk: 'safe',
    recommended: true,
    type: 'service',
    target: 'dmwappushservice',
    value: { startup: 'disabled' },
    undo: { startup: 'auto' },
  },
  {
    id: 'disable-sysmain',
    name: 'Disable SysMain (Superfetch)',
    description: 'Disables the SysMain service, which can sometimes cause high disk usage and performance issues during gaming.',
    category: 'Services',
    risk: 'moderate',
    recommended: false,
    type: 'service',
    target: 'SysMain',
    value: { startup: 'disabled' },
    undo: { startup: 'auto' },
  },

  // == PERFORMANCE ==
  {
    id: 'disable-game-dvr',
    name: 'Disable Game DVR & Game Bar',
    description: 'Disables the built-in Windows Game DVR and Game Bar features, which can improve performance and stability.',
    category: 'Performance',
    risk: 'safe',
    recommended: true,
    type: 'registry',
    target: 'HKEY_CURRENT_USER\\System\\GameConfigStore',
    value: { name: 'GameDVR_Enabled', type: 'DWORD', data: 0 },
    undo: { name: 'GameDVR_Enabled', type: 'DWORD', data: 1 },
  },
  {
    id: 'enable-ultimate-performance',
    name: 'Enable Ultimate Performance Power Plan',
    description: 'Activates and sets the Ultimate Performance power plan for maximum system responsiveness.',
    category: 'Performance',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target: 'powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61 && powercfg /setactive e9a42b02-d5df-448d-aa00-03f14749eb61',
    undo: 'powercfg /setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c', // Sets back to Balanced
  },
  {
    id: 'disable-spectre-meltdown',
    name: 'Disable Spectre & Meltdown Mitigations',
    description: 'Disables CPU security mitigations. Can significantly boost performance but increases security risks.',
    category: 'Performance',
    risk: 'aggressive',
    recommended: false,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management',
    value: { name: 'FeatureSettingsOverride', type: 'DWORD', data: 3 },
    undo: { name: 'FeatureSettingsOverride', type: 'DWORD', data: 0 },
  },

  // == PRIVACY ==
  {
    id: 'disable-advertising-id',
    name: 'Disable Advertising ID',
    description: 'Prevents apps from using your advertising ID for personalized ads and tracking across applications.',
    category: 'Privacy',
    risk: 'safe',
    recommended: true,
    type: 'registry',
    target: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\AdvertisingInfo',
    value: { name: 'Enabled', type: 'DWORD', data: 0 },
    undo: { name: 'Enabled', type: 'DWORD', data: 1 },
  },
  {
    id: 'disable-location-tracking',
    name: 'Disable Location Tracking',
    description: 'Turns off the system-wide location service to prevent apps and Windows from tracking your physical location.',
    category: 'Privacy',
    risk: 'safe',
    recommended: true,
    type: 'registry',
    target: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\lfsvc\\Service\\Configuration',
    value: { name: 'Status', type: 'DWORD', data: 1 },
    undo: { name: 'Status', type: 'DWORD', data: 0 },
  },

  // == SCHEDULED TASKS ==
  {
    id: 'disable-compat-appraiser',
    name: 'Disable Compatibility Appraiser Task',
    description: 'Disables a scheduled task that collects program telemetry to assess system compatibility.',
    category: 'Scheduled Tasks',
    risk: 'safe',
    recommended: true,
    type: 'task',
    target: '\\Microsoft\\Windows\\Application Experience\\Microsoft Compatibility Appraiser',
    value: 'disable',
    undo: 'enable',
  },
  {
    id: 'disable-ceip-tasks',
    name: 'Disable Customer Experience Tasks',
    description: 'Disables scheduled tasks related to the Customer Experience Improvement Program (CEIP).',
    category: 'Scheduled Tasks',
    risk: 'safe',
    recommended: true,
    type: 'task',
    target: '\\Microsoft\\Windows\\Customer Experience Improvement Program\\Consolidator',
    value: 'disable',
    undo: 'enable',
  },
];
