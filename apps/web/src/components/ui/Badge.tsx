type Variant = 'success' | 'warning' | 'urgent' | 'info' | 'gold' | 'neutral' | 'default';

const STYLES: Record<Variant, string> = {
  success: 'bg-success-bg text-success',
  warning: 'bg-warning-bg text-warning',
  urgent:  'bg-urgent-bg  text-urgent',
  info:    'bg-info-bg    text-info',
  gold:    'bg-gold-bg    text-gold',
  neutral: 'bg-[#EEF2F5]  text-slate',
  default: 'bg-sky        text-navy',
};

type Props = {
  label: string;
  variant?: Variant;
};

export default function Badge({ label, variant = 'default' }: Props) {
  return (
    <span className={`inline-flex items-center px-[9px] py-[3px] rounded-full text-[10.5px] font-bold ${STYLES[variant]}`}>
      {label}
    </span>
  );
}
