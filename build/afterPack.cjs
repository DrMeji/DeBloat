/**
 * electron-builder skips rcedit when signAndEditExecutable is false
 * (needed to avoid winCodeSign symlink issues). This hook still embeds
 * the app icon and requireAdministrator so UAC runs on launch.
 */
const path = require('path');

exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') return;

  const exeName = `${context.packager.appInfo.productFilename}.exe`;
  const exePath = path.join(context.appOutDir, exeName);
  const iconPath = path.join(__dirname, 'icon.ico');

  const { rcedit } = await import('rcedit');
  await rcedit(exePath, {
    icon: iconPath,
    'requested-execution-level': 'requireAdministrator',
  });

  console.log(`[afterPack] Embedded icon + requireAdministrator into ${exeName}`);
};
