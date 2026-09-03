import { useNavigate } from 'react-router-dom';

type Props = { facility?: string };

export default function Topbar({ facility = 'St. Joseph Hospital' }: Props) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center gap-[14px] px-[22px] py-[13px] border-b border-line bg-white">
      {/* Facility name */}
      <span className="font-bold text-[13px] text-ink">{facility}</span>

      {/* Search */}
      <div className="flex-1 max-w-[320px] bg-paper border border-line rounded-sm px-3 py-[7px] text-[11.5px] text-slate-2 select-none cursor-text">
        🔍 Search…
      </div>

      <div className="flex-1" />

      {/* Bell */}
      <div onClick={() => navigate('/notifications')} className="relative w-8 h-8 rounded-full bg-white border border-line flex items-center justify-center text-[14px] cursor-pointer">
        🔔
        <span className="absolute top-[5px] right-[6px] w-[7px] h-[7px] rounded-full bg-urgent border-[1.5px] border-white" />
      </div>

      {/* Avatar */}
      <div className="w-[30px] h-[30px] rounded-full bg-sky flex items-center justify-center text-[11px] font-extrabold text-navy flex-none">
        SA
      </div>
    </div>
  );
}
