type Props = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
};

export default function TabNav({ tabs, active, onChange }: Props) {
  return (
    <div className="flex gap-[18px] text-[12px] font-bold text-slate border-b border-line mb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={
            tab === active
              ? 'text-navy border-b-2 border-navy pb-[10px] bg-transparent outline-none cursor-pointer'
              : 'text-slate pb-[10px] bg-transparent outline-none cursor-pointer hover:text-navy-2 transition-colors'
          }
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
