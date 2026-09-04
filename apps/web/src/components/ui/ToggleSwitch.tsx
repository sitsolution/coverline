import { useState } from 'react';

type Props = {
  label: string;
  defaultOn?: boolean;
  onChange?: (on: boolean) => void;
};

export default function ToggleSwitch({ label, defaultOn = false, onChange }: Props) {
  const [on, setOn] = useState(defaultOn);

  const toggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center justify-between py-[11px] border-b border-line last:border-0">
      <span className="text-[12.5px] font-semibold text-ink">{label}</span>
      <button
        onClick={toggle}
        className={`relative w-[38px] h-[22px] rounded-full transition-colors outline-none flex-none ${on ? 'bg-navy' : 'bg-line'}`}
      >
        <span
          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white transition-all ${on ? 'right-[2px]' : 'left-[2px]'}`}
        />
      </button>
    </div>
  );
}
