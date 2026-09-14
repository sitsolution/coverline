import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SuperAdminLayout from '../../components/layout/SuperAdminLayout';
import Panel from '../../components/ui/Panel';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import superAdminService, { SAFacility, SAUserDetail } from '../../services/superAdminService';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { label: 'Doctor',         value: 'doctor'         },
  { label: 'Nurse',          value: 'nurse'          },
  { label: 'OT Technician',  value: 'ot_tech'        },
  { label: 'Housekeeping',   value: 'housekeeping'   },
  { label: 'Facility Admin', value: 'facility_admin' },
  { label: 'Super Admin',    value: 'super_admin'    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function permissionsText(role: string): string {
  switch (role) {
    case 'super_admin':    return 'Platform-wide access to all facilities, users, reports and settings.';
    case 'facility_admin': return 'Can administer assigned facility: shifts, bookings, documents, staff.';
    default:               return 'Can apply to shifts, manage own availability, upload own documents, view own activity.';
  }
}

function docStatusVariant(status: string): 'success' | 'warning' | 'urgent' | 'neutral' {
  switch (status) {
    case 'verified': return 'success';
    case 'pending':  return 'warning';
    case 'rejected': return 'urgent';
    default:         return 'neutral';
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const inputCls = 'w-full px-3 py-[10px] border-[1.4px] border-line rounded-[9px] text-[12.5px] text-ink outline-none focus:border-navy-2 bg-white';
const labelCls = 'block text-[11.5px] font-bold text-slate mb-[6px]';

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SAAddEditUser() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [user, setUser]           = useState<SAUserDetail | null>(null);
  const [loading, setLoading]     = useState(isEdit);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [deleting, setDeleting]                 = useState(false);
  const [showResetModal, setShowResetModal]     = useState(false);
  const [resetting, setResetting]               = useState(false);
  const [facilities, setFacilities] = useState<SAFacility[]>([]);

  // Form fields
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState('doctor');
  const [isActive, setIsActive]   = useState(true);
  const [facilityId, setFacilityId] = useState('');

  // Load facilities for the select
  useEffect(() => {
    superAdminService.getFacilities({ limit: 200 }).then((r) => setFacilities(r.items)).catch(() => {});
  }, []);

  // Load user in edit mode
  useEffect(() => {
    if (!isEdit || !id) return;
    superAdminService
      .getUser(parseInt(id, 10))
      .then((u) => {
        setUser(u);
        setFullName(u.fullName);
        setEmail(u.email);
        setPhone(u.phone ?? '');
        setRole(u.role);
        setIsActive(u.isActive);
        setFacilityId(u.facilityId ? String(u.facilityId) : '');
      })
      .catch(() => setError('Failed to load user.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (!isEdit) {
        await superAdminService.createUser({
          fullName,
          email,
          phone: phone || null,
          password,
          role,
          isActive,
          facilityId: facilityId ? parseInt(facilityId, 10) : null,
        });
        navigate('/superadmin/users');
      } else {
        await superAdminService.updateUser(parseInt(id!, 10), {
          fullName,
          email,
          phone: phone || null,
          role,
          isActive,
          facilityId: facilityId ? parseInt(facilityId, 10) : 0,
        });
        setSuccess('User updated successfully.');
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail ?? 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await superAdminService.deleteUser(parseInt(id, 10));
      navigate('/superadmin/users');
    } catch {
      setError('Failed to deactivate user.');
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!id) return;
    setResetting(true);
    try {
      const res = await superAdminService.resetUserPassword(parseInt(id, 10));
      setShowResetModal(false);
      setSuccess(res.message);
    } catch {
      setShowResetModal(false);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const pageTitle = isEdit ? `Edit User — ${user?.fullName ?? '…'}` : 'Add New User';

  return (
    <SuperAdminLayout>
      {/* Header */}
      <div className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">{pageTitle}</div>
      <div className="text-[11.5px] text-slate mb-4">
        {isEdit ? 'Update profile, role, facility assignment & documents' : 'Create a new user account on the platform'}
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

      {loading ? (
        <div className="text-[12px] text-slate py-10 text-center">Loading…</div>
      ) : (
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-[1.4fr_1fr] gap-4">

            {/* Left column */}
            <div>
              <Panel title="User Details">
                <div className="flex flex-col gap-[13px]">
                  <div>
                    <label className={labelCls}>Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputCls} placeholder="Full name" />
                  </div>
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} placeholder="email@example.com" />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" className={inputCls} />
                  </div>
                  {!isEdit && (
                    <div>
                      <label className={labelCls}>Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={!isEdit}
                        placeholder="Min. 8 characters"
                        className={inputCls}
                      />
                    </div>
                  )}
                  <div>
                    <label className={labelCls}>Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls + ' cursor-pointer'}>
                      {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Assigned Facility</label>
                    <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className={inputCls + ' cursor-pointer'}>
                      <option value="">— Platform-wide (no facility) —</option>
                      {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={isActive ? 'active' : 'inactive'} onChange={(e) => setIsActive(e.target.value === 'active')} className={inputCls + ' cursor-pointer'}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </Panel>

              {/* Documents (edit mode only) */}
              {isEdit && (
                <Panel title="Documents & Certificates">
                  {(user?.documents ?? []).length === 0 ? (
                    <p className="text-[12px] text-slate text-center py-4">No documents uploaded.</p>
                  ) : (
                    <div className="overflow-hidden rounded-[10px] border border-line">
                      <table className="adm-table">
                        <thead>
                          <tr>
                            <th>Document</th>
                            <th>Type</th>
                            <th>Uploaded</th>
                            <th>Expiry</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(user?.documents ?? []).map((doc) => (
                            <tr key={doc.id}>
                              <td className="font-semibold text-[11.5px]">#{doc.id}</td>
                              <td className="text-[11.5px]">{doc.docType.replace(/_/g, ' ')}</td>
                              <td className="text-[11.5px]">{formatDate(doc.uploadedAt)}</td>
                              <td className="text-[11.5px]">{formatDate(doc.expiryDate)}</td>
                              <td>
                                <Badge
                                  label={doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                  variant={docStatusVariant(doc.status)}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Panel>
              )}
            </div>

            {/* Right column */}
            <div>
              <Panel title="Permissions Summary">
                <div className="text-[11.5px] text-slate leading-[1.7]">
                  Role: <b className="text-ink">{ROLE_OPTIONS.find((o) => o.value === role)?.label ?? role}</b>
                  <br />
                  {permissionsText(role)}
                </div>
              </Panel>

              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-navy text-white text-[13px] font-bold px-4 py-[11px] rounded-[10px] disabled:opacity-60 hover:bg-navy-2 transition-colors"
                >
                  {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create User'}
                </button>

                {isEdit && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="w-full bg-transparent text-navy border-[1.5px] border-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] hover:bg-navy hover:text-white transition-colors"
                    >
                      Reset Password
                    </button>

                    {/* Hide Delete for super_admin users */}
                    {!isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="w-full bg-urgent-bg text-urgent border border-urgent text-[13px] font-bold px-4 py-[11px] rounded-[10px] hover:bg-urgent hover:text-white transition-colors"
                      >
                        Delete User
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() => navigate('/superadmin/users')}
                  className="w-full text-[12px] text-slate hover:text-ink transition-colors bg-transparent outline-none cursor-pointer text-center pt-1"
                >
                  ← Back to Users
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Reset password confirmation modal */}
      {showResetModal && (
        <Modal
          title="Reset password?"
          message={`A password reset email will be sent to ${email}. They will need to follow the link in the email to set a new password.`}
          confirmLabel="Send Reset Email"
          confirmVariant="primary"
          loading={resetting}
          onConfirm={handleResetPassword}
          onCancel={() => setShowResetModal(false)}
        />
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <Modal
          title="Deactivate user?"
          message={`"${fullName}" will be deactivated and lose access to the platform. This can be reversed later by editing the user.`}
          confirmLabel="Deactivate"
          confirmVariant="danger"
          loading={deleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </SuperAdminLayout>
  );
}
