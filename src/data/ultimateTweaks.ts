import { gamerTweaks, type Tweak } from './gamerTweaks';
import { developerTweaks } from './developerTweaks';
import { tunesTweaks } from './tunesTweaks';

// Extreme options only available in Ultimate. Off by default / excluded from Recommended.
const ultimateExtra: Tweak[] = [
  // ============================================================
  //  SECURITY (extreme) — multi-step commands so they actually stick on Win11
  // ============================================================
  {
    id: 'ult-disable-defender',
    name: 'Completely Disable Windows Defender',
    description: 'Turns off real-time protection, sets Defender policies, stops Defender services, and disables Defender tasks. Reboot recommended. Only use if you accept no built-in antivirus.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    // Avoid Set-MpPreference / Stop-Service — both hang indefinitely when Tamper Protection
    // or the Defender service refuses to stop (common on VMs and locked Win11).
    target: [
      "$ErrorActionPreference='SilentlyContinue'; $ProgressPreference='SilentlyContinue'",
      "function Say([string]$m){ Write-Output $m; try { [Console]::Out.Flush() } catch {} }",
      "Say 'Clearing Image File Execution Options traps...'",
      "foreach ($exe in @('MsMpEng.exe','NisSrv.exe','SecurityHealthService.exe','SecurityHealthSystray.exe','smartscreen.exe','SecurityHealthHost.exe','Taskmgr.exe')) { Remove-Item \"HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\$exe\" -Recurse -Force -ErrorAction SilentlyContinue }",
      "Say 'Applying Defender / Security Center policies (registry)...'",
      "@('HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Spynet','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\UX Configuration','HKLM:\\SOFTWARE\\Microsoft\\Windows Defender\\Features','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Systray','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Notifications','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Virus and threat protection','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Account protection','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\App and Browser protection','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Device performance and health','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Family options','HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Firewall and network protection','HKLM:\\SOFTWARE\\WOW6432Node\\Policies\\Microsoft\\Windows Defender') | ForEach-Object { New-Item $_ -Force | Out-Null }",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' DisableAntiSpyware 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' DisableAntiVirus 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' ServiceKeepAlive 0 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' AllowFastServiceStartup 0 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\WOW6432Node\\Policies\\Microsoft\\Windows Defender' DisableAntiSpyware 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableRealtimeMonitoring 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableBehaviorMonitoring 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableOnAccessProtection 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableScanOnRealtimeEnable 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableIOAVProtection 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableRawWriteNotification 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Spynet' SubmitSamplesConsent 2 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Spynet' SpynetReporting 0 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\UX Configuration' UILockdown 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows Defender\\Features' TamperProtection 0 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows Defender\\Features' TamperProtectionSource 0 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Systray' HideSystray 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Notifications' DisableNotifications 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Notifications' DisableEnhancedNotifications 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Virus and threat protection' UILockdown 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Account protection' UILockdown 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\App and Browser protection' UILockdown 1 -Type DWord -Force",
      "Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Firewall and network protection' UILockdown 1 -Type DWord -Force",
      "Say 'Disabling Defender services (registry Start=4 + sc.exe)...'",
      "foreach ($n in @('WinDefend','WdNisSvc','Sense','MDCoreSvc','WdNisDrv','WdBoot','WdFilter')) { sc.exe stop $n 2>$null | Out-Null; sc.exe config $n start= disabled 2>$null | Out-Null; if (Test-Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$n\") { Set-ItemProperty \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$n\" Start 4 -Type DWord -Force }; Say \"  $n disabled\" }",
      "Say 'Keeping SecurityHealthService / wscsvc (Task Manager)...'",
      "foreach ($n in @('SecurityHealthService','wscsvc')) { sc.exe config $n start= demand 2>$null | Out-Null; Say \"  $n manual\" }",
      "Say 'Stopping Defender processes...'",
      "Get-Process -Name MsMpEng,NisSrv,smartscreen,SecurityHealthSystray -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue",
      "Remove-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run' -Name 'SecurityHealth' -ErrorAction SilentlyContinue",
      "Remove-ItemProperty 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run' -Name 'Windows Defender' -ErrorAction SilentlyContinue",
      "Say 'Disabling Defender scheduled tasks...'",
      "$taskRoot = Join-Path $env:SystemRoot 'System32\\Tasks\\Microsoft\\Windows\\Windows Defender'",
      "if (Test-Path $taskRoot) { Get-ChildItem $taskRoot -File -ErrorAction SilentlyContinue | ForEach-Object { $tn = 'Microsoft\\Windows\\Windows Defender\\' + $_.Name; schtasks.exe /Change /TN $tn /Disable 2>$null | Out-Null } }",
      "Say 'Installing boot task so Defender stays off after reboot...'",
      "$persistPath = Join-Path $env:ProgramData 'DeBloat\\disable-defender-boot.ps1'",
      "New-Item (Split-Path $persistPath) -ItemType Directory -Force | Out-Null",
      "$bootLines = @('$ErrorActionPreference=''SilentlyContinue''','New-Item ''HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender'' -Force | Out-Null','New-Item ''HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection'' -Force | Out-Null','Set-ItemProperty ''HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender'' DisableAntiSpyware 1 -Type DWord -Force','Set-ItemProperty ''HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender'' DisableAntiVirus 1 -Type DWord -Force','Set-ItemProperty ''HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection'' DisableRealtimeMonitoring 1 -Type DWord -Force','foreach ($n in @(''WinDefend'',''WdNisSvc'',''Sense'',''MDCoreSvc'')) { sc.exe config $n start= disabled 2>$null | Out-Null; if (Test-Path (''HKLM:\\SYSTEM\\CurrentControlSet\\Services\\'' + $n)) { Set-ItemProperty (''HKLM:\\SYSTEM\\CurrentControlSet\\Services\\'' + $n) Start 4 -Type DWord -Force } }')",
      "Set-Content -Path $persistPath -Value $bootLines -Encoding UTF8",
      "schtasks.exe /Delete /TN 'DeBloat\\DisableDefender' /F 2>$null | Out-Null",
      "schtasks.exe /Create /TN 'DeBloat\\DisableDefender' /TR \"powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `\"$persistPath`\"\" /SC ONSTART /RU SYSTEM /RL HIGHEST /F | Out-Null",
      "Say 'Defender policies applied. If Windows Security still shows green: open it, turn OFF Tamper Protection, re-Apply this tweak, then reboot.'; exit 0",
    ].join('; '),
    undo: `$ErrorActionPreference='SilentlyContinue'; schtasks.exe /Delete /TN 'DeBloat\\DisableDefender' /F 2>$null | Out-Null; Remove-Item (Join-Path $env:ProgramData 'DeBloat\\disable-defender-boot.ps1') -Force -ErrorAction SilentlyContinue; Remove-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' -Name DisableAntiSpyware -ErrorAction SilentlyContinue; Remove-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' -Name DisableAntiVirus -ErrorAction SilentlyContinue; foreach ($exe in @('MsMpEng.exe','NisSrv.exe','SecurityHealthService.exe','SecurityHealthSystray.exe','smartscreen.exe','SecurityHealthHost.exe','Taskmgr.exe')) { Remove-Item \"HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\$exe\" -Recurse -Force -ErrorAction SilentlyContinue }; foreach ($n in @('WinDefend','WdNisSvc','Sense','MDCoreSvc','SecurityHealthService','wscsvc')) { sc.exe config $n start= demand 2>$null | Out-Null }; exit 0`,
  },
  {
    id: 'ult-disable-smartscreen',
    name: 'Disable SmartScreen',
    description: 'Disables SmartScreen for apps, files, and Edge so downloads run without reputation warnings.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    target: `$ErrorActionPreference='SilentlyContinue'; Remove-Item 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\smartscreen.exe' -Recurse -Force -ErrorAction SilentlyContinue; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\System' -Force | Out-Null; New-Item 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer' -Force | Out-Null; New-Item 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\AppHost' -Force | Out-Null; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\MicrosoftEdge\\PhishingFilter' -Force | Out-Null; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Explorer' -Force | Out-Null; Set-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer' SmartScreenEnabled 'Off' -Type String -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\System' EnableSmartScreen 0 -Type DWord -Force; Set-ItemProperty 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\AppHost' EnableWebContentEvaluation 0 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Explorer' DisableSmartScreenFilterCheckOnLoad 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\MicrosoftEdge\\PhishingFilter' EnabledV9 0 -Type DWord -Force; Get-Process -Name smartscreen -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Write-Output 'SmartScreen disabled via policy (no IFEO traps)'; exit 0`,
    undo: `$ErrorActionPreference='SilentlyContinue'; Set-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer' SmartScreenEnabled 'On' -Type String -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\System' EnableSmartScreen 1 -Type DWord -Force; Remove-Item 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\smartscreen.exe' -Recurse -Force -ErrorAction SilentlyContinue; exit 0`,
  },
  {
    id: 'ult-fix-taskmgr',
    name: 'Fix Slow Task Manager',
    description: 'Clears leftover Defender process traps and restores Security Center so Task Manager opens instantly again. Run this if Task Manager takes ~10 seconds after a Defender disable.',
    category: 'Security',
    risk: 'safe',
    recommended: false,
    type: 'command',
    target: `$ErrorActionPreference='SilentlyContinue'; Write-Output 'Removing Image File Execution Options traps...'; foreach ($exe in @('MsMpEng.exe','NisSrv.exe','SecurityHealthService.exe','SecurityHealthSystray.exe','smartscreen.exe','SecurityHealthHost.exe','Taskmgr.exe','taskmgr.exe')) { Remove-Item \"HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\$exe\" -Recurse -Force -ErrorAction SilentlyContinue }; Write-Output 'Restoring Security Center services...'; foreach ($n in @('wscsvc','SecurityHealthService')) { sc.exe config $n start= demand 2>$null | Out-Null; Set-Service -Name $n -StartupType Manual -ErrorAction SilentlyContinue; Start-Service -Name $n -ErrorAction SilentlyContinue; Write-Output \"  $n\" }; Write-Output 'Task Manager fix applied — try opening Task Manager now'; exit 0`,
    undo: `$ErrorActionPreference='SilentlyContinue'; exit 0`,
  },
  {
    id: 'ult-disable-msa-signin',
    name: 'Disable Microsoft Account Sign-in Assistant',
    description: 'Stops wlidsvc (Microsoft Account Sign-in Assistant) so it no longer runs in the background.',
    category: 'Security',
    risk: 'moderate',
    recommended: false,
    type: 'command',
    target: `$ErrorActionPreference='SilentlyContinue'; foreach ($n in @('wlidsvc')) { if (Get-Service -Name $n -ErrorAction SilentlyContinue) { Stop-Service -Name $n -Force -ErrorAction SilentlyContinue; Set-Service -Name $n -StartupType Disabled -ErrorAction SilentlyContinue; sc.exe stop $n 2>$null | Out-Null; sc.exe config $n start= disabled 2>$null | Out-Null; if (Test-Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$n\") { Set-ItemProperty \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$n\" Start 4 -Type DWord -Force }; Write-Output \"Disabled $n\" } else { Write-Output \"$n not present\" } }; exit 0`,
    undo: `$ErrorActionPreference='SilentlyContinue'; Set-Service -Name 'wlidsvc' -StartupType Manual -ErrorAction SilentlyContinue; exit 0`,
  },
  {
    id: 'ult-disable-firewall',
    name: 'Completely Disable Windows Firewall',
    description: 'Turns off the firewall for Domain/Private/Public, sets Group Policy to keep it off, and silences firewall notifications. Leaves the PC exposed on the network.',
    category: 'Security',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    target: `$ErrorActionPreference='SilentlyContinue'; Write-Output 'Turning firewall profiles off...'; try { Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False -ErrorAction Stop; Write-Output 'Set-NetFirewallProfile OK' } catch { Write-Output $_.Exception.Message }; netsh advfirewall set allprofiles state off | Out-Null; Write-Output 'Applying firewall policies...'; foreach ($p in @('DomainProfile','PrivateProfile','PublicProfile')) { $path = \"HKLM:\\SOFTWARE\\Policies\\Microsoft\\WindowsFirewall\\$p\"; New-Item $path -Force | Out-Null; Set-ItemProperty $path EnableFirewall 0 -Type DWord -Force; Set-ItemProperty $path DisableNotifications 1 -Type DWord -Force }; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Notifications' -Force | Out-Null; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Notifications' DisableNotifications 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Notifications' DisableEnhancedNotifications 1 -Type DWord -Force; Write-Output 'Firewall fully disabled'; exit 0`,
    undo: `$ErrorActionPreference='SilentlyContinue'; Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True -ErrorAction SilentlyContinue; netsh advfirewall set allprofiles state on | Out-Null; exit 0`,
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
    name: 'Completely Remove Microsoft Edge',
    description: 'Force-uninstalls Edge, removes Edge Update, deletes shortcuts, and blocks Windows from putting Edge back. WebView2 is left alone so other apps keep working. Reboot after applying.',
    category: 'Apps',
    risk: 'aggressive',
    recommended: false,
    type: 'command',
    target: `$ErrorActionPreference='SilentlyContinue'; Write-Output 'Stopping Edge processes...'; Get-Process | Where-Object { $_.Name -match 'msedge|MicrosoftEdge|edgeupdate' } | Stop-Process -Force -ErrorAction SilentlyContinue; Write-Output 'Running Edge setup uninstallers...'; $pf86 = \${env:ProgramFiles(x86)}; $roots = @(\"$pf86\\Microsoft\\Edge\\Application\",\"$env:ProgramFiles\\Microsoft\\Edge\\Application\"); foreach ($root in $roots) { Get-ChildItem $root -Recurse -Filter setup.exe -ErrorAction SilentlyContinue | ForEach-Object { Write-Output ('  ' + $_.FullName); Start-Process $_.FullName -ArgumentList '--uninstall','--system-level','--force-uninstall','--verbose-logging' -Wait -WindowStyle Hidden -ErrorAction SilentlyContinue } }; Write-Output 'winget uninstall Microsoft.Edge...'; winget uninstall --id Microsoft.Edge -e --silent --force --accept-package-agreements --accept-source-agreements --disable-interactivity 2>$null | Out-Null; Write-Output 'Stopping Edge Update services...'; foreach ($n in @('edgeupdate','edgeupdatem','MicrosoftEdgeElevationService')) { Stop-Service -Name $n -Force -ErrorAction SilentlyContinue; Set-Service -Name $n -StartupType Disabled -ErrorAction SilentlyContinue; sc.exe delete $n | Out-Null }; Write-Output 'Removing shortcuts...'; @( \"$env:PUBLIC\\Desktop\\Microsoft Edge.lnk\", \"$env:USERPROFILE\\Desktop\\Microsoft Edge.lnk\", \"$env:ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Microsoft Edge.lnk\", \"$env:APPDATA\\Microsoft\\Internet Explorer\\Quick Launch\\User Pinned\\TaskBar\\Microsoft Edge.lnk\" ) | ForEach-Object { Remove-Item $_ -Force -ErrorAction SilentlyContinue }; Write-Output 'Blocking Edge reinstall policy...'; New-Item 'HKLM:\\SOFTWARE\\Microsoft\\EdgeUpdate' -Force | Out-Null; Set-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\EdgeUpdate' DoNotUpdateToEdgeWithChromium 1 -Type DWord -Force; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\EdgeUpdate' -Force | Out-Null; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\EdgeUpdate' DoNotUpdateToEdgeWithChromium 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\EdgeUpdate' InstallDefault 0 -Type DWord -Force; Write-Output 'Removing leftover Edge folders (best effort)...'; foreach ($dir in @(\"$pf86\\Microsoft\\Edge\",\"$env:ProgramFiles\\Microsoft\\Edge\",\"$pf86\\Microsoft\\EdgeUpdate\",\"$pf86\\Microsoft\\EdgeCore\")) { if (Test-Path $dir) { cmd /c ('takeown /f \"' + $dir + '\" /r /d y >nul 2>&1'); cmd /c ('icacls \"' + $dir + '\" /grant administrators:F /t >nul 2>&1'); Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue; Write-Output ('  cleaned ' + $dir) } }; Write-Output 'Edge removal finished (reboot, then check Start menu)'; exit 0`,
    undo: 'winget install Microsoft.Edge --silent --accept-package-agreements --accept-source-agreements; exit 0',
  },

  // ============================================================
  //  EXTRA SERVICES (Ultimate) — cut background process count
  // ============================================================
  {
    id: 'ult-disable-push-notifications',
    name: 'Disable Push Notification Service',
    description: 'Disables the Windows Push Notifications service that keeps toast/notification processes alive.',
    category: 'Services',
    risk: 'moderate',
    recommended: false,
    type: 'service',
    target: 'WpnService',
    value: { startup: 'disabled' },
    undo: { startup: 'automatic' },
  },
  {
    id: 'ult-disable-connected-devices',
    name: 'Disable Connected Devices Platform',
    description: 'Stops CDP background sync used for phone-link style features.',
    category: 'Services',
    risk: 'moderate',
    recommended: false,
    type: 'command',
    target: `$ErrorActionPreference='SilentlyContinue'; foreach ($s in (Get-Service -Name 'CDPSvc','CDPUserSvc*' -ErrorAction SilentlyContinue)) { Write-Output \"Disabling $($s.Name)\"; Stop-Service -Name $s.Name -Force -ErrorAction SilentlyContinue; Set-Service -Name $s.Name -StartupType Disabled -ErrorAction SilentlyContinue }; exit 0`,
    undo: `$ErrorActionPreference='SilentlyContinue'; foreach ($s in (Get-Service -Name 'CDPSvc','CDPUserSvc*' -ErrorAction SilentlyContinue)) { Set-Service -Name $s.Name -StartupType Automatic -ErrorAction SilentlyContinue }; exit 0`,
  },
  {
    id: 'ult-disable-tablet-input',
    name: 'Disable Touch Keyboard & Handwriting',
    description: 'Disables tablet input / touch keyboard services unused on most gaming desktops.',
    category: 'Services',
    risk: 'safe',
    recommended: false,
    type: 'command',
    target: `$ErrorActionPreference='SilentlyContinue'; foreach ($n in @('TabletInputService','TextInputManagementService')) { if (Get-Service -Name $n -ErrorAction SilentlyContinue) { Write-Output \"Disabling $n\"; Stop-Service -Name $n -Force -ErrorAction SilentlyContinue; Set-Service -Name $n -StartupType Disabled -ErrorAction SilentlyContinue; sc.exe config $n start= disabled | Out-Null } else { Write-Output \"$n not present\" } }; exit 0`,
    undo: `$ErrorActionPreference='SilentlyContinue'; foreach ($n in @('TabletInputService','TextInputManagementService')) { Set-Service -Name $n -StartupType Manual -ErrorAction SilentlyContinue }; exit 0`,
  },
  {
    id: 'ult-disable-misc-background',
    name: 'Disable Extra Background Services',
    description: 'Disables Phone, Font Cache, Image Acquisition, Distributed Link Tracking, and Data Usage services to cut idle processes. Leaves Display Policy running so multi-monitor layout/orientation survives reboot.',
    category: 'Services',
    risk: 'moderate',
    recommended: false,
    type: 'service',
    // Do NOT disable DispBrokerDesktopSvc — it persists dual-monitor orientation/layout across reboots.
    target: 'PhoneSvc,FontCache,stisvc,TrkWks,DusmSvc,CertPropSvc,WarpJITSvc',
    value: { startup: 'disabled' },
    undo: { startup: 'manual' },
  },
  {
    id: 'ult-keep-display-topology',
    name: 'Keep Multi-Monitor Layout on Reboot',
    description: 'Ensures the Display Policy service stays on so Portrait/Landscape and primary-screen choices are saved across restart.',
    category: 'Services',
    risk: 'safe',
    recommended: true,
    type: 'command',
    target: `$ErrorActionPreference='SilentlyContinue'; $n='DispBrokerDesktopSvc'; if (Get-Service -Name $n -ErrorAction SilentlyContinue) { Set-Service -Name $n -StartupType Automatic -ErrorAction SilentlyContinue; sc.exe config $n start= auto 2>$null | Out-Null; if (Test-Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$n\") { Set-ItemProperty \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$n\" Start 2 -Type DWord -Force }; Start-Service -Name $n -ErrorAction SilentlyContinue; Write-Output 'Display Policy service set to Automatic (monitor layout will persist)' } else { Write-Output 'DispBrokerDesktopSvc not present' }; exit 0`,
    undo: `$ErrorActionPreference='SilentlyContinue'; exit 0`,
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
    target: 'wuauserv,UsoSvc,WaaSMedicSvc,uhssvc',
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
  const baseId = tweak.id.replace(/^(dev-|ult-|tunes-)/, '');
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
  if (baseId.includes('disable-advertising-id') || baseId.includes('disable-ad-id')) return 'logical:advertising-id';
  if (baseId.includes('disable-consumer-features')) return 'logical:consumer-features';
  if (baseId.includes('disable-compat-appraiser')) return 'logical:compat-appraiser';
  if (baseId.includes('ceip')) return 'logical:ceip';
  if (baseId.includes('visual-fx') || baseId.includes('visual-effects')) return 'logical:visual-effects';
  if (baseId.includes('disable-location')) return 'logical:location';
  if (baseId.includes('game-bar') || baseId.includes('game-dvr')) return 'logical:gamedvr';
  return `${tweak.type}:${tweak.target}`;
}

const seen = new Set<string>();
const merged: Tweak[] = [];
for (const tweak of [...gamerTweaks, ...developerTweaks, ...tunesTweaks, ...ultimateExtra]) {
  const key = dedupeKey(tweak);
  if (seen.has(key)) continue;
  seen.add(key);
  merged.push(tweak);
}

export const ultimateTweaks: Tweak[] = merged;
