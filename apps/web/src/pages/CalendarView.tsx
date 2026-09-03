import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';

const DAY_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Sep 2026 starts on Tuesday (index 2), so 2 blank leading cells
// Days 1–30
const DOT_COLORS: Record<number, string> = {
  2:  'bg-success',
  5:  'bg-urgent',
  9:  'bg-success',
  11: 'bg-warning',
  14: 'bg-urgent',
  19: 'bg-success',
  23: 'bg-slate-2',
  27: 'bg-warning',
};

export default function CalendarView() {
  const navigate = useNavigate();

  // Build cells: 2 blank + days 1–30
  const blankCount = 2; // Sep starts Tuesday
  const cells: Array<{ day: number | null }> = [
    ...Array(blankCount).fill({ day: null }),
    ...Array.from({ length: 30 }, (_, i) => ({ day: i + 1 })),
  ];

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Shift Calendar</h1>
          <p className="text-[11.5px] text-slate mb-4">September 2026</p>
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
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 text-[10.5px] text-slate text-center mb-2">
          {DAY_HEADERS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2">
          {cells.map((cell, idx) => (
            <div
              key={idx}
              className="border border-line rounded-sm p-[6px] text-[11px] relative"
              style={{ aspectRatio: '1.3' }}
            >
              {cell.day !== null && (
                <>
                  <span>{cell.day}</span>
                  {DOT_COLORS[cell.day] && (
                    <span
                      className={`absolute bottom-[6px] left-[6px] w-[7px] h-[7px] rounded-full ${DOT_COLORS[cell.day]}`}
                    />
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </Panel>
    </Layout>
  );
}
