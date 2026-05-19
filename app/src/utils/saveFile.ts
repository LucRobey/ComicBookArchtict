/**
 * Generic file-save helper for the local Vite API.
 * Centralises the fetch-POST-then-reload pattern used across all phase components.
 *
 * @param path    Relative path from project root (e.g. "data/lore.json")
 * @param content The data to serialise and write
 * @param reload  Optional callback to trigger a data re-fetch after save
 */
export async function saveJsonFile<T>(
  path: string,
  content: T,
  reload?: () => void,
): Promise<void> {
  const res = await fetch('/api/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || 'Save failed');
  }
  reload?.();
}

/**
 * Save a QA flag / markdown report via the raw-text endpoint.
 * Uses /api/save-qa which writes the string as-is (no JSON.stringify wrapping).
 *
 * @param path    Relative path from project root (e.g. "qa/lore/flag_shot_...md")
 * @param content Raw markdown string to write
 */
export async function saveQaFlag(
  path: string,
  content: string,
): Promise<void> {
  const res = await fetch('/api/save-qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, content }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || 'Save failed');
  }
}
