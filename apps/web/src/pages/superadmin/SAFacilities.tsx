import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/layout/SuperAdminLayout';
import Panel from '../../components/ui/Panel';
import Badge from '../../components/ui/Badge';
import superAdminService, { SAFacility } from '../../services/superAdminService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { label: 'All Types',         value: ''                  },
  { label: 'Hospital',          value: 'hospital'          },
  { label: 'Clinic',            value: 'clinic'            },
  { label: 'Diagnostic Centre', value: 'diagnostic_centre' },
  { label: 'Staffing Agency',   value: 'staffing_agency'   },
];

function facilityTypeLabel(t: string): string {
  const match = TYPE_OPTIONS.find((o) => o.value === t);
  return match?.label ?? t;
}

// ─── Add Facility Modal ───────────────────────────────────────────────────────

interface AddModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function AddFacilityModal({ onClose, onCreated }: AddModalProps) {
  const [name, setName]               = useState('');
  const [facilityType, setFacilityType] = useState('hospital');
  const [city, setCity]               = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await superAdminService.createFacility({ name, facilityType, city, contactEmail });
      onCreated();
    } catch {
      setError('Failed to create facility. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(8,28,44,0.55)' }}
    >
      <div className="bg-white rounded-[14px] border border-line w-full max-w-[420px] p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <span className="font-display font-extrabold text-[15px] text-ink">Add Facility</span>
          <button
            onClick={onClose}
            className="text-slate hover:text-ink text-[18px] leading-none bg-transparent outline-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-3 px-3 py-[8px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-[13px]">
          <div>
            <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Facility Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Apollo Hospital Mumbai"
              className="w-full px-3 py-[10px] border-[1.4px] border-line rounded-[9px] text-[12.5px] text-ink outline-none focus:border-navy-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Type</label>
            <select
              value={facilityType}
              onChange={(e) => setFacilityType(e.target.value)}
              className="w-full px-3 py-[10px] border-[1.4px] border-line rounded-[9px] text-[12.5px] text-ink outline-none focus:border-navy-2 bg-white cursor-pointer"
            >
              {TYPE_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11.5px] font-bold text-slate mb-[6px]">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              placeholder="e.g. Mumbai"
              className="w-full px-3 py-[10px] border-[1.4px] border-line rounded-[9px] text-[12.5px] text-ink outline-none focus:border-navy-2 bg-white"
            />
          </div>
          <div>
            <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="admin@facility.com"
              className="w-full px-3 py-[10px] border-[1.4px] border-line rounded-[9px] text-[12.5px] text-ink outline-none focus:border-navy-2 bg-white"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white text-slate border border-line text-[12.5px] font-bold px-4 py-[10px] rounded-[9px] hover:border-navy transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-navy text-white text-[12.5px] font-bold px-4 py-[10px] rounded-[9px] disabled:opacity-60 hover:bg-navy-2 transition-colors"
            >
              {saving ? 'Creating…' : 'Create Facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SAFacilities() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<SAFacility[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [showModal, setShowModal]   = useState(false);

  const fetchFacilities = () => {
    setLoading(true);
    setError('');
    const params: Record<string, unknown> = {};
    if (search)     params.search = search;
    if (typeFilter) params.facility_type = typeFilter;
    if (cityFilter) params.city = cityFilter;
    superAdminService
      .getFacilities(params)
      .then((res) => {
        setFacilities(res.items);
        setTotal(res.total);
      })
      .catch(() => setError('Failed to load facilities.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, typeFilter, cityFilter]);

  const handleCreated = () => {
    setShowModal(false);
    fetchFacilities();
  };

  return (
    <SuperAdminLayout>
      {showModal && (
        <AddFacilityModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">
            Facilities
          </div>
          <div className="text-[11.5px] text-slate">
            {total.toLocaleString()} facilities on Coverline
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-navy text-white text-[12px] font-bold px-4 py-[9px] rounded-[9px] hover:bg-navy-2 transition-colors"
        >
          + Add Facility
        </button>
      </div>

      {error && (
        <div className="mb-4 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-[14px]">
        <div className="flex items-center bg-white border border-line rounded-[8px] px-3 py-[8px] gap-2 flex-1 max-w-[280px]">
          <span className="text-[12px]">🔍</span>
          <input
            type="text"
            placeholder="Search facilities…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-[12px] text-ink outline-none bg-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-white border border-line rounded-[8px] px-3 py-[8px] text-[12px] text-ink outline-none cursor-pointer"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="City ▾"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="bg-white border border-line rounded-[8px] px-3 py-[8px] text-[12px] text-ink outline-none w-[120px]"
        />
      </div>

      {/* Table */}
      <Panel>
        <div className="overflow-hidden rounded-[10px] border border-line">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Type</th>
                <th>City</th>
                <th>Admin Contact</th>
                <th>Staff Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate py-10">Loading…</td>
                </tr>
              ) : facilities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate py-10">No facilities found.</td>
                </tr>
              ) : (
                facilities.map((f) => (
                  <tr key={f.id}>
                    <td className="font-semibold">{f.name}</td>
                    <td>{facilityTypeLabel(f.facilityType)}</td>
                    <td>{f.city}</td>
                    <td>{f.adminContact || <span className="text-slate">—</span>}</td>
                    <td>{f.staffCount.toLocaleString()}</td>
                    <td>
                      <Badge label="Active" variant="success" />
                    </td>
                    <td>
                      <span className="text-[12px]">
                        <button
                          onClick={() => navigate(`/superadmin/facilities/${f.id}`)}
                          className="text-navy-2 font-semibold hover:underline bg-transparent outline-none cursor-pointer"
                        >
                          View
                        </button>
                        <span className="text-slate mx-[6px]">·</span>
                        <button
                          onClick={() => navigate(`/superadmin/facilities/${f.id}`)}
                          className="text-navy-2 font-semibold hover:underline bg-transparent outline-none cursor-pointer"
                        >
                          Edit
                        </button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </SuperAdminLayout>
  );
}
