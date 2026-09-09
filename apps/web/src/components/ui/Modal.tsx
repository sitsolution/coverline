import { useEffect } from 'react';

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function Modal({
  title,
  message,
  confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  const confirmCls = confirmVariant === 'danger'
    ? 'bg-urgent-bg text-urgent border border-urgent'
    : 'bg-navy text-white';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-[14px] shadow-xl w-full max-w-[360px] mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-extrabold text-[15px] text-ink mb-2">{title}</h2>
        <p className="text-[12px] text-slate leading-relaxed mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-line text-slate text-[12.5px] font-semibold px-4 py-[10px] rounded-[10px] hover:bg-paper disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 text-[12.5px] font-bold px-4 py-[10px] rounded-[10px] disabled:opacity-60 ${confirmCls}`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
