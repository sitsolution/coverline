import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import KpiCard from '../components/ui/KpiCard';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';
import adminStaffService, { StaffDetail, StaffShiftHistoryRow, StaffReviewOut, StaffNoteOut } from '../services/adminStaffService';

const TABS = ['Overview', 'Shift History', 'Reviews', 'Notes'];

function shiftDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function StaffProfile() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('Overview');
  const [profile, setProfile] = useState<StaffDetail | null>(null);
  const [shifts, setShifts] = useState<StaffShiftHistoryRow[]>([]);
  const [reviews, setReviews] = useState<StaffReviewOut[]>([]);
  const [notes, setNotes] = useState<StaffNoteOut[]>([]);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);

  const staffId = id ? parseInt(id) : 0;

  const loadProfile = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const [p, s, r, n] = await Promise.all([
        adminStaffService.getStaff(staffId),
        adminStaffService.getShiftHistory(staffId),
        adminStaffService.getReviews(staffId),
        adminStaffService.getNotes(staffId),
      ]);
      setProfile(p);
      setShifts(s);
      setReviews(r);
      setNotes(n);
    } catch {} finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleAddNote = async () => {
    if (!noteText.trim() || !staffId) return;
    try {
      const note = await adminStaffService.createNote(staffId, noteText.trim());
      setNotes(prev => [note, ...prev]);
      setNoteText('');
    } catch {}
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await adminStaffService.deleteNote(staffId, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch {}
  };

  if (loading) {
    return <Layout><p className="text-slate text-[12px]">Loading…</p></Layout>;
  }

  if (!profile) {
    return <Layout><p className="text-slate text-[12px]">Staff member not found.</p></Layout>;
  }

  return (
    <Layout>
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-[16px] bg-sky flex items-center justify-center font-extrabold text-[20px] text-navy flex-shrink-0">
          {profile.initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-[2px]">
            <span className="font-extrabold text-[15px] text-ink">{profile.name}</span>
            <Badge label={profile.isVerified ? 'Verified' : 'Pending'} variant={profile.isVerified ? 'success' : 'warning'} />
          </div>
          <p className="text-[11.5px] text-slate">
            {profile.specialty ?? profile.roleLabel} · {profile.stats.rating.toFixed(1)}★ · {profile.preferredLocations.join(', ') || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {profile.phone && (
            <a href={`tel:${profile.phone}`} className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent">
              📞 Call
            </a>
          )}
          <a href={`mailto:${profile.email}`} className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent">
            ✉ Message
          </a>
        </div>
      </div>

      {/* Tab Nav */}
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'Overview' && (
        <>
          <div className="grid grid-cols-4 gap-3 mb-[18px]">
            <KpiCard label="Total Shifts" value={String(profile.stats.shiftsCompleted)} delta="All-time" />
            <KpiCard label="At This Facility" value={String(profile.stats.shiftsAtThisFacility)} delta="Shifts here" />
            <KpiCard label="Rating" value={`${profile.stats.rating.toFixed(1)}★`} delta={`${profile.stats.reviewsCount} reviews`} />
            <KpiCard label="Total Paid" value={`₹${profile.stats.totalPaid.toLocaleString('en-IN')}`} delta="All-time" />
          </div>

          <Panel title="Professional Details">
            {[
              profile.credentialNumber ? `${profile.credentialLabel}: ${profile.credentialNumber}` : null,
              profile.qualifications ? `Qualifications: ${profile.qualifications}` : null,
              profile.experience ? `Experience: ${profile.experience}` : null,
              profile.minPayRate ? `Min Pay Rate: ₹${profile.minPayRate.toLocaleString('en-IN')}/shift` : null,
            ].filter(Boolean).map((row) => (
              <div key={row as string} className="text-[11.5px] text-slate py-[5px] border-b border-line last:border-0">
                {row}
              </div>
            ))}
          </Panel>
        </>
      )}

      {activeTab === 'Shift History' && (
        <Panel title="Shift History">
          <div className="overflow-hidden rounded-[10px] border border-line">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Facility</th>
                  <th>Specialty</th>
                  <th>Status</th>
                  <th>Pay</th>
                </tr>
              </thead>
              <tbody>
                {shifts.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-[12px] text-slate py-6">No shift history.</td></tr>
                ) : shifts.map((s) => (
                  <tr key={s.shiftId}>
                    <td className="font-semibold">{s.reference}</td>
                    <td>{shiftDateLabel(s.startTime)}</td>
                    <td>{s.facilityName}</td>
                    <td>{s.specialty}</td>
                    <td><Badge label={s.status} variant={s.status === 'completed' ? 'neutral' : s.status === 'cancelled' ? 'urgent' : 'warning'} /></td>
                    <td>₹{s.payRate.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {activeTab === 'Reviews' && (
        <Panel title="Reviews">
          {reviews.length === 0 ? (
            <p className="text-[12px] text-slate text-center py-4">No reviews yet.</p>
          ) : reviews.map((r) => (
            <div key={r.id} className="py-[11px] border-b border-line last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-[12.5px] text-ink">{r.rating.toFixed(1)}★</span>
                {r.facilityName && <span className="text-[11px] text-slate">· {r.facilityName}</span>}
              </div>
              {r.comment && <p className="text-[11.5px] text-slate">{r.comment}</p>}
            </div>
          ))}
        </Panel>
      )}

      {activeTab === 'Notes' && (
        <Panel title="Private Notes">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a note…"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              className="flex-1 px-3 py-[9px] border-[1.4px] border-line rounded-[9px] text-[12.5px] text-ink outline-none focus:border-navy-2"
            />
            <button onClick={handleAddNote} className="bg-navy text-white text-[12px] font-bold px-4 py-[9px] rounded-[9px]">
              Add
            </button>
          </div>
          {notes.length === 0 ? (
            <p className="text-[12px] text-slate text-center py-4">No notes yet.</p>
          ) : notes.map((n) => (
            <div key={n.id} className="flex items-start justify-between py-[10px] border-b border-line last:border-0">
              <div>
                <p className="text-[12px] text-ink">{n.body}</p>
                <p className="text-[10.5px] text-slate mt-1">{n.authorName} · {new Date(n.createdAt).toLocaleDateString('en-GB')}</p>
              </div>
              <button onClick={() => handleDeleteNote(n.id)} className="text-[11px] text-urgent font-semibold hover:underline ml-4 flex-shrink-0">
                Delete
              </button>
            </div>
          ))}
        </Panel>
      )}
    </Layout>
  );
}
