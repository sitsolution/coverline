import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import adminDashboardService, { AdminCalendarResponse, CalendarDayCell } from '../services/adminDashboardService';

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December'];

function firstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function markerClass(marker: string): string {
  if (marker === 'filled') return 'bg-success';
  if (marker === 'pending') return 'bg-warning';
  if (marker === 'unfilled') return 'bg-urgent';
  if (marker === 'cancelled') return 'bg-slate-2';
  return '';
}

export default function CalendarView() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [calData, setCalData] = useState<AdminCalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const data = await adminDashboardService.getCalendar(y, m);
      setCalData(data);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(year, month); }, [load, year, month]);

  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const goNext = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build cell markers from API data
  const markMap: Record<number, CalendarDayCell> = {};
  (calData?.days ?? []).forEach(d => {
    const day = new Date(d.day).getDate();
    markMap[day] = d;
  });

  const blanks = firstDayOfMonth(year, month);
  const totalDays = daysInMonth(year, month);
  const cells: Array<{ day: number | null }> = [
    ...Array(blanks).fill({ day: null }),
    ...Array.from({ length: totalDays }, (_, i) => ({ day: i + 1 })),
  ];

  const todayDay = today.getFullYear() === year && today.getMonth() + 1 === month ? today.getDate() : -1;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Shift Calendar</h1>
          <p className="text-[11.5px] text-slate mb-4">{MONTH_NAMES[month - 1]} {year}</p>
        </div>
        <button
          onClick={() => navigate('/shifts/new')}
          className="bg-navy text-white text-[11.5px] font-bold px-3 py-[7px] rounded-[8px]"
        >
          + Create Shift
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-[14px] text-[11px] text-slate mb-[14px]">
        <span>🟢 Filled</span>
        <span>🟡 Pending</span>
        <span>🔴 Unfilled / Urgent</span>
        <span>⚪ Cancelled</span>
      </div>

      <Panel>
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={goPrev} className="text-[18px] text-slate hover:text-ink px-2">‹</button>
          <span className="font-bold text-[13px] text-ink">{MONTH_NAMES[month - 1]} {year}</span>
          <button onClick={goNext} className="text-[18px] text-slate hover:text-ink px-2">›</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 text-[10.5px] text-slate text-center mb-2">
          {DAY_HEADERS.map((d) => <div key={d}>{d}</div>)}
        </div>

        {/* Days grid */}
        {loading ? (
          <div className="text-center text-[12px] text-slate py-8">Loading…</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {cells.map((cell, idx) => {
              const cellData = cell.day ? markMap[cell.day] : undefined;
              const isToday = cell.day === todayDay;
              return (
                <div
                  key={idx}
                  className={`border rounded-sm p-[6px] text-[11px] relative ${
                    isToday ? 'border-navy bg-navy text-white' : 'border-line'
                  }`}
                  style={{ aspectRatio: '1.3' }}
                  title={cellData ? `${cellData.total} shifts (${cellData.filled} filled, ${cellData.unfilled} unfilled)` : ''}
                >
                  {cell.day !== null && (
                    <>
                      <span className={isToday ? 'text-white font-bold' : ''}>{cell.day}</span>
                      {cellData && (
                        <span
                          className={`absolute bottom-[6px] left-[6px] w-[7px] h-[7px] rounded-full ${markerClass(cellData.marker)}`}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </Layout>
  );
}
