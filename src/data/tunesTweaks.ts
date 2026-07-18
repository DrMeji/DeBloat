import type { Tweak } from './gamerTweaks';

/** Basic Windows “Tunes” — light, safe defaults for a cleaner gaming desktop. */
export const tunesTweaks: Tweak[] = [
  // ============================================================
  //  APPEARANCE
  // ============================================================
  {
    id: 'tunes-dark-mode',
    name: 'Use Dark Mode',
    description: 'Sets Windows and apps to dark theme (most people prefer this for gaming).',
    category: 'Appearance',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$p='HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize'; " +
      "New-Item -Path $p -Force | Out-Null; " +
      "Set-ItemProperty -Path $p -Name AppsUseLightTheme -Type DWord -Value 0; " +
      "Set-ItemProperty -Path $p -Name SystemUsesLightTheme -Type DWord -Value 0; " +
      "Write-Output 'Dark mode enabled'; exit 0",
    undo:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$p='HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize'; " +
      "New-Item -Path $p -Force | Out-Null; " +
      "Set-ItemProperty -Path $p -Name AppsUseLightTheme -Type DWord -Value 1; " +
      "Set-ItemProperty -Path $p -Name SystemUsesLightTheme -Type DWord -Value 1; " +
      "Write-Output 'Light mode restored'; exit 0",
  },
  {
    id: 'tunes-disable-transparency',
    name: 'Disable Transparency Effects',
    description: 'Turns off acrylic/transparency on the taskbar and Start for a flatter, snappier look.',
    category: 'Appearance',
    risk: 'safe',
    recommended: true,
    type: 'registry',
    target: 'HKEY_CURRENT_USER\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize',
    value: { name: 'EnableTransparency', type: 'DWORD', data: 0 },
    undo: { name: 'EnableTransparency', type: 'DWORD', data: 1 },
  },
  {
    id: 'tunes-visual-fx-best-performance',
    name: 'Visual Effects: Best Performance',
    description:
      'Same as Advanced System Settings → Performance → “Adjust for best performance”: cuts animations and fancy effects for gaming.',
    category: 'Appearance',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$vx='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects'; " +
      "New-Item -Path $vx -Force | Out-Null; " +
      "Set-ItemProperty -Path $vx -Name VisualFXSetting -Type DWord -Value 2; " +
      "$adv='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced'; " +
      "New-Item -Path $adv -Force | Out-Null; " +
      "Set-ItemProperty -Path $adv -Name TaskbarAnimations -Type DWord -Value 0; " +
      "Set-ItemProperty -Path $adv -Name ListviewAlphaSelect -Type DWord -Value 0; " +
      "Set-ItemProperty -Path $adv -Name ListviewShadow -Type DWord -Value 0; " +
      "Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop\\WindowMetrics' -Name MinAnimate -Value '0'; " +
      "Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name DragFullWindows -Value '0'; " +
      "Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name MenuShowDelay -Value '0'; " +
      "Set-ItemProperty -Path 'HKCU:\\Control Panel\\Desktop' -Name UserPreferencesMask -Type Binary -Value ([byte[]](0x90,0x12,0x03,0x80,0x10,0x00,0x00,0x00)); " +
      "$dwm='HKCU:\\Software\\Microsoft\\Windows\\DWM'; New-Item -Path $dwm -Force | Out-Null; " +
      "Set-ItemProperty -Path $dwm -Name EnableAeroPeek -Type DWord -Value 0; " +
      "Set-ItemProperty -Path $dwm -Name AlwaysHibernateThumbnails -Type DWord -Value 0; " +
      "Write-Output 'Visual effects set to Adjust for best performance'; exit 0",
    undo:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$vx='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VisualEffects'; " +
      "New-Item -Path $vx -Force | Out-Null; " +
      "Set-ItemProperty -Path $vx -Name VisualFXSetting -Type DWord -Value 0; " +
      "Write-Output 'Visual effects restored to Let Windows choose'; exit 0",
  },

  // ============================================================
  //  SEARCH
  // ============================================================
  {
    id: 'tunes-disable-bing-search',
    name: 'Remove Bing from Windows Search',
    description: 'Stops the search box from querying Bing/web results so it stays local file/app search.',
    category: 'Search',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$s='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search'; New-Item -Path $s -Force | Out-Null; " +
      "Set-ItemProperty -Path $s -Name BingSearchEnabled -Type DWord -Value 0; " +
      "Set-ItemProperty -Path $s -Name CortanaConsent -Type DWord -Value 0; " +
      "$p='HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer'; New-Item -Path $p -Force | Out-Null; " +
      "Set-ItemProperty -Path $p -Name DisableSearchBoxSuggestions -Type DWord -Value 1; " +
      "$w='HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search'; New-Item -Path $w -Force | Out-Null; " +
      "Set-ItemProperty -Path $w -Name DisableWebSearch -Type DWord -Value 1; " +
      "Set-ItemProperty -Path $w -Name ConnectedSearchUseWeb -Type DWord -Value 0; " +
      "Set-ItemProperty -Path $w -Name AllowCortana -Type DWord -Value 0; " +
      "Write-Output 'Bing/web search disabled in Windows Search'; exit 0",
    undo:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$s='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Search'; " +
      "Set-ItemProperty -Path $s -Name BingSearchEnabled -Type DWord -Value 1 -ErrorAction SilentlyContinue; " +
      "Remove-ItemProperty -Path 'HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer' -Name DisableSearchBoxSuggestions -ErrorAction SilentlyContinue; " +
      "Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search' -Name DisableWebSearch -ErrorAction SilentlyContinue; " +
      "Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search' -Name ConnectedSearchUseWeb -ErrorAction SilentlyContinue; " +
      "Write-Output 'Web search policies cleared'; exit 0",
  },
  {
    id: 'tunes-disable-search-highlights',
    name: 'Disable Search Highlights',
    description: 'Turns off Bing-powered highlights and tips that show up in the search box.',
    category: 'Search',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$s='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\SearchSettings'; New-Item -Path $s -Force | Out-Null; " +
      "Set-ItemProperty -Path $s -Name IsDynamicSearchBoxEnabled -Type DWord -Value 0; " +
      "$f='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Feeds\\DSB'; New-Item -Path $f -Force | Out-Null; " +
      "Set-ItemProperty -Path $f -Name ShowDynamicContent -Type DWord -Value 0; " +
      "$p='HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Feeds'; New-Item -Path $p -Force | Out-Null; " +
      "Set-ItemProperty -Path $p -Name EnableFeeds -Type DWord -Value 0; " +
      "Write-Output 'Search highlights disabled'; exit 0",
    undo:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\SearchSettings' -Name IsDynamicSearchBoxEnabled -Type DWord -Value 1 -ErrorAction SilentlyContinue; " +
      "Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Feeds' -Name EnableFeeds -ErrorAction SilentlyContinue; " +
      "Write-Output 'Search highlights restored'; exit 0",
  },

  // ============================================================
  //  PRIVACY
  // ============================================================
  {
    id: 'tunes-disable-notifications',
    name: 'Turn Off Toast Notifications',
    description: 'Disables Windows toast / push notifications so they do not pop over games.',
    category: 'Privacy',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$n='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\PushNotifications'; New-Item -Path $n -Force | Out-Null; " +
      "Set-ItemProperty -Path $n -Name ToastEnabled -Type DWord -Value 0; " +
      "$p='HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer'; New-Item -Path $p -Force | Out-Null; " +
      "Set-ItemProperty -Path $p -Name DisableNotificationCenter -Type DWord -Value 0; " +
      "$g='HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings'; New-Item -Path $g -Force | Out-Null; " +
      "Set-ItemProperty -Path $g -Name NOC_GLOBAL_SETTING_TOASTS_ENABLED -Type DWord -Value 0 -ErrorAction SilentlyContinue; " +
      "Write-Output 'Toast notifications disabled'; exit 0",
    undo:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\PushNotifications' -Name ToastEnabled -Type DWord -Value 1; " +
      "Remove-ItemProperty -Path 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Notifications\\Settings' -Name NOC_GLOBAL_SETTING_TOASTS_ENABLED -ErrorAction SilentlyContinue; " +
      "Write-Output 'Toast notifications re-enabled'; exit 0",
  },
  {
    id: 'tunes-disable-location',
    name: 'Turn Off Location',
    description: 'Disables Windows location services system-wide.',
    category: 'Privacy',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$c='HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location'; " +
      "New-Item -Path $c -Force | Out-Null; Set-ItemProperty -Path $c -Name Value -Value 'Deny'; " +
      "$p='HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\LocationAndSensors'; New-Item -Path $p -Force | Out-Null; " +
      "Set-ItemProperty -Path $p -Name DisableLocation -Type DWord -Value 1; " +
      "$s='HKLM:\\SYSTEM\\CurrentControlSet\\Services\\lfsvc\\Service\\Configuration'; " +
      "if (Test-Path $s) { Set-ItemProperty -Path $s -Name Status -Type DWord -Value 0 }; " +
      "Write-Output 'Location turned off'; exit 0",
    undo:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location' -Name Value -Value 'Allow' -ErrorAction SilentlyContinue; " +
      "Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\LocationAndSensors' -Name DisableLocation -ErrorAction SilentlyContinue; " +
      "Write-Output 'Location policy cleared'; exit 0",
  },
  {
    id: 'tunes-disable-tips',
    name: 'Turn Off Windows Tips & Suggestions',
    description: 'Stops “tips”, suggested content, and lock-screen fun facts from Microsoft.',
    category: 'Privacy',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$c='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager'; New-Item -Path $c -Force | Out-Null; " +
      "@('SubscribedContent-338389Enabled','SubscribedContent-338393Enabled','SubscribedContent-353694Enabled','SubscribedContent-353696Enabled','SoftLandingEnabled','SystemPaneSuggestionsEnabled','SilentInstalledAppsEnabled') | ForEach-Object { Set-ItemProperty -Path $c -Name $_ -Type DWord -Value 0 -ErrorAction SilentlyContinue }; " +
      "$e='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced'; New-Item -Path $e -Force | Out-Null; " +
      "Set-ItemProperty -Path $e -Name ShowSyncProviderNotifications -Type DWord -Value 0; " +
      "Write-Output 'Tips and suggestions disabled'; exit 0",
    undo:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$c='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager'; " +
      "@('SubscribedContent-338389Enabled','SoftLandingEnabled','SystemPaneSuggestionsEnabled') | ForEach-Object { Set-ItemProperty -Path $c -Name $_ -Type DWord -Value 1 -ErrorAction SilentlyContinue }; " +
      "Write-Output 'Tips settings restored'; exit 0",
  },

  // ============================================================
  //  SYSTEM
  // ============================================================
  {
    id: 'tunes-disable-storage-sense',
    name: 'Turn Off Storage Sense',
    description: 'Disables Storage Sense so Windows does not auto-delete temp files on a schedule.',
    category: 'System',
    risk: 'safe',
    recommended: true,
    type: 'registry',
    target: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\StorageSense\\Parameters\\StoragePolicy',
    value: { name: '01', type: 'DWORD', data: 0 },
    undo: { name: '01', type: 'DWORD', data: 1 },
  },
  {
    id: 'tunes-sync-windows-time',
    name: 'Sync Windows Time',
    description: 'Starts the Windows Time service and forces a clock sync with the internet time server.',
    category: 'System',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "Set-Service -Name W32Time -StartupType Automatic -ErrorAction SilentlyContinue; " +
      "Start-Service -Name W32Time -ErrorAction SilentlyContinue; " +
      "w32tm /resync /force 2>&1 | Out-String | Write-Output; " +
      "Write-Output 'Time sync requested'; exit 0",
    undo: "Write-Output 'Time sync is a one-shot action — nothing to undo'; exit 0",
  },
  {
    id: 'tunes-show-file-extensions',
    name: 'Show File Extensions',
    description: 'Always show known file extensions in Explorer (safer and clearer).',
    category: 'System',
    risk: 'safe',
    recommended: true,
    type: 'registry',
    target: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    value: { name: 'HideFileExt', type: 'DWORD', data: 0 },
    undo: { name: 'HideFileExt', type: 'DWORD', data: 1 },
  },
  {
    id: 'tunes-show-hidden-files',
    name: 'Show Hidden Files',
    description: 'Shows hidden files and folders in File Explorer.',
    category: 'System',
    risk: 'safe',
    recommended: false,
    type: 'registry',
    target: 'HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced',
    value: { name: 'Hidden', type: 'DWORD', data: 1 },
    undo: { name: 'Hidden', type: 'DWORD', data: 2 },
  },
  {
    id: 'tunes-disable-lock-screen-tips',
    name: 'Disable Lock Screen Tips',
    description: 'Turns off Spotlight fun facts and tips on the lock screen.',
    category: 'System',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "$c='HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager'; New-Item -Path $c -Force | Out-Null; " +
      "Set-ItemProperty -Path $c -Name RotatingLockScreenOverlayEnabled -Type DWord -Value 0; " +
      "Set-ItemProperty -Path $c -Name SubscribedContent-338387Enabled -Type DWord -Value 0; " +
      "$p='HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent'; New-Item -Path $p -Force | Out-Null; " +
      "Set-ItemProperty -Path $p -Name DisableWindowsSpotlightFeatures -Type DWord -Value 1; " +
      "Write-Output 'Lock screen tips disabled'; exit 0",
    undo:
      "$ErrorActionPreference='SilentlyContinue'; " +
      "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\ContentDeliveryManager' -Name RotatingLockScreenOverlayEnabled -Type DWord -Value 1 -ErrorAction SilentlyContinue; " +
      "Remove-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\CloudContent' -Name DisableWindowsSpotlightFeatures -ErrorAction SilentlyContinue; " +
      "Write-Output 'Lock screen tips restored'; exit 0",
  },
];
