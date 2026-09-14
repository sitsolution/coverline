import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminLayout from '../../components/layout/SuperAdminLayout';
import Panel from '../../components/ui/Panel';
import Badge from '../../components/ui/Badge';
import superAdminService, { SAFacilityDetail as IFacilityDetail } from '../../services/superAdminService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: 'Hospital',          value: 'hospital'          },
  { label: 'Clinic',            value: 'clinic'            },
  { label: 'Diagnostic Centre', value: 'diagnostic_centre' },
  { label: 'Staffing Agency',   value: 'staffing_agency'   },
];

function typeLabel(t: string) {
  return TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t;
}

function roleLabel(r: string) {
  switch (r) {
    case 'super_admin': return 'Super Admin';
    case 'manager':     return 'Manager';
    case 'staff':       return 'Staff';
    default:            return r;
  }
}

function roleBadge(r: string): 'gold' | 'info' | 'neutral' {
  if (r === 'super_admin') return 'gold';
  if (r === 'manager')     return 'info';
  return 'neutral';
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const inputCls = 'w-full px-3 py-[10px] border-[1.4px] border-line rounded-[9px] text-[12.5px] text-ink outline-none focus:border-navy-2 bg-white';
const labelCls = 'block text-[11.5px] font-bold text-slate mb-[6px]';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SAFacilityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [facility, setFacility] = useState<IFacilityDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState('');

  // Edit form state
  const [name, setName]               = useState('');
  const [facilityType, setFacilityType] = useState('hospital');
  const [city, setCity]               = useState('');
  const [area, setArea]               = useState('');
  const [state, setState]             = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!id) return;
    superAdminService
      .getFacility(parseInt(id, 10))
      .then((f) => {
        setFacility(f);
        setName(f.name);
        setFacilityType(f.facilityType);
        setCity(f.city);
        setArea(f.area ?? '');
        setState(f.state ?? '');
        setContactEmail(f.contactEmail ?? '');
        setDescription(f.description ?? '');
      })
      .catch(() => setError('Failed to load facility.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await superAdminService.updateFacility(parseInt(id, 10), {
        name,
        facilityType,
        city,
        area: area || null,
        state: state || null,
        contactEmail: contactEmail || null,
        description: description || null,
      });
      // Update only the editable fields — do NOT spread the response (it lacks members/state/description)
      setFacility((prev) => prev ? {
        ...prev,
        name,
        facilityType,
        city,
        area: area || null,
        state: state || null,
        contactEmail: contactEmail || null,
        description: description || null,
      } : prev);
      setSuccess('Facility updated successfully.');
    } catch {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout>
        <div className="text-[12px] text-slate py-10 text-center">Loading…</div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">
            {facility?.name ?? '—'}
          </div>
          <div className="text-[11.5px] text-slate">
            {typeLabel(facility?.facilityType ?? '')} · {facility?.city}
          </div>
        </div>
        <button
          onClick={() => navigate('/superadmin/facilities')}
          className="text-[11.5px] font-semibold text-navy-2 hover:underline bg-transparent outline-none cursor-pointer"
        >
          ← Back to Facilities
        </button>
      </div>

      {error && (
        <div className="mb-4 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-3 py-[9px] bg-success-bg border border-success rounded-[8px] text-[11.5px] text-success font-semibold">
          {success}
        </div>
      )}

      <div className="grid grid-cols-[1.4fr_1fr] gap-4">

        {/* Left — Info + Members */}
        <div>
          {/* Facility Info */}
          <Panel title="Facility Information">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ['Type',          typeLabel(facility?.facilityType ?? '')],
                ['City',          facility?.city ?? '—'],
                ['Area',          facility?.area ?? '—'],
                ['State',         facility?.state ?? '—'],
                ['Contact Email', facility?.contactEmail ?? '—'],
                ['Staff Count',   facility?.staffCount?.toString() ?? '0'],
                ['Admin Contact', facility?.adminContact ?? '—'],
                ['Created',       formatDate(facility?.createdAt ?? null)],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-[10.5px] font-bold text-slate uppercase tracking-wide mb-[2px]">{label}</div>
                  <div className="text-[12.5px] text-ink">{value}</div>
                </div>
              ))}
            </div>
            {facility?.description && (
              <div className="mt-4 pt-4 border-t border-line">
                <div className="text-[10.5px] font-bold text-slate uppercase tracking-wide mb-[4px]">Description</div>
                <p className="text-[12px] text-slate leading-relaxed">{facility.description}</p>
              </div>
            )}
          </Panel>

          {/* Members Table */}
          <Panel title={`Admin Members (${facility?.members?.length ?? 0})`}>
            {(facility?.members ?? []).length === 0 ? (
              <p className="text-[12px] text-slate text-center py-4">No members assigned yet.</p>
            ) : (
              <div className="overflow-hidden rounded-[10px] border border-line">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(facility?.members ?? []).map((m) => (
                      <tr key={m.id}>
                        <td className="font-semibold text-[12px]">{m.fullName}</td>
                        <td className="text-[11.5px] text-slate">{m.email}</td>
                        <td>
                          <Badge label={roleLabel(m.facilityRole)} variant={roleBadge(m.facilityRole)} />
                        </td>
                        <td className="text-[11.5px] text-slate">{formatDate(m.joinedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>

        {/* Right — Edit Form */}
        <div>
          <Panel title="Edit Facility">
            <form onSubmit={handleSave} className="flex flex-col gap-[13px]">
              <div>
                <label className={labelCls}>Facility Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select value={facilityType} onChange={(e) => setFacilityType(e.target.value)} className={inputCls + ' cursor-pointer'}>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Area / Locality</label>
                <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Koregaon Park" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Maharashtra" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Contact Email</label>
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="admin@facility.com" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief description of the facility…"
                  className={inputCls + ' resize-none'}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-navy text-white text-[13px] font-bold px-4 py-[11px] rounded-[10px] disabled:opacity-60 hover:bg-navy-2 transition-colors mt-1"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          </Panel>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
