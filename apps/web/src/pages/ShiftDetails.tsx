import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';

export default function ShiftDetails() {
  return (
    <Layout>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-[2px]">
            <h1 className="font-display font-extrabold text-[16.5px] text-ink">ER Night Cover</h1>
            <Badge label="Open" variant="urgent" />
          </div>
          <p className="text-[11.5px] text-slate">#SH-2291 · Kothrud, Pune · Today, 8 PM – 8 AM</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="border-[1.5px] border-navy text-navy text-[11.5px] font-bold px-3 py-[7px] rounded-[8px] bg-transparent">
            Duplicate
          </button>
          <button className="bg-urgent-bg text-urgent text-[11.5px] font-bold px-3 py-[7px] rounded-[8px]">
            Cancel Shift
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Left */}
        <div>
          <Panel title="Applicants">
            <div className="overflow-hidden rounded-[10px] border border-line"><table className="adm-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialty</th>
                  <th>Rating</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-semibold">Dr. Ananya Rao</td>
                  <td>Emergency Med.</td>
                  <td>4.8★</td>
                  <td className="text-slate">2h ago</td>
                  <td className="text-[12px]">
                    <span className="text-navy-2 font-semibold cursor-pointer hover:underline">Profile</span>
                    {' · '}
                    <span className="text-navy-2 font-semibold cursor-pointer hover:underline">Accept</span>
                  </td>
                </tr>
                <tr>
                  <td className="font-semibold">Dr. Karan Shah</td>
                  <td>Emergency Med.</td>
                  <td>4.5★</td>
                  <td className="text-slate">5h ago</td>
                  <td className="text-[12px]">
                    <span className="text-navy-2 font-semibold cursor-pointer hover:underline">Profile</span>
                    {' · '}
                    <span className="text-navy-2 font-semibold cursor-pointer hover:underline">Accept</span>
                  </td>
                </tr>
              </tbody>
            </table></div>
          </Panel>

          <Panel title="Shift Timeline">
            {[
              { text: 'Created — Sep 10, 9:02 AM' },
              { text: 'Published — Sep 10, 9:05 AM' },
              { text: '2 applications received — Sep 12' },
              { text: 'Awaiting assignment' },
            ].map((item) => (
              <div
                key={item.text}
                className="text-[11.5px] pl-3 ml-1 py-[6px] border-l-2 border-sky-2 text-slate"
              >
                {item.text}
              </div>
            ))}
          </Panel>
        </div>

        {/* Right */}
        <div>
          <Panel title="Assigned Staff Member">
            <p className="text-center text-slate text-[11.5px] py-4">No staff member assigned yet</p>
            <button className="w-full bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px]">
              Assign from Applicants
            </button>
          </Panel>

          <Panel title="Shift Details">
            {[
              'Specialty: Emergency Medicine',
              'Duration: 12 hours',
              'Pay Rate: ₹9,500',
              'Requirements: BLS, 2+ yrs ER',
            ].map((row) => (
              <div key={row} className="text-[11.5px] text-slate py-[5px] border-b border-line last:border-0">
                {row}
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </Layout>
  );
}
