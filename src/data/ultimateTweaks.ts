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
    target: `$ErrorActionPreference='SilentlyContinue'; Write-Output 'Clearing Image File Execution Options traps (fixes slow Task Manager)...'; foreach ($exe in @('MsMpEng.exe','NisSrv.exe','SecurityHealthService.exe','SecurityHealthSystray.exe','smartscreen.exe','SecurityHealthHost.exe','Taskmgr.exe')) { Remove-Item \"HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\$exe\" -Recurse -Force -ErrorAction SilentlyContinue }; Write-Output 'Applying Defender policies...'; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' -Force | Out-Null; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' -Force | Out-Null; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Spynet' -Force | Out-Null; New-Item 'HKLM:\\SOFTWARE\\Microsoft\\Windows Defender\\Features' -Force | Out-Null; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Systray' -Force | Out-Null; New-Item 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Notifications' -Force | Out-Null; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' DisableAntiSpyware 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' DisableAntiVirus 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableRealtimeMonitoring 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableBehaviorMonitoring 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableOnAccessProtection 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableScanOnRealtimeEnable 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection' DisableIOAVProtection 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Spynet' SubmitSamplesConsent 2 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows Defender\\Features' TamperProtection 0 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Systray' HideSystray 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Notifications' DisableNotifications 1 -Type DWord -Force; Set-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender Security Center\\Notifications' DisableEnhancedNotifications 1 -Type DWord -Force; Write-Output 'Disabling Defender preferences...'; try { Set-MpPreference -DisableRealtimeMonitoring $true -DisableBehaviorMonitoring $true -DisableIOAVProtection $true -DisableScriptScanning $true -DisableBlockAtFirstSeen $true -SubmitSamplesConsent 2 -MAPSReporting 0 -ErrorAction SilentlyContinue } catch { Write-Output $_.Exception.Message }; Write-Output 'Disabling antivirus engine services (leaving Security Center intact for Task Manager)...'; foreach ($n in @('WinDefend','WdNisSvc','Sense','MDCoreSvc')) { Stop-Service -Name $n -Force -ErrorAction SilentlyContinue; Set-Service -Name $n -StartupType Disabled -ErrorAction SilentlyContinue; sc.exe stop $n 2>$null | Out-Null; sc.exe config $n start= disabled 2>$null | Out-Null; if (Test-Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$n\") { Set-ItemProperty \"HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$n\" Start 4 -Type DWord -Force }; Write-Output \"  $n disabled\" }; Write-Output 'Keeping SecurityHealthService / wscsvc running (prevents ~10s Task Manager hang)...'; foreach ($n in @('SecurityHealthService','wscsvc')) { sc.exe config $n start= demand 2>$null | Out-Null; Set-Service -Name $n -StartupType Manual -ErrorAction SilentlyContinue; Start-Service -Name $n -ErrorAction SilentlyContinue; Write-Output \"  $n manual/started\" }; Write-Output 'Stopping Defender processes (not Security Health host)...'; 1..2 | ForEach-Object { Get-Process -Name MsMpEng,NisSrv,smartscreen -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 300 }; Remove-ItemProperty 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run' -Name 'SecurityHealth' -ErrorAction SilentlyContinue; Remove-ItemProperty 'HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run' -Name 'Windows Defender' -ErrorAction SilentlyContinue; Write-Output 'Disabling Defender scheduled tasks...'; Get-ScheduledTask -ErrorAction SilentlyContinue | Where-Object { $_.TaskPath -like '*Windows Defender*' -or $_.TaskName -like '*Windows Defender*' -or $_.TaskName -like '*WindowsProtection*' } | ForEach-Object { Disable-ScheduledTask -TaskName $_.TaskName -TaskPath $_.TaskPath -ErrorAction SilentlyContinue | Out-Null }; Write-Output 'Defender engine disabled (Security Center left alive for shell/Task Manager)'; exit 0`,
    undo: `$ErrorActionPreference='SilentlyContinue'; Remove-ItemProperty 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows Defender' -Name DisableAntiSpyware -ErrorAction SilentlyContinue; foreach ($exe in @('MsMpEng.exe','NisSrv.exe','SecurityHealthService.exe','SecurityHealthSystray.exe','smartscreen.exe','SecurityHealthHost.exe','Taskmgr.exe')) { Remove-Item \"HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\$exe\" -Recurse -Force -ErrorAction SilentlyContinue }; foreach ($n in @('WinDefend','WdNisSvc','Sense','MDCoreSvc','SecurityHealthService','wscsvc')) { Set-Service -Name $n -StartupType Manual -ErrorAction SilentlyContinue }; try { Set-MpPreference -DisableRealtimeMonitoring $false } catch {}; exit 0`,
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
    description: 'Disables Phone, Font Cache, Image Acquisition, Distributed Link Tracking, and Display Policy services to cut idle processes.',
    category: 'Services',
    risk: 'moderate',
    recommended: false,
    type: 'service',
    target: 'PhoneSvc,FontCache,stisvc,TrkWks,DispBrokerDesktopSvc,DusmSvc,CertPropSvc,WarpJITSvc',
    value: { startup: 'disabled' },
    undo: { startup: 'manual' },
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
