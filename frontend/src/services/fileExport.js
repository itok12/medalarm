import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { isNativeMobilePlatform } from './nativePlatform';

/**
 * Hands a generated file to the user. Browsers download it; the Android/iOS
 * WebView has no download support, so native apps write it to the cache and
 * open the share sheet (save to Files, email it, send it to a doctor...).
 */
export async function exportTextFile({ filename, blob, title }) {
  if (isNativeMobilePlatform()) {
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: await blob.text(),
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({ title, files: [uri] });
    return;
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
