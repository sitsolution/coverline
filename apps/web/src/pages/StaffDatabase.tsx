import { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';

type BadgeVariant = 'success' | 'warning' | 'neutral' | 'info';

const STAFF: {
  name: string; role: string; specialty: string; location: string;
  availability: string; availVariant: BadgeVariant;
  rating: string; ratingNum: number;
  verification: string; verVariant: BadgeVariant;
  shifts: number;
}[] = [
  { name: 'Dr. Ananya Rao',    role: 'Doctor',        specialty: 'Emergency Med.',  location: 'Pune',   availability: 'Available',   availVariant: 'success', rating: '4.8★', ratingNum: 4.8, verification: 'Verified', verVariant: 'success', shifts: 24 },
  { name: 'Sneha Kulkarni RN', role: 'Nurse',         specialty: 'ICU Nursing',     location: 'Pune',   availability: 'Available',   availVariant: 'success', rating: '4.7★', ratingNum: 4.7, verification: 'Verified', verVariant: 'success', shifts: 38 },
  { name: 'Vikram Nair',       role: 'OT Technician', specialty: 'Cardiac OT',      location: 'Pune',   availability: 'Available',   availVariant: 'success', rating: '4.6★', ratingNum: 4.6, verification: 'Verified', verVariant: 'success', shifts: 29 },
  { name: 'Meena Pawar',       role: 'Housekeeping',  specialty: 'OT Housekeeping', location: 'Pune',   availability: 'Unavailable', availVariant: 'neutral', rating: '4.9★', ratingNum: 4.9, verification: 'Pending',  verVariant: 'warning', shifts: 42 },
  { name: 'Dr. Karan Shah',    role: 'Doctor',        specialty: 'Anaesthesia',     location: 'Pune',   availability: 'Available',   availVariant: 'success', rating: '4.5★', ratingNum: 4.5, verification: 'Verified', verVariant: 'success', shifts: 31 },
  { name: 'Dr. Riya Iyer',     role: 'Doctor',        specialty: 'Pediatrics',      location: 'Mumbai', availability: 'Unavailable', availVariant: 'neutral', rating: '4.9★', ratingNum: 4.9, verification: 'Pending',  verVariant: 'warning', shifts: 18 },
  { name: 'Farhan Ali RN',     role: 'Nurse',         specialty: 'Emergency Nursing',location: 'Mumbai', availability: 'Available',   availVariant: 'success', rating: '4.4★', ratingNum: 4.4, verification: 'Verified', verVariant: 'success', shifts: 21 },
  { name: 'Pooja Desai',       role: 'Housekeeping',  specialty: 'Ward Housekeeping',location: 'Pune',   availability: 'Available',   availVariant: 'success', rating: '4.3★', ratingNum: 4.3, verification: 'Pending',  verVariant: 'warning', shifts: 15 },
];

const CHIP = 'bg-white border border-line rounded-sm px-[11px] py-[6px] text-[11px] font-semibold text-slate cursor-pointer inline-flex items-center gap-[6px] select-none hover:border-navy-2 transition-colors outline-none appearance-none';

export default function StaffDatabase() {
  const [search, setSearch]             = useState('');
  const [role, setRole]                 = useState('');
  const [availability, setAvailability] = useState('');
  const [verification, setVerification] = useState('');
  const [minRating, setMinRating]       = useState('');

  const filtered = STAFF.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch       = !q || s.name.toLowerCase().includes(q) || s.specialty.toLowerCase().includes(q) || s.location.toLowerCase().includes(q);
    const matchRole         = !role         || s.role         === role;
    const matchAvailability = !availability || s.availability === availability;
    const matchVerification = !verification || s.verification === verification;
    const matchRating       = !minRating    || s.ratingNum >= parseFloat(minRating);
    return matchSearch && matchRole && matchAvailability && matchVerification && matchRating;
  });

  const hasFilters = search || role || availability || verification || minRating;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Locum Staff</h1>
          <p className="text-[11.5px] text-slate mb-4">148 active staff · Doctors, Nurses, OT Technicians &amp; Housekeeping</p>
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
          {['Doctor', 'Nurse', 'OT Technician', 'Housekeeping'].map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={availability} onChange={(e) => setAvailability(e.target.value)} className={CHIP}>
          <option value="">Availability ▾</option>
          {['Available', 'Unavailable'].map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={verification} onChange={(e) => setVerification(e.target.value)} className={CHIP}>
          <option value="">Verification ▾</option>
          {['Verified', 'Pending'].map((o) => <option key={o}>{o}</option>)}
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
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-[12px] text-slate py-8">No staff match your filters.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.name}>
                  <td className="font-semibold">{s.name}</td>
                  <td><Badge label={s.role} variant="info" /></td>
                  <td>{s.specialty}</td>
                  <td>{s.location}</td>
                  <td><Badge label={s.availability} variant={s.availVariant} /></td>
                  <td>{s.rating}</td>
                  <td><Badge label={s.verification} variant={s.verVariant} /></td>
                  <td>{s.shifts}</td>
                  <td className="text-[12px]">
                    <Link to="/staff/1" className="text-navy-2 font-semibold hover:underline">Profile</Link>
                    {' · '}
                    <span className="text-navy-2 font-semibold cursor-pointer hover:underline">Contact</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate text-center mt-[14px]">
          {filtered.length} of {STAFF.length} staff members
        </p>
      </Panel>
    </Layout>
  );
}
