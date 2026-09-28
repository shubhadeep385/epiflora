
export function assetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const cleanPath = path.replace(/^\//, '');
  const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
}
