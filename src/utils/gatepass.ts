export function generateQrToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Normalize scanned QR payload into a raw token accepted by RPC endpoints.
 * Supports raw tokens, prefixed payloads (e.g. "POS_JAGA:<token>"),
 * and URLs carrying token in query/path.
 */
export function normalizeScannedQrToken(raw: string): string {
  const value = raw.trim();
  if (!value) return value;

  // Accept simple prefixed formats produced by custom generators.
  const prefixed = value.match(/^(?:POS_JAGA|GATEPASS)\s*[:|]\s*(.+)$/i);
  if (prefixed?.[1]) return prefixed[1].trim();

  // Accept URL payloads and extract known token keys.
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      const queryToken =
        url.searchParams.get('token') ||
        url.searchParams.get('qr_token') ||
        url.searchParams.get('pos_token');
      if (queryToken) return queryToken.trim();

      const pathToken = url.pathname.split('/').filter(Boolean).pop();
      if (pathToken) return pathToken.trim();
    } catch {
      // Fallback to original value when payload is not a valid URL.
    }
  }

  return value;
}
