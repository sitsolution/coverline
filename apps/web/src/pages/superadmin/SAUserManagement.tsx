import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuperAdminLayout from '../../components/layout/SuperAdminLayout';
import Panel from '../../components/ui/Panel';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import superAdminService, { SAFacility, SAUser } from '../../services/superAdminService';
import SortTh from '../../components/ui/SortTh';

// ─── Constants ────────────────────────────────────────────────────────────────

const LIMIT = 20;

const ROLE_OPTIONS = [
  { label: 'All Roles',      value: ''               },
  { label: 'Doctor',         value: 'doctor'         },
  { label: 'Nurse',          value: 'nurse'          },
  { label: 'OT Technician',  value: 'ot_tech'        },
  { label: 'Housekeeping',   value: 'housekeeping'   },
  { label: 'Facility Admin', value: 'facility_admin' },
  { label: 'Super Admin',    value: 'super_admin'    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleLabel(role: string): string {
  return ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role;
}

type BadgeVariant = 'success' | 'warning' | 'urgent' | 'info' | 'gold' | 'neutral' | 'default';

function roleBadgeVariant(role: string): BadgeVariant {
  if (role === 'facility_admin' || role === 'super_admin') return 'gold';
  return 'info';
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SAUserManagement() {
  const navigate = useNavigate();

  const [users, setUsers]               = useState<SAUser[]>([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState('');
  const [roleFilter, setRoleFilter]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifFilter, setVerifFilter]   = useState('');
  const [facilityFilter, setFacilityFilter] = useState('');
  const [facilities, setFacilities]     = useState<SAFacility[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<SAUser | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [sortBy, setSortBy]             = useState('created_at');
  const [sortOrder, setSortOrder]       = useState<'asc' | 'desc'>('desc');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSort = (col: string) => {
    if (col === sortBy) {
      setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  // Load facility list for filter dropdown (once)
  useEffect(() => {
    superAdminService.getFacilities({ limit: 200 }).then((r) => setFacilities(r.items)).catch(() => {});
  }, []);

  const fetchUsers = (p: number, q: string, role: string, status: string, verif: string, facility: string, sb = sortBy, so = sortOrder) => {
    setLoading(true);
    setError('');
    const params: Record<string, unknown> = { limit: LIMIT, offset: (p - 1) * LIMIT, sortBy: sb, sortOrder: so };
    if (q)       params.search      = q;
    if (role)    params.role        = role;
    if (status)  params.is_active   = status === 'active';
    if (verif)   params.is_verified = verif === 'verified';
    if (facility) params.facility_id = facility;
    superAdminService
      .getUsers(params)
      .then((res) => { setUsers(res.items); setTotal(res.total); })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(page, search, roleFilter, statusFilter, verifFilter, facilityFilter, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sortBy, sortOrder]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search, roleFilter, statusFilter, verifFilter, facilityFilter);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter, statusFilter, verifFilter, facilityFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await superAdminService.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers(page, search, roleFilter, statusFilter, verifFilter, facilityFilter);
    } catch {
      setError('Failed to deactivate user.');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const selectCls = 'bg-white border border-line rounded-[8px] px-3 py-[7px] text-[11.5px] text-slate font-semibold outline-none cursor-pointer';

  return (
    <SuperAdminLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">User Management</div>
          <div className="text-[11.5px] text-slate">
            {loading ? '—' : `${total.toLocaleString()} users across all facilities`}
          </div>
        </div>
        <button
          onClick={() => navigate('/superadmin/users/new')}
          className="bg-navy text-white text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] hover:bg-navy-2 transition-colors"
        >
          + Add User
        </button>
      </div>

      {error && (
        <div className="mb-4 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-[14px] flex-wrap">
        {/* Search */}
        <div className="flex items-center bg-white border border-line rounded-[8px] px-3 py-[7px] gap-2" style={{ minWidth: 220 }}>
          <span className="text-[11.5px] text-slate-2">🔍</span>
          <input
            type="text"
            placeholder="Search users…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-[11.5px] text-ink outline-none bg-transparent"
          />
        </div>

        {/* Role */}
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className={selectCls}>
          {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Facility */}
        <select value={facilityFilter} onChange={(e) => { setFacilityFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="">All Facilities</option>
          {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>

        {/* Status */}
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* Verification */}
        <select value={verifFilter} onChange={(e) => { setVerifFilter(e.target.value); setPage(1); }} className={selectCls}>
          <option value="">All Verification</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <Panel>
        <div className="overflow-hidden rounded-[10px] border border-line">
          <table className="adm-table">
            <thead>
              <tr>
                <SortTh label="Name" column="name" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <SortTh label="Role" column="role" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th>Facility</th>
                <SortTh label="Status" column="status" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center text-slate py-10 text-[12px]">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-slate py-10 text-[12px]">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="font-semibold text-[12px] text-ink">{u.fullName}</div>
                      <div className="text-[11px] text-slate">{u.email}</div>
                    </td>
                    <td>
                      <Badge label={roleLabel(u.role)} variant={roleBadgeVariant(u.role)} />
                    </td>
                    <td className="text-[12px] text-ink">
                      {u.facilityName ?? <span className="text-slate">—</span>}
                    </td>
                    <td>
                      <Badge label={u.isActive ? 'Active' : 'Inactive'} variant={u.isActive ? 'success' : 'neutral'} />
                    </td>
                    <td>
                      <Badge label={u.isVerified ? 'Verified' : 'Pending'} variant={u.isVerified ? 'success' : 'warning'} />
                    </td>
                    <td>
                      <span className="text-[12px]">
                        <button
                          onClick={() => navigate(`/superadmin/users/${u.id}/edit`)}
                          className="text-navy-2 font-semibold hover:underline bg-transparent outline-none cursor-pointer"
                        >
                          Edit
                        </button>
                        {u.role !== 'super_admin' && (
                          <>
                            <span className="text-slate mx-[6px]">·</span>
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="text-urgent font-semibold hover:underline bg-transparent outline-none cursor-pointer"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && total > LIMIT && (
          <div className="flex items-center justify-between mt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="text-[11.5px] font-semibold text-navy-2 disabled:opacity-40 disabled:cursor-default hover:underline bg-transparent outline-none cursor-pointer"
            >
              ← Previous
            </button>
            <span className="text-[11.5px] text-slate">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-[11.5px] font-semibold text-navy-2 disabled:opacity-40 disabled:cursor-default hover:underline bg-transparent outline-none cursor-pointer"
            >
              Next →
            </button>
          </div>
        )}
      </Panel>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <Modal
          title="Deactivate user?"
          message={`"${deleteTarget.fullName}" will be deactivated and lose access to the platform. This can be reversed by editing the user.`}
          confirmLabel="Deactivate"
          confirmVariant="danger"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </SuperAdminLayout>
  );
}
