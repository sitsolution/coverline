import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import adminSettingsService, { FacilityProfileOut } from '../services/adminSettingsService';

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

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await adminSettingsService.updateFacility({ name, address, contactEmail, description });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally {
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
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-[11px] border-[1.4px] border-line rounded-[9px] text-[13px] text-ink outline-none focus:border-navy-2 bg-white"
                  />
                </div>
                <div className="mb-[13px]">
                  <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-[11px] border-[1.4px] border-line rounded-[9px] text-[13px] text-ink outline-none focus:border-navy-2 bg-white"
                  />
                </div>
                <div className="mb-[13px]">
                  <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-[11px] border-[1.4px] border-line rounded-[9px] text-[13px] text-ink outline-none focus:border-navy-2 bg-white"
                  />
                </div>
                <div className="mb-[13px]">
                  <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Description</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-[11px] border-[1.4px] border-line rounded-[9px] text-[13px] text-ink outline-none focus:border-navy-2 bg-white"
                  />
                </div>

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
            <p className="text-[12px] text-slate mb-4">Manage admin users for your facility.</p>
            <Link
              to="/settings/add-user"
              className="inline-block bg-navy text-white text-[11.5px] font-bold px-3 py-[7px] rounded-[8px]"
            >
              + Invite Admin User
            </Link>
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
