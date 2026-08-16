import { getDownloadUrl } from "./downloads";

/**
 * Storage Abstraction Layer
 * 
 * This module isolates the file-delivery mechanics from the rest of the checkout system.
 * It currently maps to Google Drive redirect links for the MVP.
 * 
 * --------------------------------------------------------------------------
 * MVP LIMITATION WARNING:
 * --------------------------------------------------------------------------
 * The current Google Drive 302 redirect mechanism does NOT offer strong anti-sharing protection.
 * While the Next.js download endpoint authorizes the transaction and checks download counters
 * *before* issuing the redirect, the final target Google Drive URL can be copied from the browser
 * or network manager and shared. Anyone who gets the direct Google Drive link will be able to
 * download the file directly from Google Drive, completely bypassing our authorization checks.
 * 
 * --------------------------------------------------------------------------
 * PRODUCTION REPLACEMENT:
 * --------------------------------------------------------------------------
 * To secure files against unauthorized link sharing, replace this implementation with an
 * object storage provider (e.g. AWS S3, Google Cloud Storage, or Cloudflare R2) and use the 
 * SDK to generate short-lived, pre-signed URLs (which expire after 10-15 minutes).
 * 
 * @param {object} product - Database product record
 * @param {object} order - Database order record
 * @returns {string|null} The direct download redirect URL
 */
export function getAuthorizedDownload(product, order) {
  if (!product || !product.google_drive_file_id) {
    console.error(`[Storage] Product metadata or Google Drive File ID is missing for product: ${product?.slug}`);
    return null;
  }

  console.log(`[Storage] Authorizing download attempt for product: ${product.name}, Order ID: ${order.id}`);

  // Construct Google Drive Direct Download URL
  return `https://drive.google.com/uc?export=download&id=${product.google_drive_file_id}`;
}
