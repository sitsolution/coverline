import { useState, useRef, useEffect } from 'react';

interface DateRange {
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;   // YYYY-MM-DD
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseYMD(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLabel(from: string, to: string) {
  if (!from && !to) return 'Date Range ▾';
  const fmt = (s: string) => parseYMD(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  if (from && to) return `${fmt(from)} – ${fmt(to)} ✕`;
  if (from) return `From ${fmt(from)} ▾`;
  return 'Date Range ▾';
}

export default function DateRangePicker({ value, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState('');
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  // selecting = 'start' means next click sets start, 'end' means next click sets end
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const hasValue = !!(value.dateFrom || value.dateTo);

  function handleChipClick() {
    if (hasValue) {
      // clicking the ✕ clears; clicking the label opens
    }
    setOpen(o => !o);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange({ dateFrom: '', dateTo: '' });
    setSelecting('start');
    setOpen(false);
  }

  function handleDayClick(ymd: string) {
    if (selecting === 'start') {
      onChange({ dateFrom: ymd, dateTo: '' });
      setSelecting('end');
    } else {
      // ensure start <= end
      if (value.dateFrom && ymd < value.dateFrom) {
        onChange({ dateFrom: ymd, dateTo: value.dateFrom });
      } else {
        onChange({ dateFrom: value.dateFrom, dateTo: ymd });
      }
      setSelecting('start');
      setOpen(false);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  // Build calendar days
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  function dayState(ymd: string) {
    const { dateFrom, dateTo } = value;
    const endForHighlight = selecting === 'end' && hovered ? hovered : dateTo;
    const lo = dateFrom && endForHighlight ? (dateFrom < endForHighlight ? dateFrom : endForHighlight) : '';
    const hi = dateFrom && endForHighlight ? (dateFrom < endForHighlight ? endForHighlight : dateFrom) : '';
    const isStart = ymd === dateFrom;
    const isEnd = ymd === dateTo;
    const inRange = lo && hi && ymd > lo && ymd < hi;
    const isToday = ymd === toYMD(today);
    return { isStart, isEnd, inRange: !!inRange, isToday };
  }

  const chipBase = 'inline-flex items-center gap-[6px] bg-white border border-line rounded-sm px-[11px] py-[6px] text-[11px] font-semibold cursor-pointer select-none transition-colors';
  const chipActive = hasValue ? 'border-navy text-navy bg-sky' : 'text-slate hover:border-navy-2';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Chip trigger */}
      <div
        className={`${chipBase} ${chipActive}`}
        onClick={handleChipClick}
      >
        <span>
          {hasValue ? formatLabel(value.dateFrom, value.dateTo) : 'Date Range ▾'}
        </span>
        {hasValue && (
          <span
            onClick={handleClear}
            className="ml-1 text-slate hover:text-urgent font-bold leading-none"
            title="Clear"
          >
            ✕
          </span>
        )}
      </div>

      {/* Dropdown calendar */}
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-line rounded-[12px] shadow-lg p-4 w-[272px]">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-sky text-slate hover:text-navy text-sm font-bold">‹</button>
            <span className="text-[12.5px] font-extrabold text-ink font-display">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-sky text-slate hover:text-navy text-sm font-bold">›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[9.5px] font-bold text-slate py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {/* empty leading cells */}
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}

            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const { isStart, isEnd, inRange, isToday } = dayState(ymd);
              const isSelected = isStart || isEnd;

              let bg = '';
              let textColor = 'text-ink';
              let rounded = 'rounded-full';

              if (isSelected) {
                bg = 'bg-navy';
                textColor = 'text-white';
              } else if (inRange) {
                bg = 'bg-sky';
                textColor = 'text-navy';
                rounded = 'rounded-none';
              } else if (isToday) {
                textColor = 'text-navy font-bold';
              }

              // Round range edges
              if (inRange) {
                if (isStart) rounded = 'rounded-l-full';
                if (isEnd) rounded = 'rounded-r-full';
              }

              return (
                <div
                  key={ymd}
                  className={`flex items-center justify-center h-8 text-[11px] cursor-pointer ${rounded} ${bg} ${textColor} hover:bg-navy hover:text-white transition-colors`}
                  onClick={() => handleDayClick(ymd)}
                  onMouseEnter={() => selecting === 'end' && setHovered(ymd)}
                  onMouseLeave={() => setHovered('')}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Footer hint */}
          <p className="text-[10px] text-slate text-center mt-3">
            {selecting === 'start' ? 'Click to set start date' : 'Click to set end date'}
          </p>
        </div>
      )}
    </div>
  );
}
