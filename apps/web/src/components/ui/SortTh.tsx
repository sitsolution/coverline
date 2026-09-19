interface SortThProps {
  label: string;
  column: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (col: string) => void;
}

function SortIcon({ active, order }: { active: boolean; order: 'asc' | 'desc' }) {
  const upActive   = active && order === 'asc';
  const downActive = active && order === 'desc';

  // active direction arrow → dark navy; everything else → very light grey
  const upColor   = upActive   ? '#175E86' : '#C8D3DB';
  const downColor = downActive ? '#175E86' : '#C8D3DB';

  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5 1L1.5 5.5H8.5L5 1Z" fill={upColor} />
      <path d="M5 13L8.5 8.5H1.5L5 13Z" fill={downColor} />
    </svg>
  );
}

export default function SortTh({ label, column, sortBy, sortOrder, onSort }: SortThProps) {
  const active = sortBy === column;
  return (
    <th className="cursor-pointer select-none" onClick={() => onSort(column)}>
      <span className="inline-flex items-center gap-[5px]">
        {label}
        <SortIcon active={active} order={sortOrder} />
      </span>
    </th>
  );
}
