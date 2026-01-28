'use client';

interface SortIconProps {
  direction: 'asc' | 'desc' | 'none';
}

/**
 * Displays a sort indicator icon showing the current sort direction
 */
export default function SortIcon({ direction }: SortIconProps) {
  if (direction === 'none') {
    return <span className="text-slate-300">⇅</span>;
  }

  if (direction === 'asc') {
    return <span className="text-slate-600">↑</span>;
  }

  return <span className="text-slate-600">↓</span>;
}
