import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';
import adminShiftsService, { AdminShiftDetail, ApplicantRow } from '../services/adminShiftsService';

type BadgeVariant = 'success' | 'warning' | 'urgent' | 'neutral' | 'info';

function statusVariant(status: string): BadgeVariant {
  switch (status) {
    case 'open': return 'urgent';
    case 'filled': return 'success';
    case 'pending': return 'warning';
    case 'completed': return 'neutral';
    case 'cancelled': return 'urgent';
    default: return 'neutral';
  }
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function shiftTimeLabel(start: string, end: string): string {
  const fmt = (s: string) => new Date(s).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dateLabel = new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${dateLabel}, ${fmt(start)} – ${fmt(end)}`;
}

export default function ShiftDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shift, setShift] = useState<AdminShiftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminShiftsService.getShift(parseInt(id));
      setShift(data);
    } catch {} finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleAssign = async (applicant: ApplicantRow) => {
    if (!shift || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await adminShiftsService.assignApplicant(shift.id, applicant.applicationId);
      setShift(updated);
    } catch {} finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (applicant: ApplicantRow) => {
    if (!shift || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await adminShiftsService.rejectApplicant(shift.id, applicant.applicationId);
      setShift(updated);
    } catch {} finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!shift || actionLoading) return;
    const reason = window.prompt('Reason for cancellation (optional):') ?? undefined;
    setActionLoading(true);
    try {
      const updated = await adminShiftsService.cancelShift(shift.id, reason || undefined);
      setShift(updated);
    } catch {} finally {
      setActionLoading(false);
    }
  };

  const handleDuplicate = async () => {
    if (!shift || actionLoading) return;
    setActionLoading(true);
    try {
      const dup = await adminShiftsService.duplicateShift(shift.id);
      navigate(`/shifts/${dup.id}`);
    } catch {} finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!shift || actionLoading) return;
    setActionLoading(true);
    try {
      const updated = await adminShiftsService.completeShift(shift.id);
      setShift(updated);
    } catch {} finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Layout><p className="text-slate text-[12px]">Loading…</p></Layout>;
  }

  if (!shift) {
    return <Layout><p className="text-slate text-[12px]">Shift not found.</p></Layout>;
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-[2px]">
            <h1 className="font-display font-extrabold text-[16.5px] text-ink">{shift.title ?? shift.specialty}</h1>
            <Badge label={shift.displayStatus} variant={statusVariant(shift.status)} />
          </div>
          <p className="text-[11.5px] text-slate">
            {shift.reference} · {shift.facilityName} · {shiftTimeLabel(shift.startTime, shift.endTime)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDuplicate}
            disabled={actionLoading}
            className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent disabled:opacity-60"
          >
            Duplicate
          </button>
          {shift.status === 'filled' && (
            <button
              onClick={handleComplete}
              disabled={actionLoading}
              className="bg-sky text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] disabled:opacity-60"
            >
              Mark Complete
            </button>
          )}
          {['open', 'pending', 'filled'].includes(shift.status) && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="bg-urgent-bg text-urgent text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] disabled:opacity-60"
            >
              Cancel Shift
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Left */}
        <div>
          <Panel title="Applicants">
            <div className="overflow-hidden rounded-[10px] border border-line">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Specialty</th>
                    <th>Rating</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shift.applicants.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-[12px] text-slate py-6">No applicants yet.</td></tr>
                  ) : shift.applicants.map((a) => (
                    <tr key={a.applicationId}>
                      <td className="font-semibold">
                        <Link to={`/staff/${a.staffId}`} className="text-navy-2 hover:underline">{a.name}</Link>
                      </td>
                      <td>{a.specialty ?? '—'}</td>
                      <td>{a.rating.toFixed(1)}★</td>
                      <td className="text-slate">{timeAgo(a.appliedAt)}</td>
                      <td><Badge label={a.status} variant={a.status === 'confirmed' ? 'success' : a.status === 'rejected' ? 'urgent' : 'warning'} /></td>
                      <td className="text-[12px]">
                        <Link to={`/staff/${a.staffId}`} className="text-navy-2 font-semibold hover:underline">Profile</Link>
                        {a.status === 'applied' && (
                          <>
                            {' · '}
                            <span
                              className="text-navy-2 font-semibold cursor-pointer hover:underline"
                              onClick={() => handleAssign(a)}
                            >Accept</span>
                            {' · '}
                            <span
                              className="text-urgent font-semibold cursor-pointer hover:underline"
                              onClick={() => handleReject(a)}
                            >Reject</span>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Shift Timeline">
            {shift.timeline.map((item) => (
              <div
                key={item.label}
                className={`text-[11.5px] pl-3 ml-1 py-[6px] border-l-2 ${item.done ? 'border-sky-2 text-ink' : 'border-line text-slate'}`}
              >
                {item.label}{item.at && ` — ${new Date(item.at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}`}
              </div>
            ))}
          </Panel>
        </div>

        {/* Right */}
        <div>
          <Panel title="Assigned Staff Member">
            {shift.assignedStaff.length === 0 ? (
              <>
                <p className="text-center text-slate text-[11.5px] py-4">No staff member assigned yet</p>
                {shift.applicants.some(a => a.status === 'applied') && (
                  <p className="text-center text-[11px] text-slate">Accept an applicant above to assign them.</p>
                )}
              </>
            ) : (
              <div className="text-[12.5px] font-semibold text-ink py-2">{shift.assignedStaff.join(', ')}</div>
            )}
          </Panel>

          <Panel title="Shift Details">
            {[
              `Specialty: ${shift.specialty}`,
              `Duration: ${shift.durationHours}h`,
              `Pay Rate: ₹${shift.payRate.toLocaleString('en-IN')}`,
              shift.requirements ? `Requirements: ${shift.requirements}` : null,
              `Slots: ${shift.slotsFilled}/${shift.slots} filled`,
            ].filter(Boolean).map((row) => (
              <div key={row as string} className="text-[11.5px] text-slate py-[5px] border-b border-line last:border-0">
                {row}
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </Layout>
  );
}
