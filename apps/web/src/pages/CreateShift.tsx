import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import FormField from '../components/ui/FormField';
import SelectField from '../components/ui/SelectField';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import adminShiftsService, { ShiftFormOptions } from '../services/adminShiftsService';

export default function CreateShift() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<ShiftFormOptions | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [facilityId, setFacilityId] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [role, setRole] = useState('doctor');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [payRate, setPayRate] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [notifyStaff, setNotifyStaff] = useState(true);

  useEffect(() => {
    adminShiftsService.getFormOptions().then(setOptions).catch(() => {});
  }, []);

  const handleSave = async (publish: boolean) => {
    if (!date || !startTime || !endTime || !payRate) {
      setError('Please fill in date, start time, end time and pay rate.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const shift = await adminShiftsService.createShift({
        title: title || undefined,
        facilityId: facilityId ? parseInt(facilityId) : undefined,
        specialty,
        role,
        date,
        startTime,
        endTime,
        payRate: parseFloat(payRate),
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
        requirements: requirements || undefined,
        isVisible,
        notifyStaff,
        publish,
      });
      navigate(`/shifts/${shift.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to create shift.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const facilityOptions = options?.facilities.map(f => f.name) ?? [];
  const specialtyOptions = options?.specialties ?? ['Emergency Medicine', 'General Medicine', 'Pediatrics', 'Anaesthesia'];

  return (
    <Layout>
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Create New Shift</h1>
      <p className="text-[11.5px] text-slate mb-4">Fill in the details below to publish a new shift</p>

      {error && (
        <div className="mb-4 px-3 py-[9px] bg-urgent-bg border border-urgent rounded-[8px] text-[11.5px] text-urgent font-semibold">
          {error}
        </div>
      )}

      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Left column */}
        <div>
          <Panel title="Basic Information">
            <FormField label="Shift Title" placeholder="ER Night Cover" value={title} onChange={(e) => setTitle(e.target.value)} />
            {facilityOptions.length > 0 && (
              <SelectField
                label="Location"
                options={facilityOptions}
                onChange={(v) => {
                  const f = options?.facilities.find(f => f.name === v);
                  if (f) setFacilityId(String(f.id));
                }}
              />
            )}
            <SelectField label="Department/Specialty" options={specialtyOptions} onChange={setSpecialty} />
            <SelectField label="Role" options={['doctor', 'nurse', 'ot_tech', 'housekeeping']} onChange={setRole} />
          </Panel>

          <Panel title="Date & Time">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Time" type="time" onChange={(e) => setStartTime(e.target.value)} />
              <FormField label="End Time" type="time" onChange={(e) => setEndTime(e.target.value)} />
            </div>
            <FormField label="Date" type="date" onChange={(e) => setDate(e.target.value)} />
          </Panel>

          <Panel title="Requirements">
            <FormField label="Additional Notes" placeholder="Must be comfortable with trauma cases" value={requirements} onChange={(e) => setRequirements(e.target.value)} />
          </Panel>
        </div>

        {/* Right column */}
        <div>
          <Panel title="Compensation">
            <FormField label="Pay Rate (₹)" placeholder="9500" value={payRate} onChange={(e) => setPayRate(e.target.value)} />
            <FormField label="Overtime Rate (optional)" placeholder="1200" value={overtimeRate} onChange={(e) => setOvertimeRate(e.target.value)} />
          </Panel>

          <Panel title="Visibility">
            <ToggleSwitch label="Make Visible to All Doctors" defaultOn={true} onChange={setIsVisible} />
            <ToggleSwitch label="Send Notifications" defaultOn={true} onChange={setNotifyStaff} />
          </Panel>

          <Panel>
            <button
              className="w-full bg-navy text-white text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2 disabled:opacity-60"
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save & Publish'}
            </button>
            <button
              className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2 disabled:opacity-60"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
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
