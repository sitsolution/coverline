import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';

type BadgeVariant = 'success' | 'warning' | 'urgent' | 'neutral';

const SHIFTS: {
  id: string; date: string; time: string; location: string;
  specialty: string; status: string; statusVariant: BadgeVariant;
  staff: string; actions: string[];
}[] = [
  { id: '#SH-2291', date: '14 Sep', time: '8 PM–8 AM',  location: 'Kothrud',       specialty: 'Emergency Med.', status: 'Open',      statusVariant: 'urgent',  staff: '—',           actions: ['View', 'Assign'] },
  { id: '#SH-2290', date: '13 Sep', time: '9 AM–5 PM',  location: 'Kalyani Nagar', specialty: 'General Med.',   status: 'Filled',    statusVariant: 'success', staff: 'Dr. A. Rao',  actions: ['View', 'Edit']   },
  { id: '#SH-2289', date: '12 Sep', time: '9 AM–6 PM',  location: 'Viman Nagar',   specialty: 'Pediatrics',     status: 'Pending',   statusVariant: 'warning', staff: 'Dr. R. Iyer', actions: ['View', 'Edit']   },
  { id: '#SH-2288', date: '10 Sep', time: '8 AM–4 PM',  location: 'Wakad',         specialty: 'Anaesthesia',    status: 'Completed', statusVariant: 'neutral', staff: 'Dr. K. Shah', actions: ['View']           },
  { id: '#SH-2287', date: '9 Sep',  time: '9 AM–5 PM',  location: 'Baner',         specialty: 'General Med.',   status: 'Cancelled', statusVariant: 'urgent',  staff: '—',           actions: ['View']           },
  { id: '#SH-2286', date: '8 Sep',  time: '7 AM–3 PM',  location: 'Kothrud',       specialty: 'Pediatrics',     status: 'Filled',    statusVariant: 'success', staff: 'Dr. R. Iyer', actions: ['View', 'Edit']   },
  { id: '#SH-2285', date: '7 Sep',  time: '10 AM–6 PM', location: 'Viman Nagar',   specialty: 'Emergency Med.', status: 'Open',      statusVariant: 'urgent',  staff: '—',           actions: ['View', 'Assign'] },
  { id: '#SH-2284', date: '6 Sep',  time: '8 AM–4 PM',  location: 'Kalyani Nagar', specialty: 'Anaesthesia',    status: 'Completed', statusVariant: 'neutral', staff: 'Dr. K. Shah', actions: ['View']           },
];

const CHIP = 'bg-white border border-line rounded-sm px-[11px] py-[6px] text-[11px] font-semibold text-slate cursor-pointer inline-flex items-center gap-[6px] select-none hover:border-navy-2 transition-colors outline-none appearance-none';

export default function ShiftsManagement() {
  const navigate = useNavigate();
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('');
  const [location, setLocation]   = useState('');
  const [specialty, setSpecialty] = useState('');

  const filtered = SHIFTS.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.id.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.specialty.toLowerCase().includes(q) || s.staff.toLowerCase().includes(q);
    const matchStatus   = !status   || s.status   === status;
    const matchLocation = !location || s.location === location;
    const matchSpecialty = !specialty || s.specialty === specialty;
    return matchSearch && matchStatus && matchLocation && matchSpecialty;
  });

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Shift Management</h1>
          <p className="text-[11.5px] text-slate mb-4">86 shifts this month</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/calendar" className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent">
            📅 Calendar View
          </Link>
          <button onClick={() => navigate('/shifts/new')} className="bg-navy text-white text-[11.5px] font-bold px-3 py-[7px] rounded-[8px]">
            + Create New Shift
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search shifts…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-[7px] border-[1.4px] border-line rounded-[9px] text-[11.5px] text-ink outline-none focus:border-navy-2 bg-white min-w-[200px]"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={CHIP}>
          <option value="">Status ▾</option>
          {['Open', 'Filled', 'Pending', 'Completed', 'Cancelled'].map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={location} onChange={(e) => setLocation(e.target.value)} className={CHIP}>
          <option value="">Location ▾</option>
          {['Kothrud', 'Kalyani Nagar', 'Viman Nagar', 'Wakad', 'Baner'].map((o) => <option key={o}>{o}</option>)}
        </select>
        <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={CHIP}>
          <option value="">Specialty ▾</option>
          {['Emergency Med.', 'General Med.', 'Pediatrics', 'Anaesthesia'].map((o) => <option key={o}>{o}</option>)}
        </select>
        {(status || location || specialty || search) && (
          <button
            onClick={() => { setSearch(''); setStatus(''); setLocation(''); setSpecialty(''); }}
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
                <th>Shift ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Location</th>
                <th>Specialty</th>
                <th>Status</th>
                <th>Assigned Staff</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-[12px] text-slate py-8">No shifts match your filters.</td></tr>
              ) : filtered.map((s) => (
                <tr key={s.id}>
                  <td className="font-semibold">{s.id}</td>
                  <td>{s.date}</td>
                  <td>{s.time}</td>
                  <td>{s.location}</td>
                  <td>{s.specialty}</td>
                  <td><Badge label={s.status} variant={s.statusVariant} /></td>
                  <td className={s.staff === '—' ? 'text-slate' : ''}>{s.staff}</td>
                  <td className="text-[12px]">
                    {s.actions.map((a, i) => (
                      <span key={a}>
                        {i > 0 && ' · '}
                        <Link to="/shifts/2291" className="text-navy-2 font-semibold hover:underline">{a}</Link>
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-slate text-center mt-[14px]">
          {filtered.length} of {SHIFTS.length} shifts
        </p>
      </Panel>
    </Layout>
  );
}
