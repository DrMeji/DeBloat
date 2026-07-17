export type AppCategory =
  | 'Browsers'
  | 'Communications'
  | 'Development'
  | 'Games'
  | 'Multimedia'
  | 'Utilities'
  | 'Pro Tools'
  | 'Microsoft Tools'
  | 'Selfhosted';

export type AppItem = {
  id: string;
  name: string;
  category: AppCategory;
  // Best-known winget package id (used later when wiring real installs).
  winget?: string;
};

// Order the category tabs appear in.
export const appCategoryOrder: AppCategory[] = [
  'Browsers',
  'Communications',
  'Development',
  'Games',
  'Multimedia',
  'Utilities',
  'Pro Tools',
  'Microsoft Tools',
  'Selfhosted',
];

// Short labels so the tab pill stays compact (falls back to full name).
export const appCategoryLabels: Partial<Record<AppCategory, string>> = {
  'Microsoft Tools': 'MS Tools',
};

// Real brand logos via the Simple Icons CDN (https://cdn.simpleicons.org/<slug>),
// which serves each logo in its official brand color. Keyed by app id.
// Anything not listed here falls back to a letter avatar in the UI, and any
// slug that fails to load also falls back gracefully.
export const appIconSlugs: Record<string, string> = {
  // Browsers
  brave: 'brave',
  chrome: 'googlechrome',
  chromium: 'googlechrome',
  edge: 'microsoftedge',
  firefox: 'firefoxbrowser',
  'firefox-esr': 'firefoxbrowser',
  floorp: 'floorp',
  librewolf: 'librewolf',
  'mullvad-browser': 'mullvad',
  'tor-browser': 'torbrowser',
  'ungoogled-chromium': 'googlechrome',
  vivaldi: 'vivaldi',
  'zen-browser': 'zenbrowser',

  // Communications
  discord: 'discord',
  element: 'element',
  'proton-mail': 'protonmail',
  qtox: 'qtox',
  signal: 'signal',
  slack: 'slack',
  telegram: 'telegram',
  thunderbird: 'thunderbird',
  viber: 'viber',
  whatsapp: 'whatsapp',
  zoom: 'zoom',
  teamspeak3: 'teamspeak',

  // Development
  'chatgpt-desktop': 'openai',
  'claude-desktop': 'claude',
  'claude-code': 'claude',
  cmake: 'cmake',
  codex: 'openai',
  git: 'git',
  'github-desktop': 'github',
  go: 'go',
  'jetbrains-toolbox': 'jetbrains',
  lua: 'lua',
  neovim: 'neovim',
  nodejs: 'nodedotjs',
  'nodejs-lts': 'nodedotjs',
  pnpm: 'pnpm',
  python3: 'python',
  ruby: 'ruby',
  rust: 'rust',
  'sublime-text': 'sublimetext',
  unity: 'unity',
  vscodium: 'vscodium',
  yarn: 'yarn',
  zed: 'zedindustries',

  // Games
  'ea-app': 'ea',
  'epic-games': 'epicgames',
  'geforce-now': 'nvidia',
  'gog-galaxy': 'gogdotcom',
  itch: 'itchdotio',
  modrinth: 'modrinth',
  steam: 'steam',
  'ubisoft-connect': 'ubisoft',

  // Multimedia
  'acrobat-reader': 'adobeacrobatreader',
  audacity: 'audacity',
  blender: 'blender',
  gimp: 'gimp',
  handbrake: 'handbrake',
  libreoffice: 'libreoffice',
  'notepad-plus-plus': 'notepadplusplus',
  obs: 'obsstudio',
  obsidian: 'obsidian',
  vlc: 'vlcmediaplayer',

  // Utilities
  '1password': '1password',
  anydesk: 'anydesk',
  autohotkey: 'autohotkey',
  bitwarden: 'bitwarden',
  dropbox: 'dropbox',
  'google-drive': 'googledrive',
  keepassxc: 'keepassxc',
  'proton-drive': 'proton',
  'proton-pass': 'protonpass',
  qbittorrent: 'qbittorrent',
  teamviewer: 'teamviewer',
  virtualbox: 'virtualbox',

  // Pro Tools
  'mullvad-vpn': 'mullvad',
  'proton-vpn': 'protonvpn',
  wireshark: 'wireshark',
  wireguard: 'wireguard',

  // Microsoft Tools
  onedrive: 'microsoftonedrive',

  // Selfhosted
  'jellyfin-media-player': 'jellyfin',
  'jellyfin-server': 'jellyfin',
  kodi: 'kodi',
  'plex-media-server': 'plex',
  'plex-desktop': 'plex',
  'nextcloud-desktop': 'nextcloud',
};

// Second fallback: real (multi-color) logos pulled from each app's own website
// favicon via Google's favicon service. Used when there is no Simple Icons slug
// or the Simple Icons logo fails to load. Covers Microsoft products (Edge, VS
// Code, Teams, OneDrive…) and niche apps Simple Icons doesn't carry. Value is a
// domain (optionally with a path) that resolves to the correct product logo.
export const appIconUrls: Record<string, string> = {
  // Browsers
  edge: 'microsoft.com/edge',
  waterfox: 'waterfox.net',
  'zen-browser': 'zen-browser.app',

  // Communications
  teams: 'teams.microsoft.com',
  betterbird: 'betterbird.eu',
  vesktop: 'github.com/Vencord/Vesktop',

  // Development
  cursor: 'cursor.com',
  zed: 'zed.dev',
  vscode: 'code.visualstudio.com',
  'vs-2022': 'visualstudio.microsoft.com',
  'vs-2026': 'visualstudio.microsoft.com',
  'corretto-21': 'aws.amazon.com/corretto',
  'corretto-25': 'aws.amazon.com/corretto',
  'corretto-8': 'aws.amazon.com/corretto',
  uv: 'astral.sh',

  // Games
  'geforce-now': 'nvidia.com/geforce-now',
  cemu: 'cemu.info',
  heroic: 'heroicgameslauncher.com',
  playnite: 'playnite.link',
  'prism-launcher': 'prismlauncher.org',

  // Multimedia
  '7zip': '7-zip.org',
  sharex: 'getsharex.com',
  'paint-net': 'getpaint.net',
  onlyoffice: 'onlyoffice.com',
  calibre: 'calibre-ebook.com',
  irfanview: 'irfanview.com',
  imageglass: 'imageglass.org',
  aimp: 'aimp.ru',

  // Utilities
  everything: 'voidtools.com',
  winrar: 'win-rar.com',
  rufus: 'rufus.ie',
  'revo-uninstaller': 'revouninstaller.com',
  parsec: 'parsec.app',
  openrgb: 'openrgb.org',
  'process-lasso': 'bitsum.com',
  'treesize-free': 'jam-software.com',
  wiztree: 'diskanalyzer.com',
  peazip: 'peazip.github.io',
  nanazip: 'github.com/M2Team/NanaZip',
  files: 'files.community',

  // Pro Tools
  'cpu-z': 'cpuid.com',
  'gpu-z': 'techpowerup.com',
  hwinfo: 'hwinfo.com',
  nmap: 'nmap.org',
  ventoy: 'ventoy.net',
  winscp: 'winscp.net',

  // Microsoft Tools
  powertoys: 'learn.microsoft.com/windows/powertoys',
  'windows-terminal': 'github.com/microsoft/terminal',
  powershell: 'github.com/PowerShell/PowerShell',

  // Selfhosted
  localsend: 'localsend.org',
  netbird: 'netbird.io',
  sunshine: 'github.com/LizardByte/Sunshine',
  moonlight: 'moonlight-stream.org',
};

export const appsCatalog: AppItem[] = [
  // ============================================================
  //  BROWSERS
  // ============================================================
  { id: 'brave', name: 'Brave', category: 'Browsers', winget: 'Brave.Brave' },
  { id: 'chrome', name: 'Chrome', category: 'Browsers', winget: 'Google.Chrome' },
  { id: 'chromium', name: 'Chromium', category: 'Browsers', winget: 'Hibbiki.Chromium' },
  { id: 'edge', name: 'Edge', category: 'Browsers', winget: 'Microsoft.Edge' },
  { id: 'firefox', name: 'Firefox', category: 'Browsers', winget: 'Mozilla.Firefox' },
  { id: 'firefox-esr', name: 'Firefox ESR', category: 'Browsers', winget: 'Mozilla.Firefox.ESR' },
  { id: 'floorp', name: 'Floorp', category: 'Browsers', winget: 'Ablaze.Floorp' },
  { id: 'helium', name: 'Helium', category: 'Browsers' },
  { id: 'librewolf', name: 'LibreWolf', category: 'Browsers', winget: 'LibreWolf.LibreWolf' },
  { id: 'mullvad-browser', name: 'Mullvad Browser', category: 'Browsers', winget: 'MullvadVPN.MullvadBrowser' },
  { id: 'tor-browser', name: 'Tor Browser', category: 'Browsers', winget: 'TorProject.TorBrowser' },
  { id: 'ungoogled-chromium', name: 'Ungoogled Chromium', category: 'Browsers', winget: 'eloston.ungoogled-chromium' },
  { id: 'vivaldi', name: 'Vivaldi', category: 'Browsers', winget: 'Vivaldi.Vivaldi' },
  { id: 'waterfox', name: 'Waterfox', category: 'Browsers', winget: 'Waterfox.Waterfox' },
  { id: 'zen-browser', name: 'Zen Browser', category: 'Browsers', winget: 'Zen-Team.Zen-Browser' },

  // ============================================================
  //  COMMUNICATIONS
  // ============================================================
  { id: 'betterbird', name: 'Betterbird', category: 'Communications', winget: 'Betterbird.Betterbird' },
  { id: 'chatterino', name: 'Chatterino', category: 'Communications', winget: 'ChatterinoTeam.Chatterino' },
  { id: 'discord', name: 'Discord', category: 'Communications', winget: 'Discord.Discord' },
  { id: 'dorion', name: 'Dorion', category: 'Communications', winget: 'SpikeHD.Dorion' },
  { id: 'element', name: 'Element', category: 'Communications', winget: 'Element.Element' },
  { id: 'proton-mail', name: 'Proton Mail', category: 'Communications', winget: 'Proton.ProtonMail' },
  { id: 'qtox', name: 'QTox', category: 'Communications', winget: 'Tox.qTox' },
  { id: 'signal', name: 'Signal', category: 'Communications', winget: 'OpenWhisperSystems.Signal' },
  { id: 'slack', name: 'Slack', category: 'Communications', winget: 'SlackTechnologies.Slack' },
  { id: 'teams', name: 'Teams', category: 'Communications', winget: 'Microsoft.Teams' },
  { id: 'teamspeak3', name: 'TeamSpeak 3', category: 'Communications', winget: 'TeamSpeakSystems.TeamSpeakClient' },
  { id: 'telegram', name: 'Telegram', category: 'Communications', winget: 'Telegram.TelegramDesktop' },
  { id: 'thunderbird', name: 'Thunderbird', category: 'Communications', winget: 'Mozilla.Thunderbird' },
  { id: 'vesktop', name: 'Vesktop', category: 'Communications', winget: 'Vencord.Vesktop' },
  { id: 'viber', name: 'Viber', category: 'Communications', winget: 'Viber.Viber' },
  { id: 'whatsapp', name: 'WhatsApp Desktop', category: 'Communications', winget: '9NKSQGP7F2NH' },
  { id: 'zoom', name: 'Zoom', category: 'Communications', winget: 'Zoom.Zoom' },

  // ============================================================
  //  DEVELOPMENT
  // ============================================================
  { id: 'chatgpt-desktop', name: 'ChatGPT Desktop', category: 'Development', winget: 'OpenAI.ChatGPT' },
  { id: 'claude-desktop', name: 'Claude Desktop', category: 'Development', winget: 'Anthropic.Claude' },
  { id: 'claude-code', name: 'Claude Code', category: 'Development', winget: 'Anthropic.ClaudeCode' },
  { id: 'cmake', name: 'CMake', category: 'Development', winget: 'Kitware.CMake' },
  { id: 'codex', name: 'Codex', category: 'Development', winget: 'OpenAI.Codex' },
  { id: 'cursor', name: 'Cursor', category: 'Development', winget: 'Anysphere.Cursor' },
  { id: 'git', name: 'Git', category: 'Development', winget: 'Git.Git' },
  { id: 'github-desktop', name: 'GitHub Desktop', category: 'Development', winget: 'GitHub.GitHubDesktop' },
  { id: 'go', name: 'Go', category: 'Development', winget: 'GoLang.Go' },
  { id: 'corretto-21', name: 'Amazon Corretto 21 (LTS)', category: 'Development', winget: 'Amazon.Corretto.21.JDK' },
  { id: 'corretto-25', name: 'Amazon Corretto 25 (LTS)', category: 'Development', winget: 'Amazon.Corretto.25.JDK' },
  { id: 'corretto-8', name: 'Amazon Corretto 8 (LTS)', category: 'Development', winget: 'Amazon.Corretto.8.JDK' },
  { id: 'jetbrains-toolbox', name: 'JetBrains Toolbox', category: 'Development', winget: 'JetBrains.Toolbox' },
  { id: 'lazygit', name: 'Lazygit', category: 'Development', winget: 'JesseDuffield.lazygit' },
  { id: 'lua', name: 'Lua', category: 'Development', winget: 'DEVCOM.Lua' },
  { id: 'neovim', name: 'Neovim', category: 'Development', winget: 'Neovim.Neovim' },
  { id: 'nodejs', name: 'NodeJS', category: 'Development', winget: 'OpenJS.NodeJS' },
  { id: 'nodejs-lts', name: 'NodeJS LTS', category: 'Development', winget: 'OpenJS.NodeJS.LTS' },
  { id: 'pnpm', name: 'pnpm', category: 'Development', winget: 'pnpm.pnpm' },
  { id: 'oh-my-posh', name: 'Oh My Posh (Prompt)', category: 'Development', winget: 'JanDeDobbeleer.OhMyPosh' },
  { id: 'python3', name: 'Python3', category: 'Development', winget: 'Python.Python.3.13' },
  { id: 'ruby', name: 'Ruby', category: 'Development', winget: 'RubyInstallerTeam.Ruby.3.3' },
  { id: 'rust', name: 'Rust', category: 'Development', winget: 'Rustlang.Rustup' },
  { id: 'sublime-text', name: 'Sublime Text', category: 'Development', winget: 'SublimeHQ.SublimeText.4' },
  { id: 'system-informer', name: 'System Informer', category: 'Development', winget: 'WinsiderSS.SystemInformer' },
  { id: 'unity', name: 'Unity Game Engine', category: 'Development', winget: 'Unity.UnityHub' },
  { id: 'uv', name: 'uv', category: 'Development', winget: 'astral-sh.uv' },
  { id: 'vs-2022', name: 'Visual Studio 2022', category: 'Development', winget: 'Microsoft.VisualStudio.2022.Community' },
  { id: 'vs-2026', name: 'Visual Studio 2026', category: 'Development' },
  { id: 'vscode', name: 'VS Code', category: 'Development', winget: 'Microsoft.VisualStudioCode' },
  { id: 'vscodium', name: 'VS Codium', category: 'Development', winget: 'VSCodium.VSCodium' },
  { id: 'yarn', name: 'Yarn', category: 'Development', winget: 'Yarn.Yarn' },
  { id: 'zed', name: 'Zed', category: 'Development', winget: 'Zed.Zed' },

  // ============================================================
  //  GAMES
  // ============================================================
  { id: 'cemu', name: 'Cemu', category: 'Games', winget: 'Cemu.Cemu' },
  { id: 'ea-app', name: 'EA App', category: 'Games', winget: 'ElectronicArts.EADesktop' },
  { id: 'epic-games', name: 'Epic Games Launcher', category: 'Games', winget: 'EpicGames.EpicGamesLauncher' },
  { id: 'geforce-now', name: 'GeForce NOW', category: 'Games', winget: 'Nvidia.GeForceNow' },
  { id: 'gog-galaxy', name: 'GOG Galaxy', category: 'Games', winget: 'GOG.Galaxy' },
  { id: 'heroic', name: 'Heroic Games Launcher', category: 'Games', winget: 'HeroicGamesLauncher.HeroicGamesLauncher' },
  { id: 'itch', name: 'Itch.io', category: 'Games', winget: 'ItchIo.Itch' },
  { id: 'modrinth', name: 'Modrinth App', category: 'Games', winget: 'Modrinth.ModrinthApp' },
  { id: 'overwolf', name: 'Overwolf', category: 'Games', winget: 'Overwolf.Overwolf' },
  { id: 'playnite', name: 'Playnite', category: 'Games', winget: 'Playnite.Playnite' },
  { id: 'prism-launcher', name: 'Prism Launcher', category: 'Games', winget: 'PrismLauncher.PrismLauncher' },
  { id: 'steam', name: 'Steam', category: 'Games', winget: 'Valve.Steam' },
  { id: 'ubisoft-connect', name: 'Ubisoft Connect', category: 'Games', winget: 'Ubisoft.Connect' },
  { id: 'virtual-desktop-streamer', name: 'Virtual Desktop Streamer', category: 'Games', winget: 'VirtualDesktop.Streamer' },

  // ============================================================
  //  MULTIMEDIA
  // ============================================================
  { id: 'acrobat-reader', name: 'Adobe Acrobat Reader', category: 'Multimedia', winget: 'Adobe.Acrobat.Reader.64-bit' },
  { id: 'aimp', name: 'AIMP (Music Player)', category: 'Multimedia', winget: 'AIMP.AIMP' },
  { id: 'audacity', name: 'Audacity', category: 'Multimedia', winget: 'Audacity.Audacity' },
  { id: 'blender', name: 'Blender (3D Graphics)', category: 'Multimedia', winget: 'BlenderFoundation.Blender' },
  { id: 'calibre', name: 'Calibre', category: 'Multimedia', winget: 'calibre.calibre' },
  { id: 'eartrumpet', name: 'EarTrumpet (Audio)', category: 'Multimedia', winget: 'File-New-Project.EarTrumpet' },
  { id: 'gimp', name: 'GIMP (Image Editor)', category: 'Multimedia', winget: 'GIMP.GIMP' },
  { id: 'handbrake', name: 'HandBrake', category: 'Multimedia', winget: 'HandBrake.HandBrake' },
  { id: 'imageglass', name: 'ImageGlass (Image Viewer)', category: 'Multimedia', winget: 'DuongDieuPhap.ImageGlass' },
  { id: 'irfanview', name: 'IrfanView', category: 'Multimedia', winget: 'IrfanSkiljan.IrfanView' },
  { id: 'itunes', name: 'iTunes', category: 'Multimedia', winget: 'Apple.iTunes' },
  { id: 'klite', name: 'K-Lite Codec Standard', category: 'Multimedia', winget: 'CodecGuide.K-LiteCodecPack.Standard' },
  { id: 'libreoffice', name: 'LibreOffice', category: 'Multimedia', winget: 'TheDocumentFoundation.LibreOffice' },
  { id: 'mpc-qt', name: 'mpc-qt', category: 'Multimedia' },
  { id: 'mpc-hc', name: 'Media Player Classic', category: 'Multimedia', winget: 'clsid2.mpc-hc' },
  { id: 'naps2', name: 'NAPS2 (Document Scanner)', category: 'Multimedia', winget: 'Cyanfish.NAPS2' },
  { id: 'nomacs', name: 'nomacs', category: 'Multimedia', winget: 'nomacs.nomacs' },
  { id: 'notepad-plus-plus', name: 'Notepad++', category: 'Multimedia', winget: 'Notepad++.Notepad++' },
  { id: 'obs', name: 'OBS Studio', category: 'Multimedia', winget: 'OBSProject.OBSStudio' },
  { id: 'obsidian', name: 'Obsidian', category: 'Multimedia', winget: 'Obsidian.Obsidian' },
  { id: 'onlyoffice', name: 'ONLYOFFICE Desktop', category: 'Multimedia', winget: 'ONLYOFFICE.DesktopEditors' },
  { id: 'paint-net', name: 'Paint.NET', category: 'Multimedia', winget: 'dotPDN.PaintDotNet' },
  { id: 'sharex', name: 'ShareX (Screenshots)', category: 'Multimedia', winget: 'ShareX.ShareX' },
  { id: 'vlc', name: 'VLC (Video Player)', category: 'Multimedia', winget: 'VideoLAN.VLC' },

  // ============================================================
  //  UTILITIES
  // ============================================================
  { id: '1password', name: '1Password', category: 'Utilities', winget: 'AgileBits.1Password' },
  { id: '7zip', name: '7-Zip', category: 'Utilities', winget: '7zip.7zip' },
  { id: 'anydesk', name: 'AnyDesk', category: 'Utilities', winget: 'AnyDeskSoftwareGmbH.AnyDesk' },
  { id: 'autohotkey', name: 'AutoHotkey', category: 'Utilities', winget: 'AutoHotkey.AutoHotkey' },
  { id: 'bitwarden', name: 'Bitwarden', category: 'Utilities', winget: 'Bitwarden.Bitwarden' },
  { id: 'blurautoclicker', name: 'BlurAutoClicker', category: 'Utilities' },
  { id: 'bcuninstaller', name: 'Bulk Crap Uninstaller', category: 'Utilities', winget: 'Klocman.BulkCrapUninstaller' },
  { id: 'crystaldiskinfo', name: 'Crystal Disk Info', category: 'Utilities', winget: 'CrystalDewWorld.CrystalDiskInfo' },
  { id: 'crystaldiskmark', name: 'Crystal Disk Mark', category: 'Utilities', winget: 'CrystalDewWorld.CrystalDiskMark' },
  { id: 'deskflow', name: 'Deskflow', category: 'Utilities' },
  { id: 'dropbox', name: 'Dropbox', category: 'Utilities', winget: 'Dropbox.Dropbox' },
  { id: 'ente-auth', name: 'Ente Auth', category: 'Utilities', winget: 'Ente.Auth' },
  { id: 'everything', name: 'Everything', category: 'Utilities', winget: 'voidtools.Everything' },
  { id: 'files', name: 'Files', category: 'Utilities', winget: 'Files-Community.Files' },
  { id: 'flux', name: 'F.lux', category: 'Utilities', winget: 'flux.flux' },
  { id: 'glazewm', name: 'GlazeWM', category: 'Utilities', winget: 'glzr-io.glazewm' },
  { id: 'google-drive', name: 'Google Drive', category: 'Utilities', winget: 'Google.GoogleDrive' },
  { id: 'hugo', name: 'Hugo', category: 'Utilities', winget: 'Hugo.Hugo.Extended' },
  { id: 'idm', name: 'Internet Download Manager', category: 'Utilities', winget: 'Tonec.InternetDownloadManager' },
  { id: 'jpegview', name: 'JPEG View', category: 'Utilities', winget: 'sylikc.JPEGView' },
  { id: 'keepassxc', name: 'KeePassXC', category: 'Utilities', winget: 'KeePassXCTeam.KeePassXC' },
  { id: 'minitool-partition', name: 'MiniTool Partition Wizard', category: 'Utilities', winget: 'MiniTool.PartitionWizard.Free' },
  { id: 'msedgeredirect', name: 'MSEdgeRedirect', category: 'Utilities', winget: 'rcmaehl.MSEdgeRedirect' },
  { id: 'msi-afterburner', name: 'MSI Afterburner', category: 'Utilities', winget: 'Guru3D.Afterburner' },
  { id: 'nanazip', name: 'NanaZip', category: 'Utilities', winget: 'M2Team.NanaZip' },
  { id: 'nilesoft-shell', name: 'Nilesoft Shell', category: 'Utilities', winget: 'Nilesoft.Shell' },
  { id: 'nvcleanstall', name: 'NVCleanstall', category: 'Utilities', winget: 'TechPowerUp.NVCleanstall' },
  { id: 'ofgb', name: 'OFGB (Oh Frick Go Back)', category: 'Utilities', winget: 'xM4ddy.OFGB' },
  { id: 'opautoclicker', name: 'OPAutoClicker', category: 'Utilities', winget: 'OPAutoClicker.OPAutoClicker' },
  { id: 'openrgb', name: 'OpenRGB', category: 'Utilities', winget: 'CalcProgrammer1.OpenRGB' },
  { id: 'virtualbox', name: 'Oracle VirtualBox', category: 'Utilities', winget: 'Oracle.VirtualBox' },
  { id: 'parsec', name: 'Parsec', category: 'Utilities', winget: 'Parsec.Parsec' },
  { id: 'peazip', name: 'PeaZip', category: 'Utilities', winget: 'Giorgiotani.Peazip' },
  { id: 'policy-plus', name: 'Policy Plus', category: 'Utilities', winget: 'Fleex255.PolicyPlus' },
  { id: 'process-lasso', name: 'Process Lasso', category: 'Utilities', winget: 'BitSum.ProcessLasso' },
  { id: 'proton-authenticator', name: 'Proton Authenticator', category: 'Utilities', winget: 'Proton.ProtonAuthenticator' },
  { id: 'proton-drive', name: 'Proton Drive', category: 'Utilities', winget: 'Proton.ProtonDrive' },
  { id: 'proton-pass', name: 'Proton Pass', category: 'Utilities', winget: 'Proton.ProtonPass' },
  { id: 'qbittorrent', name: 'qBittorrent', category: 'Utilities', winget: 'qBittorrent.qBittorrent' },
  { id: 'revo-uninstaller', name: 'Revo Uninstaller', category: 'Utilities', winget: 'RevoUninstaller.RevoUninstaller' },
  { id: 'rufus', name: 'Rufus Imager', category: 'Utilities', winget: 'Rufus.Rufus' },
  { id: 'snappy-driver', name: 'Snappy Driver Installer Origin', category: 'Utilities', winget: 'GlennDelahoy.SnappyDriverInstallerOrigin' },
  { id: 'signalrgb', name: 'SignalRGB', category: 'Utilities', winget: 'WhirlwindFX.SignalRgb' },
  { id: 'startallback', name: 'StartAllBack', category: 'Utilities', winget: 'StartIsBack.StartAllBack' },
  { id: 'teamviewer', name: 'TeamViewer', category: 'Utilities', winget: 'TeamViewer.TeamViewer' },
  { id: 'tightvnc', name: 'TightVNC', category: 'Utilities', winget: 'GlavSoft.TightVNC' },
  { id: 'total-commander', name: 'Total Commander', category: 'Utilities', winget: 'Ghisler.TotalCommander' },
  { id: 'treesize-free', name: 'TreeSize Free', category: 'Utilities', winget: 'JAMSoftware.TreeSize.Free' },
  { id: 'translucenttb', name: 'TranslucentTB', category: 'Utilities', winget: '9PF4KZ2VN4W9' },
  { id: 'unigetui', name: 'UniGetUI', category: 'Utilities', winget: 'MartiCliment.UniGetUI' },
  { id: 'winrar', name: 'WinRAR', category: 'Utilities', winget: 'RARLab.WinRAR' },
  { id: 'wise-program-uninstaller', name: 'Wise Program Uninstaller', category: 'Utilities', winget: 'WiseCleaner.WiseProgramUninstaller' },
  { id: 'wiztree', name: 'WizTree', category: 'Utilities', winget: 'AntibodySoftware.WizTree' },
  { id: 'hxd', name: 'HxD Hex Editor', category: 'Utilities', winget: 'MHNexus.HxD' },

  // ============================================================
  //  PRO TOOLS
  // ============================================================
  { id: 'advanced-ip-scanner', name: 'Advanced IP Scanner', category: 'Pro Tools', winget: 'Famatech.AdvancedIPScanner' },
  { id: 'angry-ip-scanner', name: 'Angry IP Scanner', category: 'Pro Tools', winget: 'angryziber.AngryIPScanner' },
  { id: 'cinebench-r23', name: 'Cinebench R23', category: 'Pro Tools', winget: 'Maxon.CinebenchR23' },
  { id: 'cpu-z', name: 'CPU-Z', category: 'Pro Tools', winget: 'CPUID.CPU-Z' },
  { id: 'ddu', name: 'Display Driver Uninstaller', category: 'Pro Tools', winget: 'Wagnardsoft.DisplayDriverUninstaller' },
  { id: 'gpu-z', name: 'GPU-Z', category: 'Pro Tools', winget: 'TechPowerUp.GPU-Z' },
  { id: 'gsudo', name: 'gsudo', category: 'Pro Tools', winget: 'gerardog.gsudo' },
  { id: 'hwinfo', name: 'HWiNFO', category: 'Pro Tools', winget: 'REALiX.HWiNFO' },
  { id: 'mullvad-vpn', name: 'Mullvad VPN', category: 'Pro Tools', winget: 'MullvadVPN.MullvadVPN' },
  { id: 'nmap', name: 'Nmap', category: 'Pro Tools', winget: 'Insecure.Nmap' },
  { id: 'openvpn-connect', name: 'OpenVPN Connect', category: 'Pro Tools', winget: 'OpenVPNTechnologies.OpenVPNConnect' },
  { id: 'proton-vpn', name: 'Proton VPN', category: 'Pro Tools', winget: 'Proton.ProtonVPN' },
  { id: 'putty', name: 'PuTTY', category: 'Pro Tools', winget: 'PuTTY.PuTTY' },
  { id: 'simplewall', name: 'Simplewall', category: 'Pro Tools', winget: 'Henry++.simplewall' },
  { id: 'ventoy', name: 'Ventoy', category: 'Pro Tools', winget: 'Ventoy.Ventoy' },
  { id: 'winscp', name: 'WinSCP', category: 'Pro Tools', winget: 'WinSCP.WinSCP' },
  { id: 'wireguard', name: 'WireGuard', category: 'Pro Tools', winget: 'WireGuard.WireGuard' },
  { id: 'wireshark', name: 'Wireshark', category: 'Pro Tools', winget: 'WiresharkFoundation.Wireshark' },

  // ============================================================
  //  MICROSOFT TOOLS
  // ============================================================
  { id: 'autoruns', name: 'Autoruns', category: 'Microsoft Tools', winget: 'Microsoft.Sysinternals.Autoruns' },
  { id: 'dismtools', name: 'DISMTools', category: 'Microsoft Tools' },
  { id: 'dotnet-10', name: '.NET Desktop Runtime 10', category: 'Microsoft Tools', winget: 'Microsoft.DotNet.DesktopRuntime.Preview' },
  { id: 'dotnet-6', name: '.NET Desktop Runtime 6', category: 'Microsoft Tools', winget: 'Microsoft.DotNet.DesktopRuntime.6' },
  { id: 'dotnet-8', name: '.NET Desktop Runtime 8', category: 'Microsoft Tools', winget: 'Microsoft.DotNet.DesktopRuntime.8' },
  { id: 'dotnet-9', name: '.NET Desktop Runtime 9', category: 'Microsoft Tools', winget: 'Microsoft.DotNet.DesktopRuntime.9' },
  { id: 'ntlite', name: 'NTLite', category: 'Microsoft Tools', winget: 'Nlitesoft.NTLite' },
  { id: 'nuget', name: 'NuGet', category: 'Microsoft Tools', winget: 'Microsoft.NuGet' },
  { id: 'onedrive', name: 'OneDrive', category: 'Microsoft Tools', winget: 'Microsoft.OneDrive' },
  { id: 'powershell', name: 'PowerShell', category: 'Microsoft Tools', winget: 'Microsoft.PowerShell' },
  { id: 'powertoys', name: 'PowerToys', category: 'Microsoft Tools', winget: 'Microsoft.PowerToys' },
  { id: 'process-explorer', name: 'Process Explorer', category: 'Microsoft Tools', winget: 'Microsoft.Sysinternals.ProcessExplorer' },
  { id: 'process-monitor', name: 'Process Monitor', category: 'Microsoft Tools', winget: 'Microsoft.Sysinternals.ProcessMonitor' },
  { id: 'rdcman', name: 'RDCMan', category: 'Microsoft Tools', winget: 'Microsoft.Sysinternals.RDCMan' },
  { id: 'tcpview', name: 'TCPView', category: 'Microsoft Tools', winget: 'Microsoft.Sysinternals.TCPView' },
  { id: 'windows-terminal', name: 'Windows Terminal', category: 'Microsoft Tools', winget: 'Microsoft.WindowsTerminal' },
  { id: 'vcredist-32', name: 'Visual C++ 2015-2022 32-bit', category: 'Microsoft Tools', winget: 'Microsoft.VCRedist.2015+.x86' },
  { id: 'vcredist-64', name: 'Visual C++ 2015-2022 64-bit', category: 'Microsoft Tools', winget: 'Microsoft.VCRedist.2015+.x64' },

  // ============================================================
  //  SELFHOSTED
  // ============================================================
  { id: 'jellyfin-media-player', name: 'Jellyfin Media Player', category: 'Selfhosted', winget: 'Jellyfin.JellyfinMediaPlayer' },
  { id: 'jellyfin-server', name: 'Jellyfin Server', category: 'Selfhosted', winget: 'Jellyfin.Server' },
  { id: 'kodi', name: 'Kodi Media Center', category: 'Selfhosted', winget: 'XBMCFoundation.Kodi' },
  { id: 'localsend', name: 'LocalSend', category: 'Selfhosted', winget: 'LocalSend.LocalSend' },
  { id: 'moonlight', name: 'Moonlight/GameStream Client', category: 'Selfhosted', winget: 'MoonlightGameStreamingProject.Moonlight' },
  { id: 'netbird', name: 'NetBird', category: 'Selfhosted', winget: 'Netbird.Netbird' },
  { id: 'nextcloud-desktop', name: 'Nextcloud Desktop', category: 'Selfhosted', winget: 'Nextcloud.NextcloudDesktop' },
  { id: 'plex-media-server', name: 'Plex Media Server', category: 'Selfhosted', winget: 'Plex.PlexMediaServer' },
  { id: 'plex-desktop', name: 'Plex Desktop', category: 'Selfhosted', winget: 'Plex.Plex' },
  { id: 'sunshine', name: 'Sunshine/GameStream Server', category: 'Selfhosted', winget: 'LizardByte.Sunshine' },
];
