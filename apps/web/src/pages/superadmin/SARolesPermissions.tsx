import { useEffect, useState } from 'react';
import SuperAdminLayout from '../../components/layout/SuperAdminLayout';
import superAdminService, { RolePermissionSet, SARoleItem } from '../../services/superAdminService';

type PermKey = keyof RolePermissionSet;

const PERMISSION_LABELS: Array<{ key: PermKey; label: string }> = [
  { key: 'viewShifts',             label: 'View Shifts'              },
  { key: 'createEditShifts',       label: 'Create / Edit Shifts'     },
  { key: 'viewStaffDirectory',     label: 'View Staff Directory'      },
  { key: 'manageBookings',         label: 'Manage Bookings'          },
  { key: 'verifyDocuments',        label: 'Verify Documents'         },
  { key: 'viewReports',            label: 'View Reports'             },
  { key: 'manageFacilitySettings', label: 'Manage Facility Settings' },
  { key: 'manageUsers',            label: 'Manage Users'             },
];

export default function SARolesPermissions() {
  const [roles, setRoles]                   = useState<SARoleItem[]>([]);
  const [loading, setLoading]               = useState(true);
  const [selectedKey, setSelectedKey]       = useState<string>('');
  // track in-flight edits per role separately from server state
  const [edits, setEdits]                   = useState<Record<string, RolePermissionSet>>({});
  const [saving, setSaving]                 = useState(false);
  const [notice, setNotice]                 = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    superAdminService.getRoles()
      .then(({ roles: fetched }) => {
        setRoles(fetched);
        if (fetched.length) setSelectedKey(fetched[0].roleKey);
        // initialise edits map from server data
        const map: Record<string, RolePermissionSet> = {};
        fetched.forEach((r) => { map[r.roleKey] = { ...r.permissions }; });
        setEdits(map);
      })
      .catch(() => {
        setNotice({ type: 'error', msg: 'Failed to load roles. Please refresh.' });
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedRole = roles.find((r) => r.roleKey === selectedKey);
  const editedPerms  = selectedKey ? edits[selectedKey] : null;

  function togglePerm(key: PermKey) {
    if (!selectedKey || !editedPerms) return;
    setEdits((prev) => ({
      ...prev,
      [selectedKey]: { ...prev[selectedKey], [key]: !prev[selectedKey][key] },
    }));
    // clear any lingering notice when user starts editing
    setNotice(null);
  }

  function handleSave() {
    if (!selectedRole || !editedPerms) return;
    if (selectedRole.isSuperAdmin) {
      setNotice({ type: 'error', msg: 'Super Admin permissions cannot be modified.' });
      return;
    }
    setSaving(true);
    setNotice(null);
    superAdminService.updateRolePermissions(selectedRole.roleKey, editedPerms)
      .then((updated) => {
        // sync server response back into roles list
        setRoles((prev) => prev.map((r) => r.roleKey === updated.roleKey ? updated : r));
        setEdits((prev) => ({ ...prev, [updated.roleKey]: { ...updated.permissions } }));
        setNotice({ type: 'success', msg: 'Permissions saved successfully.' });
        setTimeout(() => setNotice(null), 3000);
      })
      .catch(() => {
        setNotice({ type: 'error', msg: 'Save failed. Please try again.' });
      })
      .finally(() => setSaving(false));
  }

  const isDirty =
    selectedRole &&
    !selectedRole.isSuperAdmin &&
    editedPerms &&
    PERMISSION_LABELS.some(({ key }) => editedPerms[key] !== selectedRole.permissions[key]);

  return (
    <SuperAdminLayout>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">
            Roles &amp; Permissions
          </div>
          <div className="text-[11.5px] text-slate">
            {loading ? 'Loading…' : `${roles.length} roles configured across the platform`}
          </div>
        </div>
        <button
          disabled
          title="Custom roles not available in Phase 1"
          className="bg-navy text-white text-[12px] font-bold px-4 py-[9px] rounded-[9px] opacity-40 cursor-not-allowed"
        >
          + Add Role
        </button>
      </div>

      {/* Global notice */}
      {notice && (
        <div
          className={`mb-4 px-3 py-[9px] border rounded-[8px] text-[11.5px] font-semibold ${
            notice.type === 'success'
              ? 'bg-success-bg border-success text-success'
              : 'bg-urgent-bg border-urgent text-urgent'
          }`}
        >
          {notice.msg}
        </div>
      )}

      {loading ? (
        <div className="text-[12px] text-slate py-8 text-center">Loading roles…</div>
      ) : (
        <div className="grid grid-cols-[1.4fr_1fr] gap-4">
          {/* Left: roles table */}
          <div className="bg-white border border-line rounded-[11px] overflow-hidden mb-4">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Users</th>
                  <th>Scope</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r) => (
                  <tr
                    key={r.roleKey}
                    style={r.roleKey === selectedKey ? { background: '#EAF2F8' } : undefined}
                  >
                    <td className="font-semibold">{r.displayName}</td>
                    <td>{r.userCount.toLocaleString()}</td>
                    <td>{r.scope}</td>
                    <td>
                      <button
                        onClick={() => { setSelectedKey(r.roleKey); setNotice(null); }}
                        className="text-[12px] font-semibold text-navy-2 hover:underline bg-transparent outline-none cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right: edit panel */}
          {selectedRole && editedPerms ? (
            <div className="bg-white border border-line rounded-[11px] p-4 mb-4">
              <div className="text-[12.5px] font-extrabold mb-3">
                Edit Role — {selectedRole.displayName}
              </div>

              {/* Role Name */}
              <div className="mb-4">
                <label className="block text-[11.5px] font-bold text-slate mb-[6px]">
                  Role Name
                </label>
                <input
                  type="text"
                  value={selectedRole.displayName}
                  disabled
                  className="w-full px-3 py-[10px] border-[1.4px] border-line rounded-[9px] text-[12.5px] text-ink bg-paper cursor-not-allowed opacity-70"
                />
                <p className="text-[10.5px] text-slate mt-1">
                  System-defined role — name cannot be changed.
                </p>
              </div>

              {/* Module Permissions */}
              <div className="mb-5">
                <div className="text-[11.5px] font-bold text-slate mb-2 uppercase tracking-wide">
                  Module Permissions
                </div>

                {selectedRole.isSuperAdmin && (
                  <p className="text-[11px] text-slate mb-2 italic">
                    Super Admin always has all permissions and cannot be restricted.
                  </p>
                )}

                <div className="flex flex-col gap-[10px]">
                  {PERMISSION_LABELS.map(({ key, label }) => (
                    <label
                      key={key}
                      className={`flex items-center gap-3 select-none ${
                        selectedRole.isSuperAdmin ? 'cursor-default opacity-70' : 'cursor-pointer'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={editedPerms[key]}
                        disabled={selectedRole.isSuperAdmin}
                        onChange={() => togglePerm(key)}
                        className="w-4 h-4 rounded border-line accent-navy"
                      />
                      <span className="text-[12px] text-ink">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save button */}
              {!selectedRole.isSuperAdmin && (
                <button
                  onClick={handleSave}
                  disabled={saving || !isDirty}
                  className={`w-full text-white text-[13px] font-bold px-4 py-[11px] rounded-[10px] transition-colors ${
                    saving || !isDirty
                      ? 'bg-navy opacity-50 cursor-not-allowed'
                      : 'bg-navy hover:bg-navy-2 cursor-pointer'
                  }`}
                >
                  {saving ? 'Saving…' : isDirty ? 'Save Changes' : 'Save Role'}
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-line rounded-[11px] p-4 mb-4 flex items-center justify-center text-[12px] text-slate">
              Select a role to edit its permissions.
            </div>
          )}
        </div>
      )}
    </SuperAdminLayout>
  );
}
