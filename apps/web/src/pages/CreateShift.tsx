import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import FormField from '../components/ui/FormField';
import SelectField from '../components/ui/SelectField';
import ToggleSwitch from '../components/ui/ToggleSwitch';

export default function CreateShift() {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Header */}
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Create New Shift</h1>
      <p className="text-[11.5px] text-slate mb-4">Fill in the details below to publish a new shift</p>

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Left column */}
        <div>
          <Panel title="Basic Information">
            <FormField label="Shift Title" placeholder="ER Night Cover" />
            <SelectField label="Location" options={['Kothrud Pune', 'Kalyani Nagar Pune', 'Wakad Pune']} />
            <SelectField label="Department/Specialty" options={['Emergency Medicine', 'General Medicine', 'Pediatrics', 'Anaesthesia']} />
            <SelectField label="Shift Type" options={['Regular', 'Emergency', 'Weekend', 'Night']} />
          </Panel>

          <Panel title="Date & Time">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Time" defaultValue="8:00 PM" type="time" />
              <FormField label="End Time" defaultValue="8:00 AM" type="time" />
            </div>
            <FormField label="Date" defaultValue="14 Sep 2026" type="date" />
          </Panel>

          <Panel title="Requirements">
            <SelectField label="Required Qualifications" options={['MBBS', 'MD/MS', 'DNB']} />
            <SelectField label="Required Certifications" options={['BLS', 'ACLS']} />
            <FormField label="Additional Notes" placeholder="Must be comfortable with trauma cases" />
          </Panel>
        </div>

        {/* Right column */}
        <div>
          <Panel title="Compensation">
            <FormField label="Pay Rate" placeholder="₹9,500" />
            <FormField label="Overtime Rate (optional)" placeholder="₹1,200/hr" />
          </Panel>

          <Panel title="Visibility">
            <ToggleSwitch label="Make Visible to All Doctors" defaultOn={true} />
            <ToggleSwitch label="Send Notifications" defaultOn={true} />
          </Panel>

          <Panel>
            <button className="w-full bg-navy text-white text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2">
              Save &amp; Publish
            </button>
            <button className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2">
              Save as Draft
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-transparent text-slate text-[13px] font-semibold px-4 py-[11px] rounded-[10px]"
            >
              Cancel
            </button>
          </Panel>
        </div>
      </div>
    </Layout>
  );
}
