'use client';

import { useCallback, useEffect, useState } from 'react';

export interface MyListItem {
  id: string;
  title: string;
  slug: string;
  posterUrl?: string;
  year?: number;
  kind?: string;
}

const STORAGE_KEY = 'cinenova_my_list';

function readStorage(): MyListItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MyListItem[]) : [];
  } catch {
    return [];
  }
}

function writeStorage(items: MyListItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage unavailable — ignore
  }
}

/**
 * Per-browser My List persisted in localStorage with optimistic updates.
 * (Server-side per-profile persistence is a follow-up once auth persistence
 * is wired; this keeps the UI fully functional today.)
 */
export function useMyList() {
  const [items, setItems] = useState<MyListItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setLoaded(true);
  }, []);

  const add = useCallback((item: MyListItem) => {
    setItems((prev) => {
      const next = prev.some((i) => i.id === item.id) ? prev : [...prev, item];
      writeStorage(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  return { items, loaded, add, remove, has };
}
