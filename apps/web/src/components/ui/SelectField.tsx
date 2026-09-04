type Props = {
  label: string;
  options: string[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export default function SelectField({ label, options, defaultValue, value, onChange }: Props) {
  return (
    <div className="mb-[13px]">
      <label className="block text-[11.5px] font-bold text-slate mb-[6px]">{label}</label>
      <select
        defaultValue={defaultValue ?? options[0]}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-[11px] border-[1.4px] border-line rounded-[9px] text-[13px] text-ink outline-none focus:border-navy-2 bg-white appearance-none"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
