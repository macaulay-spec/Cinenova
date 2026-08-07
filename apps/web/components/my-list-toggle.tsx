'use client';

import { Plus, Check } from 'lucide-react';
import type { MyListItem } from '../lib/use-my-list';
import { useMyList } from '../lib/use-my-list';

interface MyListToggleProps {
  item: MyListItem;
  className?: string;
}

/**
 * Optimistic My List toggle. Persists to localStorage; adds/removes instantly.
 */
export function MyListToggle({ item, className }: MyListToggleProps) {
  const { has, add, remove } = useMyList();
  const saved = has(item.id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${item.title} from My List` : `Add ${item.title} to My List`}
      onClick={() => (saved ? remove(item.id) : add(item))}
      className={
        'inline-flex items-center rounded-md px-5 py-2.5 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ' +
        (saved
          ? 'bg-primary/20 text-foreground ring-1 ring-inset ring-primary'
          : 'bg-white/5 text-foreground ring-1 ring-inset ring-border hover:bg-white/10') +
        (className ? ` ${className}` : '')
      }
    >
      {saved ? <Check aria-hidden="true" className="mr-2 h-4 w-4" /> : <Plus aria-hidden="true" className="mr-2 h-4 w-4" />}
      {saved ? 'In My List' : 'My List'}
    </button>
  );
}
