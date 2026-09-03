type Props = {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
};

export default function FormField({ label, placeholder, defaultValue, type = 'text' }: Props) {
  return (
    <div className="mb-[13px]">
      <label className="block text-[11.5px] font-bold text-slate mb-[6px]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full px-3 py-[11px] border-[1.4px] border-line rounded-[9px] text-[13px] text-ink outline-none focus:border-navy-2 bg-white"
      />
    </div>
  );
}
