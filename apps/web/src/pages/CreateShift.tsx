import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Panel from '../components/ui/Panel';
import FormField from '../components/ui/FormField';
import ToggleSwitch from '../components/ui/ToggleSwitch';
import adminShiftsService, { ShiftFormOptions } from '../services/adminShiftsService';

// Simple select
function SelectField({
  label,
  options,
  labels,
  value,
  onChange,
  error,
}: {
  label: string;
  options: string[];
  labels?: Record<string, string>;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div className="mb-[13px]">
      <label className="block text-[11.5px] font-bold text-slate mb-[6px]">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-[10px] border-[1.4px] rounded-[9px] text-[13px] text-ink bg-white outline-none focus:border-navy-2 appearance-none ${error ? 'border-urgent' : 'border-line'}`}
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%235C6B7A' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
      >
        {options.map((o) => <option key={o || '__none'} value={o}>{o === '' ? '— None —' : (labels?.[o] ?? o)}</option>)}
      </select>
      {error && <p className="text-[11px] text-urgent mt-1">{error}</p>}
    </div>
  );
}

const SHIFT_TYPES = ['Regular', 'Emergency', 'Weekend', 'Night'];

const ROLE_OPTIONS = ['doctor', 'nurse', 'ot_tech', 'housekeeping'];
const ROLE_LABELS: Record<string, string> = {
  doctor: 'Doctor',
  nurse: 'Nurse',
  ot_tech: 'OT Technician',
  housekeeping: 'Housekeeping',
};

// Specialties per role — sourced from the mobile signup screens
const ROLE_SPECIALTIES: Record<string, string[]> = {
  doctor: ['General Medicine', 'Emergency Medicine', 'Anaesthesia', 'Pediatrics'],
  nurse: ['ICU Nursing', 'General Ward', 'OT Nursing', 'Pediatric Nursing', 'Emergency Nursing'],
  ot_tech: ['General Ward', 'OT', 'ICU', 'Emergency'],
  housekeeping: ['General Ward', 'OT Housekeeping', 'Admin Block', 'ICU'],
};

const ROLE_QUALIFICATIONS: Record<string, string[]> = {
  doctor: ['MBBS', 'MD/MS', 'DNB'],
  nurse: ['GNM', 'B.Sc. Nursing', 'Post Basic B.Sc. Nursing'],
  ot_tech: ['Diploma in OT Technology', 'B.Sc. OT Technology', 'Allied Health Council'],
  housekeeping: [],
};

const ROLE_CERTIFICATIONS: Record<string, string[]> = {
  doctor: ['BLS', 'ACLS'],
  nurse: ['BLS', 'ACLS'],
  ot_tech: ['BLS'],
  housekeeping: [],
};

export default function CreateShift() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<ShiftFormOptions | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [title, setTitle] = useState('');
  const [role, setRole] = useState('doctor');
  const [facilityId, setFacilityId] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [shiftType, setShiftType] = useState('Regular');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [payRate, setPayRate] = useState('');
  const [overtimeRate, setOvertimeRate] = useState('');
  const [requiredQualification, setRequiredQualification] = useState('');
  const [requiredCertification, setRequiredCertification] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [notifyStaff, setNotifyStaff] = useState(true);

  useEffect(() => {
    adminShiftsService.getFormOptions().then((opts) => {
      setOptions(opts);
      setSpecialty(ROLE_SPECIALTIES['doctor'][0]);
      if (opts.facilities.length > 0) setFacilityId(String(opts.facilities[0].id));
    }).catch(() => {});
  }, []);

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = 'Date is required.';
    else if (date < new Date().toISOString().slice(0, 10)) errs.date = 'Date cannot be in the past.';
    if (!startTime) errs.startTime = 'Start time is required.';
    if (!endTime) errs.endTime = 'End time is required.';
    if (startTime && endTime && endTime <= startTime) errs.endTime = 'End time must be after start time.';
    if (!payRate) errs.payRate = 'Pay rate is required.';
    else if (isNaN(parseFloat(payRate)) || parseFloat(payRate) <= 0) errs.payRate = 'Enter a valid pay rate.';
    if (overtimeRate && (isNaN(parseFloat(overtimeRate)) || parseFloat(overtimeRate) <= 0))
      errs.overtimeRate = 'Enter a valid overtime rate.';
    return errs;
  };

  const handleSave = async (publish: boolean) => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError('Please fix the highlighted fields below.');
      return;
    }
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const shift = await adminShiftsService.createShift({
        title: title || undefined,
        facilityId: facilityId ? parseInt(facilityId) : undefined,
        role,
        specialty,
        isUrgent: shiftType === 'Emergency',
        shiftType,
        date,
        startTime,
        endTime,
        payRate: parseFloat(payRate),
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : undefined,
        requiredQualifications: requiredQualification ? [requiredQualification] : [],
        requiredCertifications: requiredCertification ? [requiredCertification] : [],
        requirements: requirements || undefined,
        isVisible,
        notifyStaff,
        publish,
      });
      navigate(`/shifts/${shift.id}`);
    } catch (err: unknown) {
      const data = (err as any)?.response?.data;
      const fields = data?.fields ?? {};
      if (Object.keys(fields).length > 0) {
        setFieldErrors(fields);
        setError('Please fix the highlighted fields below.');
      } else {
        setError(data?.detail ?? 'Failed to create shift.');
      }
    } finally {
      setSaving(false);
    }
  };

  const facilityOptions = options?.facilities ?? [];

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

            {/* Location */}
            <div className="mb-[13px]">
              <label className="block text-[11.5px] font-bold text-slate mb-[6px]">Location</label>
              <select
                value={facilityId}
                onChange={(e) => setFacilityId(e.target.value)}
                className="w-full px-3 py-[10px] border-[1.4px] border-line rounded-[9px] text-[13px] text-ink bg-white outline-none focus:border-navy-2 appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%235C6B7A' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
              >
                {facilityOptions.map((f) => (
                  <option key={f.id} value={String(f.id)}>{f.name}{f.location ? ` — ${f.location}` : ''}</option>
                ))}
              </select>
            </div>

            <SelectField
              label="Role Needed"
              options={ROLE_OPTIONS}
              labels={ROLE_LABELS}
              value={role}
              onChange={(v) => {
                setRole(v);
                setSpecialty(ROLE_SPECIALTIES[v][0]);
                setRequiredQualification('');
                setRequiredCertification('');
                clearFieldError('specialty');
              }}
            />

            <SelectField
              label="Department / Specialty"
              options={ROLE_SPECIALTIES[role]}
              value={specialty}
              onChange={(v) => { setSpecialty(v); clearFieldError('specialty'); }}
              error={fieldErrors.specialty}
            />

            <SelectField
              label="Shift Type"
              options={SHIFT_TYPES}
              value={shiftType}
              onChange={setShiftType}
            />
          </Panel>

          <Panel title="Date & Time">
            <FormField
              label="Date"
              type="date"
              value={date}
              error={fieldErrors.date}
              onChange={(e) => { setDate(e.target.value); clearFieldError('date'); }}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Start Time"
                type="time"
                value={startTime}
                error={fieldErrors.startTime}
                onChange={(e) => { setStartTime(e.target.value); clearFieldError('startTime'); clearFieldError('endTime'); }}
              />
              <FormField
                label="End Time"
                type="time"
                value={endTime}
                error={fieldErrors.endTime}
                onChange={(e) => { setEndTime(e.target.value); clearFieldError('endTime'); }}
              />
            </div>
          </Panel>

          <Panel title="Requirements">
            {ROLE_QUALIFICATIONS[role].length > 0 && (
              <SelectField
                label="Required Qualifications"
                options={['', ...ROLE_QUALIFICATIONS[role]]}
                value={requiredQualification}
                onChange={setRequiredQualification}
              />
            )}
            {ROLE_CERTIFICATIONS[role].length > 0 && (
              <SelectField
                label="Required Certifications"
                options={['', ...ROLE_CERTIFICATIONS[role]]}
                value={requiredCertification}
                onChange={setRequiredCertification}
              />
            )}
            {ROLE_QUALIFICATIONS[role].length === 0 && ROLE_CERTIFICATIONS[role].length === 0 && (
              <p className="text-[11.5px] text-slate mb-[13px]">No qualification or certification requirements for this role.</p>
            )}
            <FormField
              label="Additional Notes"
              placeholder="Must be comfortable with trauma cases"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </Panel>
        </div>

        {/* Right column */}
        <div>
          <Panel title="Compensation">
            <FormField
              label="Pay Rate (₹)"
              placeholder="9500"
              value={payRate}
              error={fieldErrors.payRate}
              onChange={(e) => { setPayRate(e.target.value); clearFieldError('payRate'); }}
            />
            <FormField
              label="Overtime Rate (optional)"
              placeholder="1200"
              value={overtimeRate}
              error={fieldErrors.overtimeRate}
              onChange={(e) => { setOvertimeRate(e.target.value); clearFieldError('overtimeRate'); }}
            />
          </Panel>

          <Panel title="Visibility">
            <ToggleSwitch label={`Make Visible to All ${ROLE_LABELS[role] ?? 'Staff'}s`} defaultOn={true} onChange={setIsVisible} />
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
