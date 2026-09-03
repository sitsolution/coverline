import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';

const TABS = ['All', 'Pending Verification', 'Verified', 'Expired', 'Rejected'];

export default function DocumentVerification() {
  const [activeTab, setActiveTab] = useState('Pending Verification');

  return (
    <Layout>
      {/* Header */}
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-[2px]">Document Verification</h1>
      <p className="text-[11.5px] text-slate mb-4">7 documents awaiting review</p>

      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {/* Two-column layout */}
      <div className="grid gap-4" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* Left */}
        <Panel className="p-0 overflow-hidden">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Document Type</th>
                <th>Upload Date</th>
                <th>Expiry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">Dr. Riya Iyer</td>
                <td>Medical License</td>
                <td>10 Sep</td>
                <td>04 Mar 2028</td>
                <td><Badge label="Pending" variant="warning" /></td>
                <td className="text-[12px]">
                  <span className="text-navy-2 font-semibold cursor-pointer hover:underline">Review</span>
                </td>
              </tr>
              <tr>
                <td className="font-semibold">Dr. Farhan Ali</td>
                <td>BLS Certification</td>
                <td>9 Sep</td>
                <td>12 Jan 2027</td>
                <td><Badge label="Pending" variant="warning" /></td>
                <td className="text-[12px]">
                  <span className="text-navy-2 font-semibold cursor-pointer hover:underline">Review</span>
                </td>
              </tr>
              <tr>
                <td className="font-semibold">Dr. Karan Shah</td>
                <td>ACLS Certification</td>
                <td>8 Sep</td>
                <td>—</td>
                <td><Badge label="Rejected" variant="urgent" /></td>
                <td className="text-[12px]">
                  <span className="text-navy-2 font-semibold cursor-pointer hover:underline">Review</span>
                </td>
              </tr>
            </tbody>
          </table>
        </Panel>

        {/* Right */}
        <Panel title="Document Preview">
          <div className="h-[180px] bg-sky rounded-[10px] flex items-center justify-center text-[28px] text-navy-2 mb-3">
            📄
          </div>
          <p className="text-[11.5px] text-slate mb-[14px]">Medical_License_RiyaIyer.pdf · Dr. Riya Iyer</p>
          <div className="flex gap-2">
            <button className="flex-1 bg-sky text-navy text-[13px] font-bold px-4 py-[11px] rounded-[10px]">
              Verify
            </button>
            <button className="flex-1 bg-urgent-bg text-urgent text-[13px] font-bold px-4 py-[11px] rounded-[10px]">
              Reject
            </button>
          </div>
        </Panel>
      </div>
    </Layout>
  );
}
