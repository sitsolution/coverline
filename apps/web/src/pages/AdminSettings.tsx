import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import FormField from '../components/ui/FormField';

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
  return (
    <Layout>
      {/* Header */}
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-4">Settings</h1>

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '200px 1fr' }}>
        {/* Left nav */}
        <Panel className="p-2">
          {NAV_ITEMS.map((item) => (
            <div
              key={item}
              className={`px-[10px] py-[9px] rounded-[8px] text-[12px] font-semibold cursor-pointer mb-[2px] last:mb-0 ${
                item === 'Facility Profile'
                  ? 'bg-navy text-white'
                  : 'text-slate hover:bg-paper'
              }`}
            >
              {item}
            </div>
          ))}
        </Panel>

        {/* Right content */}
        <Panel title="Facility Profile">
          <FormField label="Facility Name" defaultValue="St. Joseph Hospital" />
          <FormField label="Address" defaultValue="221 MG Road, Kalyani Nagar, Pune" />
          <FormField label="Contact Email" defaultValue="ops@stjosephhosp.in" type="email" />
          <FormField label="Description" defaultValue="Multi-specialty hospital serving Pune East" />
          <button className="bg-navy text-white text-[13px] font-bold px-4 py-[11px] rounded-[10px]">
            Save Changes
          </button>

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
      </div>
    </Layout>
  );
}
