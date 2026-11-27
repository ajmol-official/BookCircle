/**
 * Resize and compress an uploaded image file to a lightweight JPEG Data URL
 * so covers and avatars load quickly and avoid multi-megabyte database payloads.
 */
export function compressImageFile(
  file: File,
  maxDimension = 520,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (!dataUrl || typeof dataUrl !== 'string') {
        reject(new Error('Failed to read image file.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxDimension / img.width, maxDimension / img.height, 1);
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Invalid or unsupported image file.'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Prevents duplicating large inline base64 data URLs into secondary tables
 * (e.g., borrow_requests metadata or books.owner_avatar).
 * Regular http(s) URLs pass through unchanged; small data URLs pass if under limit.
 */
export function sanitizeEmbeddedImageUrl(
  url?: string | null,
  maxDataUrlChars = 16000
): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') && trimmed.length > maxDataUrlChars) {
    return '';
  }
  return trimmed;
}
