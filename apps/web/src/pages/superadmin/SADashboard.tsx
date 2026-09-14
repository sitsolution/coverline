import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/layout/SuperAdminLayout';
import Panel from '../../components/ui/Panel';
import Badge from '../../components/ui/Badge';
import superAdminService, { SADashboardResponse } from '../../services/superAdminService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleLabel(role: string): string {
  switch (role) {
    case 'doctor':         return 'Doctor';
    case 'nurse':          return 'Nurse';
    case 'ot_tech':        return 'OT Technician';
    case 'housekeeping':   return 'Housekeeping';
    case 'facility_admin': return 'Facility Admin';
    case 'super_admin':    return 'Super Admin';
    default:               return role;
  }
}

function facilityTypeLabel(t: string): string {
  switch (t) {
    case 'hospital':          return 'Hospital';
    case 'clinic':            return 'Clinic';
    case 'diagnostic_centre': return 'Diagnostic Centre';
    case 'staffing_agency':   return 'Staffing Agency';
    default:                  return t;
  }
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  delta,
  deltaColor = '#1F8A5F',
}: {
  label: string;
  value: string | number;
  delta: string;
  deltaColor?: string;
}) {
  return (
    <div className="bg-white border border-line rounded-[11px] p-[14px]">
      <div className="text-[10.8px] text-slate font-semibold">{label}</div>
      <div className="text-[22px] font-extrabold font-display text-navy-3 mt-1">{value}</div>
      <div className="text-[10.5px] mt-1" style={{ color: deltaColor }}>
        {delta}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SADashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<SADashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    superAdminService
      .getDashboard()
      .then(setData)
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SuperAdminLayout>
      {/* Header */}
      <div className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">
        Platform Dashboard
      </div>
      <div className="text-[11.5px] text-slate mb-4">
        Overview across all facilities on Coverline
      </div>

      {error && (
        <div className="mb-4 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-[12px] text-slate py-10 text-center">Loading…</div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <KpiCard
              label="Total Users"
              value={data?.totalUsers.toLocaleString() ?? '—'}
              delta={data ? `+${data.newUsersThisMonth} this month` : '—'}
            />
            <KpiCard
              label="Total Facilities"
              value={data?.totalFacilities.toLocaleString() ?? '—'}
              delta={data ? `+${data.newFacilitiesThisMonth} this month` : '—'}
            />
            <KpiCard
              label="Active Shifts"
              value={data?.activeShifts.toLocaleString() ?? '—'}
              delta="Across all facilities"
            />
            <KpiCard
              label="Pending Verifications"
              value={data?.pendingVerifications.toLocaleString() ?? '—'}
              delta="Awaiting review"
              deltaColor="#C97A2B"
            />
          </div>

          {/* Two-col: Users by Role + Quick Actions */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-4 mb-4">
            <Panel title="Users by Role">
              <div className="overflow-hidden rounded-[10px] border border-line">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Count</th>
                      <th>% of Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.usersByRole ?? []).map((row) => (
                      <tr key={row.role}>
                        <td>{roleLabel(row.role)}</td>
                        <td>{row.count.toLocaleString()}</td>
                        <td>{row.pct.toFixed(1)}%</td>
                      </tr>
                    ))}
                    {(data?.usersByRole ?? []).length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center text-slate py-6">
                          No data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Quick Actions">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/superadmin/users/new')}
                  className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] text-center hover:bg-sky-2 transition-colors"
                >
                  + Add User
                </button>
                <button
                  onClick={() => navigate('/superadmin/facilities')}
                  className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] text-center hover:bg-sky-2 transition-colors"
                >
                  + Add Facility
                </button>
                <button
                  onClick={() => navigate('/superadmin/roles')}
                  className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] text-center hover:bg-sky-2 transition-colors"
                >
                  + Add Role
                </button>
              </div>
            </Panel>
          </div>

          {/* Recent Facility Signups */}
          <Panel title="Recent Facility Signups">
            <div className="overflow-hidden rounded-[10px] border border-line">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Facility</th>
                    <th>Type</th>
                    <th>City</th>
                    <th>Joined</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentFacilities ?? []).map((f) => (
                    <tr key={f.id}>
                      <td className="font-semibold">{f.name}</td>
                      <td>{facilityTypeLabel(f.facilityType)}</td>
                      <td>{f.city}</td>
                      <td>{f.joinedLabel}</td>
                      <td>
                        <Badge
                          label={f.isActive ? 'Active' : 'Pending'}
                          variant={f.isActive ? 'success' : 'warning'}
                        />
                      </td>
                    </tr>
                  ))}
                  {(data?.recentFacilities ?? []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-slate py-6">
                        No recent facilities
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </SuperAdminLayout>
  );
}
