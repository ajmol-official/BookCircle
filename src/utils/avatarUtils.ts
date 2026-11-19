/**
 * Utility to sanitize user avatar URLs.
 * Eradicates placeholder stock images (e.g., legacy Unsplash stock photos)
 * and returns empty string '' so authentic fallback initials badges render cleanly.
 */
export function cleanAvatarUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  // Filter out known legacy stock placeholder photos
  if (
    trimmed.includes('photo-1534528741775-53994a69daeb') ||
    trimmed.includes('photo-1535713875002-d1d0cf377fde')
  ) {
    return '';
  }
  return trimmed;
}

export function getUserInitials(name?: string | null): string {
  if (!name || !name.trim()) return 'BC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
