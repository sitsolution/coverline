type Props = {
  label: string;
  options: string[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
};

export default function SelectField({ label, options, defaultValue, value, onChange, error }: Props) {
  return (
    <div className="mb-[13px]">
      <label className="block text-[11.5px] font-bold text-slate mb-[6px]">{label}</label>
      <select
        value={value ?? defaultValue ?? options[0]}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full px-3 py-[11px] border-[1.4px] rounded-[9px] text-[13px] text-ink outline-none bg-white appearance-none ${
          error ? 'border-urgent focus:border-urgent' : 'border-line focus:border-navy-2'
        }`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-[11px] text-urgent font-semibold">{error}</p>}
    </div>
  );
}
