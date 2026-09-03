import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import FormField from '../components/ui/FormField';
import SelectField from '../components/ui/SelectField';

const PERMISSIONS = ['Shifts', 'Staff', 'Bookings', 'Documents', 'Reports', 'Billing'];
const DEFAULT_CHECKED = new Set(['Shifts', 'Staff', 'Bookings', 'Documents', 'Reports']);

export default function AddAdminUser() {
  const [checked, setChecked] = useState<Set<string>>(new Set(DEFAULT_CHECKED));

  const toggle = (perm: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(perm)) {
        next.delete(perm);
      } else {
        next.add(perm);
      }
      return next;
    });
  };

  return (
    <Layout>
      {/* Header */}
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Add Team Member</h1>
      <p className="text-[11.5px] text-slate mb-4">Invite a new admin user to St. Joseph Hospital</p>

      <Panel className="max-w-[520px]">
        <FormField label="Full Name" defaultValue="Rohan Deshpande" />
        <FormField label="Email Address" defaultValue="rohan@stjosephhosp.in" type="email" />
        <SelectField label="Role" options={['Super Admin', 'Manager', 'Staff']} />
        <FormField label="Phone Number (optional)" placeholder="+91 98xxxxxx77" type="tel" />

        {/* Permissions */}
        <p className="text-[13px] font-extrabold font-display text-ink mt-[6px] mb-[10px]">Permissions</p>
        {PERMISSIONS.map((perm) => (
          <label key={perm} className="flex items-center gap-2 text-[12px] py-[5px] cursor-pointer">
            <input
              type="checkbox"
              checked={checked.has(perm)}
              onChange={() => toggle(perm)}
              className="w-4 h-4 accent-navy"
            />
            {perm}
          </label>
        ))}

        {/* Buttons */}
        <div className="flex gap-[10px] mt-4">
          <button className="flex-1 bg-transparent text-slate text-[13px] font-semibold px-4 py-[11px] rounded-[10px]">
            Cancel
          </button>
          <button className="flex-1 bg-navy text-white text-[13px] font-bold px-4 py-[11px] rounded-[10px]">
            Send Invitation
          </button>
        </div>
      </Panel>
    </Layout>
  );
}
