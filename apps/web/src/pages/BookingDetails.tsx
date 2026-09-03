import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';

export default function BookingDetails() {
  return (
    <Layout>
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-[2px]">
          <h1 className="font-display font-extrabold text-[16.5px] text-ink">Booking #BK-8821</h1>
          <Badge label="Confirmed" variant="success" />
        </div>
        <p className="text-[11.5px] text-slate">ER Night Cover · Sep 14, 8 PM–8 AM · Kothrud, Pune</p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Left */}
        <div>
          <Panel title="Timeline">
            {[
              { text: 'Shift created — Sep 8', done: true },
              { text: 'Doctor applied — Sep 10', done: true },
              { text: 'Booking confirmed — Sep 12', done: true },
              { text: 'Shift completed — pending', done: false },
              { text: 'Payment processed — pending', done: false },
            ].map((item) => (
              <div
                key={item.text}
                className={`text-[11.5px] pl-3 ml-1 py-[6px] border-l-2 ${
                  item.done ? 'border-success text-ink' : 'border-line text-slate-2'
                }`}
              >
                {item.text}
              </div>
            ))}
          </Panel>

          <Panel title="Communication Log">
            {[
              {
                initials: 'AR',
                message: 'Confirmed availability for the night shift',
                sub: 'Dr. Ananya Rao · Sep 12, 6:40 PM',
              },
              {
                initials: 'PM',
                message: 'Sent parking & entry instructions',
                sub: 'Admin · Sep 13, 9:10 AM',
              },
            ].map((log) => (
              <div key={log.sub} className="flex gap-[10px] items-start py-[11px] border-b border-line last:border-0">
                <div className="w-9 h-9 rounded-full bg-sky flex items-center justify-center font-extrabold text-[12px] text-navy flex-shrink-0">
                  {log.initials}
                </div>
                <div>
                  <p className="text-[12px] text-ink font-medium">{log.message}</p>
                  <p className="text-[11px] text-slate mt-[2px]">{log.sub}</p>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        {/* Right */}
        <div>
          <Panel title="Doctor">
            <div className="flex gap-[10px] items-center">
              <div className="w-9 h-9 rounded-full bg-sky flex items-center justify-center font-extrabold text-[12px] text-navy flex-shrink-0">
                AR
              </div>
              <div>
                <p className="font-bold text-[12.5px] text-ink">Dr. Ananya Rao</p>
                <p className="text-[11px] text-slate">Emergency Med. · 4.8★</p>
              </div>
            </div>
          </Panel>

          <Panel title="Actions">
            <button className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2">
              Contact Doctor
            </button>
            <button className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px] mb-2">
              Mark as Completed
            </button>
            <button className="w-full bg-urgent-bg text-urgent text-[13px] font-bold px-4 py-[11px] rounded-[10px]">
              Cancel Booking
            </button>
          </Panel>
        </div>
      </div>
    </Layout>
  );
}
