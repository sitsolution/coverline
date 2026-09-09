/** Extracts a human-readable message from an Axios error response. */
export function apiError(err: unknown, fallback: string): string {
  const data = (err as any)?.response?.data;
  if (data?.detail && typeof data.detail === 'string') return data.detail;
  return fallback;
}
