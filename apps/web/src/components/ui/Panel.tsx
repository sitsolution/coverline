import { ReactNode } from 'react';

type Props = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Panel({ title, action, children, className = '' }: Props) {
  return (
    <div className={`bg-white border border-line rounded-[11px] p-4 mb-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-[12.5px] font-extrabold text-ink">{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
