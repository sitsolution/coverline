import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/layout/SuperAdminLayout';
import Panel from '../../components/ui/Panel';
import superAdminService, { SAReportsResponse } from '../../services/superAdminService';

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  delta,
  deltaColor = '#1F8A5F',
}: {
  label: string;
  value: string;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleLabel(role: string): string {
  switch (role) {
    case 'doctor':         return 'Doctor';
    case 'nurse':          return 'Nurse';
    case 'ot_tech':        return 'OT Tech';
    case 'housekeeping':   return 'Housekeeping';
    case 'facility_admin': return 'Facility Admin';
    case 'super_admin':    return 'Super Admin';
    default:               return role;
  }
}

const today = new Date();
const dateRange = today.toLocaleDateString('en-IN', {
  month: 'long',
  year: 'numeric',
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SAReports() {
  const [data, setData]     = useState<SAReportsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    superAdminService
      .getReports()
      .then(setData)
      .catch(() => setError('Failed to load reports.'))
      .finally(() => setLoading(false));
  }, []);

  // Bar chart calculation
  const barData = data?.staffGrowthByRole ?? [];
  const maxCount = barData.reduce((mx, r) => Math.max(mx, r.count), 1);

  return (
    <SuperAdminLayout>
      {/* Header */}
      <div className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">
        System Reports &amp; Analytics
      </div>
      <div className="text-[11.5px] text-slate mb-4">Platform-wide · {dateRange}</div>

      {error && (
        <div className="mb-4 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-[12px] text-slate py-10 text-center">Loading…</div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            <KpiCard
              label="Platform Fill Rate"
              value={`${(data?.platformFillRate ?? 0).toFixed(1)}%`}
              delta="+2pts vs last month"
            />
            <KpiCard
              label="Total Shift Hours"
              value={`${(data?.totalShiftHours ?? 0).toLocaleString()} hrs`}
              delta="Across all facilities"
            />
            <KpiCard
              label="New Users"
              value={`+${(data?.newUsersThisMonth ?? 0).toLocaleString()}`}
              delta="This month"
            />
            <KpiCard
              label="Expiring Documents"
              value={`${(data?.expiringDocuments ?? 0).toLocaleString()}`}
              delta="Platform-wide"
              deltaColor="#C97A2B"
            />
          </div>

          {/* Two-col */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-4">
            {/* Top Facilities */}
            <Panel title="Top Facilities by Shift Volume">
              <div className="overflow-hidden rounded-[10px] border border-line">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Facility</th>
                      <th>Shifts</th>
                      <th>Fill Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.topFacilities ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center text-slate py-6">No data</td>
                      </tr>
                    ) : (
                      (data?.topFacilities ?? []).map((f, i) => (
                        <tr key={i}>
                          <td className="font-semibold">{f.name}</td>
                          <td>{f.shiftCount.toLocaleString()}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-sky rounded-full h-[5px] overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, f.fillRate)}%`,
                                    background: '#1F8A5F',
                                  }}
                                />
                              </div>
                              <span className="text-[11px] text-slate w-[34px] text-right flex-none">
                                {f.fillRate.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>

            {/* Staff Growth by Role — bar chart */}
            <Panel title="Staff Growth by Role">
              {barData.length === 0 ? (
                <p className="text-[12px] text-slate text-center py-6">No data</p>
              ) : (
                <>
                  {/* Bars */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '10px',
                      height: '120px',
                      marginBottom: '8px',
                    }}
                  >
                    {barData.map((r) => {
                      const pct = Math.max(4, Math.round((r.count / maxCount) * 100));
                      return (
                        <div
                          key={r.role}
                          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
                        >
                          <span
                            style={{
                              fontSize: '10px',
                              color: '#5C6B7A',
                              marginBottom: '3px',
                              fontWeight: 600,
                            }}
                          >
                            {r.count}
                          </span>
                          <div
                            style={{
                              width: '100%',
                              height: `${pct}%`,
                              background: '#D8E9F3',
                              borderRadius: '5px 5px 0 0',
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Labels */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      justifyContent: 'space-between',
                    }}
                  >
                    {barData.map((r) => (
                      <div
                        key={r.role}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          fontSize: '9.5px',
                          color: '#5C6B7A',
                          fontWeight: 600,
                          lineHeight: '1.2',
                        }}
                      >
                        {roleLabel(r.role)}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Panel>
          </div>
        </>
      )}
    </SuperAdminLayout>
  );
}
