/*
|--------------------------------------------------------------------------
| Download Links
|--------------------------------------------------------------------------
|
| Store all secure download links here.
| These links are ONLY ever read server-side — never exposed to the browser.
|
| Keys = downloadId field from products.js
| Values = actual download URL (Google Drive, S3, etc.)
|
*/

const DOWNLOADS = Object.freeze({
  "mad-scientist": "YOUR_GOOGLE_DRIVE_FILE_LINK",
  "chatgpt-prompts": "YOUR_CHATGPT_PROMPTS_DOWNLOAD_LINK",
  "luts-pack": "YOUR_LUTS_PACK_DOWNLOAD_LINK",
});

/*
|--------------------------------------------------------------------------
| Get Download URL
|--------------------------------------------------------------------------
*/

export function getDownloadUrl(downloadId) {
  return DOWNLOADS[downloadId] || null;
}
