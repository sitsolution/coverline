import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminSearch,
  AdminSearchResponse,
  superAdminSearch,
  SASearchResponse,
} from '../../services/searchService';

type Mode = 'admin' | 'superadmin';

interface Props {
  mode: Mode;
  placeholder?: string;
}

// ── Role label helper ─────────────────────────────────────────────────────────
function roleLabel(role: string) {
  const map: Record<string, string> = {
    doctor: 'Doctor',
    nurse: 'Nurse',
    ot_tech: 'OT Tech',
    housekeeping: 'Housekeeping',
    facility_admin: 'Facility Admin',
    super_admin: 'Super Admin',
  };
  return map[role] ?? role;
}

function facilityTypeLabel(t: string) {
  const map: Record<string, string> = {
    hospital: 'Hospital',
    clinic: 'Clinic',
    staffing_agency: 'Staffing Agency',
    diagnostic_centre: 'Diagnostic Centre',
  };
  return map[t] ?? t;
}

// ── Small sub-components ──────────────────────────────────────────────────────

function GroupLabel({ label }: { label: string }) {
  return (
    <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate uppercase tracking-wider">
      {label}
    </div>
  );
}

function ResultRow({
  icon,
  primary,
  secondary,
  onClick,
}: {
  icon: string;
  primary: string;
  secondary: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left flex items-center gap-2 px-3 py-[7px] hover:bg-sky/40 transition-colors"
    >
      <span className="text-[13px]">{icon}</span>
      <div className="min-w-0">
        <div className="text-[12px] font-semibold text-ink truncate">{primary}</div>
        <div className="text-[10.5px] text-slate truncate">{secondary}</div>
      </div>
    </button>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="px-4 py-5 text-center text-[11.5px] text-slate">
      No results for <span className="font-semibold text-ink">"{query}"</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GlobalSearch({ mode, placeholder }: Props) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adminResults, setAdminResults] = useState<AdminSearchResponse | null>(null);
  const [saResults, setSaResults] = useState<SASearchResponse | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setAdminResults(null);
      setSaResults(null);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        if (mode === 'admin') {
          const data = await adminSearch(query.trim());
          setAdminResults(data);
        } else {
          const data = await superAdminSearch(query.trim());
          setSaResults(data);
        }
        setOpen(true);
      } catch {
        // silently ignore errors in search
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query, mode]);

  function go(url: string) {
    setOpen(false);
    setQuery('');
    navigate(url);
  }

  const hasAdminResults =
    adminResults &&
    (adminResults.staff.length > 0 ||
      adminResults.shifts.length > 0 ||
      adminResults.bookings.length > 0);

  const hasSaResults =
    saResults &&
    (saResults.users.length > 0 || saResults.facilities.length > 0);

  const showEmpty =
    open &&
    query.trim().length >= 2 &&
    !loading &&
    (mode === 'admin' ? !hasAdminResults : !hasSaResults);

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-[320px]">
      {/* Input */}
      <div className="flex items-center gap-2 bg-paper border border-line rounded-[8px] px-3 py-[7px]">
        <span className="text-[13px] select-none">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setOpen(true);
          }}
          placeholder={
            placeholder ??
            (mode === 'admin' ? 'Search staff, shifts…' : 'Search users, facilities…')
          }
          className="flex-1 bg-transparent text-[11.5px] text-ink outline-none placeholder:text-slate-2 min-w-0"
        />
        {loading && (
          <svg
            className="animate-spin w-[13px] h-[13px] text-slate flex-none"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
          </svg>
        )}
        {!loading && query.length > 0 && (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false); }}
            className="text-slate hover:text-ink text-[13px] leading-none flex-none"
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-[340px] bg-white border border-line rounded-[10px] shadow-lg z-50 overflow-hidden max-h-[420px] overflow-y-auto">

          {/* ── Admin results ── */}
          {mode === 'admin' && adminResults && (
            <>
              {adminResults.staff.length > 0 && (
                <>
                  <GroupLabel label="Staff" />
                  {adminResults.staff.map((r) => (
                    <ResultRow
                      key={`staff-${r.id}`}
                      icon="👤"
                      primary={r.name}
                      secondary={`${roleLabel(r.role)}${r.specialty ? ` · ${r.specialty}` : ''} · ${r.email}`}
                      onClick={() => go(r.url)}
                    />
                  ))}
                </>
              )}
              {adminResults.shifts.length > 0 && (
                <>
                  <GroupLabel label="Shifts" />
                  {adminResults.shifts.map((r) => (
                    <ResultRow
                      key={`shift-${r.id}`}
                      icon="🩺"
                      primary={`${r.reference} · ${r.title}`}
                      secondary={`${r.facilityName} · ${r.status}`}
                      onClick={() => go(r.url)}
                    />
                  ))}
                </>
              )}
              {adminResults.bookings.length > 0 && (
                <>
                  <GroupLabel label="Bookings" />
                  {adminResults.bookings.map((r) => (
                    <ResultRow
                      key={`booking-${r.id}`}
                      icon="📋"
                      primary={`${r.reference} · ${r.staffName}`}
                      secondary={r.shiftTitle}
                      onClick={() => go(r.url)}
                    />
                  ))}
                </>
              )}
            </>
          )}

          {/* ── Super admin results ── */}
          {mode === 'superadmin' && saResults && (
            <>
              {saResults.users.length > 0 && (
                <>
                  <GroupLabel label="Users" />
                  {saResults.users.map((r) => (
                    <ResultRow
                      key={`user-${r.id}`}
                      icon="👤"
                      primary={r.name}
                      secondary={`${roleLabel(r.role)} · ${r.email}${r.isActive ? '' : ' · Inactive'}`}
                      onClick={() => go(r.url)}
                    />
                  ))}
                </>
              )}
              {saResults.facilities.length > 0 && (
                <>
                  <GroupLabel label="Facilities" />
                  {saResults.facilities.map((r) => (
                    <ResultRow
                      key={`facility-${r.id}`}
                      icon="🏥"
                      primary={r.name}
                      secondary={`${facilityTypeLabel(r.facilityType)} · ${r.city}`}
                      onClick={() => go(r.url)}
                    />
                  ))}
                </>
              )}
            </>
          )}

          {/* Empty state */}
          {showEmpty && <EmptyState query={query} />}
        </div>
      )}
    </div>
  );
}
