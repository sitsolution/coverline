interface Props {
  page: number;          // current page (1-based)
  total: number;         // total records
  pageSize: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, total, pageSize, onChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between mt-[14px] px-1">
      <span className="text-[11px] text-slate">
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-line text-[13px] text-slate hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
          title="Previous page"
        >
          ‹
        </button>

        {/* Page number pills */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | '...')[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
            acc.push(p);
            return acc;
          }, [])
          .map((p, idx) =>
            p === '...' ? (
              <span key={`ellipsis-${idx}`} className="text-[11px] text-slate px-1">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onChange(p as number)}
                className={`w-7 h-7 flex items-center justify-center rounded-[6px] text-[11.5px] font-semibold border transition-colors ${
                  p === page
                    ? 'bg-navy text-white border-navy'
                    : 'bg-white text-slate border-line hover:border-navy hover:text-navy'
                }`}
              >
                {p}
              </button>
            )
          )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-[6px] border border-line text-[13px] text-slate hover:border-navy hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
          title="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}
