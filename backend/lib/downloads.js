const secureDownloads = {
  "chatgpt-prompts": "https://example.com/download/chatgpt-prompts.zip",
  "luts-pack": "https://example.com/download/luts-pack.zip",
  "mad-scientist": "https://example.com/download/mad-scientist.zip",
  "minimalist-icons": "https://example.com/download/minimalist-icons.zip",
  "demo-product": "https://example.com/download/demo-product-test.zip",
};

export function getDownloadUrl(downloadId) {
  return secureDownloads[downloadId] || null;
}
