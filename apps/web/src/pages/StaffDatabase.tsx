import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';
import adminStaffService, { StaffRow } from '../services/adminStaffService';

type BadgeVariant = 'success' | 'warning' | 'neutral' | 'info';

function verificationVariant(v: string): BadgeVariant {
  if (v === 'Verified') return 'success';
  if (v === 'Pending') return 'warning';
  return 'neutral';
}

const CHIP = 'bg-white border border-line rounded-sm px-[11px] py-[6px] text-[11px] font-semibold text-slate cursor-pointer inline-flex items-center gap-[6px] select-none hover:border-navy-2 transition-colors outline-none appearance-none';

export default function StaffDatabase() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [availability, setAvailability] = useState('');
  const [verification, setVerification] = useState('');
  const [minRating, setMinRating] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminStaffService.listStaff({
        search: search || undefined,
        role: role || undefined,
        availability: availability || undefined,
        verification: verification || undefined,
        minRating: minRating ? parseFloat(minRating) : undefined,
        limit: 50,
      });
      setStaff(res.items);
      setTotal(res.total);
    } catch {} finally {
      setLoading(false);
    }
  }, [search, role, availability, verification, minRating]);

  useEffect(() => {
    const t = setTimeout(() => load(), 400);
    return () => clearTimeout(t);
  }, [load]);

  const hasFilters = search || role || availability || verification || minRating;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Locum Staff</h1>
          <p className="text-[11.5px] text-slate mb-4">{loading ? '…' : `${total} staff members`}</p>
        </div>
        <button className="bg-navy text-white text-[11.5px] font-bold px-3 py-[7px] rounded-[8px]">
          + Add New Staff
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search staff…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-[7px] border-[1.4px] border-line rounded-[9px] text-[11.5px] text-ink outline-none focus:border-navy-2 bg-white min-w-[200px]"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className={CHIP}>
          <option value="">Role ▾</option>
          {['doctor', 'nurse', 'ot_tech', 'housekeeping'].map((o) => <option key={o} value={o}>{o.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value)} className={CHIP}>
          <option value="">Availability ▾</option>
          {['Available', 'Unavailable'].map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={verification} onChange={(e) => setVerification(e.target.value)} className={CHIP}>
          <option value="">Verification ▾</option>
          {['Verified', 'Pending', 'Rejected'].map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={minRating} onChange={(e) => setMinRating(e.target.value)} className={CHIP}>
          <option value="">Rating ▾</option>
          <option value="4.5">4.5★ &amp; above</option>
          <option value="4.7">4.7★ &amp; above</option>
          <option value="4.9">4.9★ &amp; above</option>
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setRole(''); setAvailability(''); setVerification(''); setMinRating(''); }}
            className="text-[11px] font-semibold text-urgent hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <Panel>
        <div className="overflow-hidden rounded-[10px] border border-line">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Specialty/Dept.</th>
                <th>Location</th>
                <th>Availability</th>
                <th>Rating</th>
                <th>Verification</th>
                <th>Shifts</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center text-[12px] text-slate py-8">Loading…</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-[12px] text-slate py-8">No staff match your filters.</td></tr>
              ) : staff.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold">{s.name}</td>
                  <td><Badge label={s.roleLabel} variant="info" /></td>
                  <td>{s.specialty ?? '—'}</td>
                  <td>{s.location ?? '—'}</td>
                  <td><Badge label={s.availabilityLabel} variant={s.isAvailable ? 'success' : 'neutral'} /></td>
                  <td>{s.rating.toFixed(1)}★</td>
                  <td><Badge label={s.verificationStatus} variant={verificationVariant(s.verificationStatus)} /></td>
                  <td>{s.shiftsCompleted}</td>
                  <td className="text-[12px]">
                    <Link to={`/staff/${s.id}`} className="text-navy-2 font-semibold hover:underline">Profile</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate text-center mt-[14px]">
          {staff.length} of {total} staff members
        </p>
      </Panel>
    </Layout>
  );
}
