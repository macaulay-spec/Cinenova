import { cn } from '../cn';

export interface TabItem {
  id: string;
  label: string;
}

interface TabsProps {
  items: TabItem[];
  active: string;
  onSelect?: (id: string) => void;
  className?: string;
}

/** Underline tab bar; 2px amber underline on the active tab. */
export function Tabs({ items, active, onSelect, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Title sections"
      className={cn('flex gap-6 border-b border-border', className)}
    >
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onSelect?.(item.id)}
            className={cn(
              'relative -mb-px pb-3 pt-1 text-sm font-bold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary',
              selected ? 'text-foreground' : 'text-muted hover:text-foreground',
            )}
          >
            {item.label}
            {selected ? (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
