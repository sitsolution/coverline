type Props = {
  label: string;
  value: string;
  delta: string;
  deltaColor?: string;
};

export default function KpiCard({ label, value, delta, deltaColor = '#1F8A5F' }: Props) {
  return (
    <div className="bg-white border border-line rounded-[11px] p-[14px]">
      <div className="text-[10.8px] font-semibold text-slate">{label}</div>
      <div className="font-display text-[22px] font-extrabold text-navy-3 mt-1">{value}</div>
      <div className="text-[10.5px] mt-1" style={{ color: deltaColor }}>{delta}</div>
    </div>
  );
}
