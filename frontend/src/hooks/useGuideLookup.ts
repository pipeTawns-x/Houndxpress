import { useEffect, useState } from 'react';
import { isValidGuideNumber } from '../domain/index.ts';
import type { PublicGuide } from '../domain/types.ts';
import { publicTracker } from '../services/publicTracking.ts';

export type LookupResult = { kind: 'found'; number: string; guide: PublicGuide } | { kind: 'missing' | 'invalid'; number: string };
export type Lookup = { status: 'idle' | 'loading' } | { status: 'error'; message: string; retry: () => void } | { status: 'done'; results: LookupResult[] };
export function useGuideLookup(numbers: readonly string[]): Lookup {
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<{ key: string; results: LookupResult[]; error: string | null } | null>(null);
  const list = numbers.join(',');
  const key = `${list}#${attempt}`;
  useEffect(() => {
    if (!list) return;
    let cancelled = false;
    const requested = list.split(',');
    const valid = requested.filter(isValidGuideNumber);
    void (valid.length ? publicTracker(valid) : Promise.resolve([])).then(items => {
      const results: LookupResult[] = requested.map(number => {
        if (!isValidGuideNumber(number)) return { kind: 'invalid', number };
        const item = items.find(entry => entry.trackingNumber === number);
        return item && !('found' in item) ? { kind: 'found', number, guide: item } : { kind: 'missing', number };
      });
      if (!cancelled) setSettled({ key, results, error: null });
    }, (error: unknown) => { if (!cancelled) setSettled({ key, results: [], error: error instanceof Error ? error.message : 'No se pudo consultar el envío.' }); });
    return () => { cancelled = true; };
  }, [list, key]);
  if (!list) return { status: 'idle' };
  if (settled?.key !== key) return { status: 'loading' };
  if (settled.error) return { status: 'error', message: settled.error, retry: () => setAttempt(value => value + 1) };
  return { status: 'done', results: settled.results };
}
