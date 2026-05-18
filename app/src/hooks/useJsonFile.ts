import { useState, useEffect, useCallback } from 'react';

interface UseJsonFileResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
  save: (newData: T) => Promise<boolean>;
}

/**
 * Generic hook to load and save any JSON file via the Vite local API.
 * @param relativePath - Path relative to the Architecture 3.0 project root.
 *   e.g. "04_phase_scripting/outputs/script.json"
 */
export function useJsonFile<T>(relativePath: string | null): UseJsonFileResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    if (!relativePath) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetch(`/api/load?path=${encodeURIComponent(relativePath)}`)
      .then(res => res.json())
      .then(json => {
        if (cancelled) return;
        if (json.error) {
          setError(json.error);
          setData(null);
        } else {
          setData(json.data as T);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [relativePath, tick]);

  const save = useCallback(async (newData: T): Promise<boolean> => {
    if (!relativePath) return false;
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: relativePath, content: newData }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setData(newData);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [relativePath]);

  return { data, loading, error, reload, save };
}
