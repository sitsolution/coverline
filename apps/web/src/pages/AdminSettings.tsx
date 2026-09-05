import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import Badge from '../components/ui/Badge';
import adminSettingsService, { FacilityProfileOut, AdminUserRow } from '../services/adminSettingsService';

const NAV_ITEMS = [
  'Facility Profile',
  'Users & Permissions',
  'Shift Settings',
  'Notification Settings',
  'Payment Settings',
  'Integrations',
  'Security',
  'Help & Support',
];

export default function AdminSettings() {
  const [activeNav, setActiveNav] = useState('Facility Profile');
  const [profile, setProfile] = useState<FacilityProfileOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Users tab
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Editable fields
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await adminSettingsService.getFacility();
      setProfile(p);
      setName(p.name);
      setAddress(p.address ?? '');
      setContactEmail(p.contactEmail ?? '');
      setDescription(p.description ?? '');
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const list = await adminSettingsService.getUsers();
      setUsers(list);
    } catch {} finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (activeNav === 'Users & Permissions') loadUsers();
  }, [activeNav, loadUsers]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setSaveError('');
    setFieldErrors({});
    try {
      const updated = await adminSettingsService.updateFacility({ name, address, contactEmail, description });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      const resp = err?.response?.data;
      if (resp?.fields && typeof resp.fields === 'object') {
        setFieldErrors(resp.fields);
      } else if (resp?.detail) {
        setSaveError(resp.detail);
      } else {
        setSaveError('Failed to save changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-4">Settings</h1>

      <div className="grid gap-4" style={{ gridTemplateColumns: '200px 1fr' }}>
        {/* Left nav */}
        <Panel className="p-2">
          {NAV_ITEMS.map((item) => (
            <div
              key={item}
              onClick={() => setActiveNav(item)}
              className={`px-[10px] py-[9px] rounded-[8px] text-[12px] font-semibold cursor-pointer mb-[2px] last:mb-0 ${
                activeNav === item ? 'bg-navy text-white' : 'text-slate hover:bg-paper'
              }`}
            >
              {item}
            </div>
          ))}
        </Panel>

        {/* Right content */}
        {activeNav === 'Facility Profile' && (
          <Panel title="Facility Profile">
            {loading ? (
              <p className="text-[12px] text-slate">Loading…</p>
            ) : (
              <>
                <div className="mb-[13px]">
                  <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Facility Name</label>
                  <input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: '' })); }}
                    className={`w-full px-3 py-[11px] border-[1.4px] rounded-[9px] text-[13px] text-ink outline-none bg-white ${fieldErrors.name ? 'border-urgent focus:border-urgent' : 'border-line focus:border-navy-2'}`}
                  />
                  {fieldErrors.name && <p className="text-[11px] text-urgent mt-1">{fieldErrors.name}</p>}
                </div>
                <div className="mb-[13px]">
                  <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Address</label>
                  <input
                    value={address}
                    onChange={(e) => { setAddress(e.target.value); setFieldErrors(p => ({ ...p, address: '' })); }}
                    className={`w-full px-3 py-[11px] border-[1.4px] rounded-[9px] text-[13px] text-ink outline-none bg-white ${fieldErrors.address ? 'border-urgent focus:border-urgent' : 'border-line focus:border-navy-2'}`}
                  />
                  {fieldErrors.address && <p className="text-[11px] text-urgent mt-1">{fieldErrors.address}</p>}
                </div>
                <div className="mb-[13px]">
                  <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => { setContactEmail(e.target.value); setFieldErrors(p => ({ ...p, contactEmail: '' })); }}
                    className={`w-full px-3 py-[11px] border-[1.4px] rounded-[9px] text-[13px] text-ink outline-none bg-white ${fieldErrors.contactEmail ? 'border-urgent focus:border-urgent' : 'border-line focus:border-navy-2'}`}
                  />
                  {fieldErrors.contactEmail && <p className="text-[11px] text-urgent mt-1">{fieldErrors.contactEmail}</p>}
                </div>
                <div className="mb-[13px]">
                  <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Description</label>
                  <input
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); setFieldErrors(p => ({ ...p, description: '' })); }}
                    className={`w-full px-3 py-[11px] border-[1.4px] rounded-[9px] text-[13px] text-ink outline-none bg-white ${fieldErrors.description ? 'border-urgent focus:border-urgent' : 'border-line focus:border-navy-2'}`}
                  />
                  {fieldErrors.description && <p className="text-[11px] text-urgent mt-1">{fieldErrors.description}</p>}
                </div>

                {saveError && <p className="text-[11px] text-urgent font-semibold mb-2">{saveError}</p>}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-navy text-white text-[13px] font-bold px-4 py-[11px] rounded-[10px] disabled:opacity-60"
                >
                  {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
                </button>

                {profile && (
                  <p className="text-[11px] text-slate mt-3">
                    {profile.city}{profile.state ? `, ${profile.state}` : ''} · Rating: {profile.rating.toFixed(1)}★
                  </p>
                )}
              </>
            )}

            {/* Quick links */}
            <div className="mt-4 pt-4 border-t border-line flex items-center gap-3">
              <Link
                to="/billing"
                className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px]"
              >
                💳 Invoices &amp; Billing
              </Link>
              <Link
                to="/settings/add-user"
                className="bg-navy text-white text-[11.5px] font-bold px-3 py-[7px] rounded-[8px]"
              >
                + Add Admin User
              </Link>
            </div>
          </Panel>
        )}

        {activeNav === 'Users & Permissions' && (
          <Panel title="Users & Permissions">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[12px] text-slate">Admin users for your facility.</p>
              <Link
                to="/settings/add-user"
                className="bg-navy text-white text-[11.5px] font-bold px-3 py-[7px] rounded-[8px]"
              >
                + Invite Admin User
              </Link>
            </div>
            {usersLoading ? (
              <p className="text-[12px] text-slate">Loading…</p>
            ) : users.length === 0 ? (
              <p className="text-[12px] text-slate text-center py-4">No admin users found.</p>
            ) : (
              <div className="overflow-hidden rounded-[10px] border border-line">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="font-semibold">{u.name}</td>
                        <td className="text-slate">{u.email}</td>
                        <td>
                          <Badge
                            label={u.facilityRole === 'super_admin' ? 'Super Admin' : 'Manager'}
                            variant={u.facilityRole === 'super_admin' ? 'info' : 'neutral'}
                          />
                        </td>
                        <td>
                          <Badge
                            label={u.acceptedAt ? 'Active' : 'Invited'}
                            variant={u.acceptedAt ? 'success' : 'warning'}
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

        {!['Facility Profile', 'Users & Permissions'].includes(activeNav) && (
          <Panel title={activeNav}>
            <p className="text-[12px] text-slate py-4">This section is coming soon.</p>
          </Panel>
        )}
      </div>
    </Layout>
  );
}
