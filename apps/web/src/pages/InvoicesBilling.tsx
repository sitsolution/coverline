import { useState } from 'react';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import KpiCard from '../components/ui/KpiCard';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';

const TABS = ['All Invoices', 'Unpaid', 'Paid', 'Overdue'];

const INVOICES = [
  {
    id: 'INV-3381',
    date: '1 Sep',
    amount: '₹92,000',
    status: 'Unpaid',
    statusVariant: 'warning' as const,
    due: '30 Sep',
    actions: ['View', 'Pay Now'],
  },
  {
    id: 'INV-3370',
    date: '1 Aug',
    amount: '₹78,400',
    status: 'Paid',
    statusVariant: 'success' as const,
    due: '30 Aug',
    actions: ['View', 'Download'],
  },
  {
    id: 'INV-3355',
    date: '1 Jul',
    amount: '₹1,05,000',
    status: 'Overdue',
    statusVariant: 'urgent' as const,
    due: '30 Jul',
    actions: ['View', 'Pay Now'],
  },
];

export default function InvoicesBilling() {
  const [activeTab, setActiveTab] = useState('All Invoices');

  return (
    <Layout>
      {/* Header */}
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-4">Invoices &amp; Billing</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        <KpiCard label="Total Outstanding" value="₹1,84,200" delta="3 invoices" deltaColor="#C0392B" />
        <KpiCard label="Paid This Month" value="₹6,42,000" delta="12 invoices" />
        <KpiCard label="Next Payment Due" value="₹92,000" delta="Due 30 Sep" deltaColor="#C97A2B" />
        <KpiCard label="Payment Method" value="HDFC ····2291" delta="Primary" />
      </div>

      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <Panel>
        <div className="overflow-hidden rounded-[10px] border border-line"><table className="adm-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {INVOICES.map((inv) => (
              <tr key={inv.id}>
                <td className="font-semibold">{inv.id}</td>
                <td>{inv.date}</td>
                <td className="font-semibold">{inv.amount}</td>
                <td><Badge label={inv.status} variant={inv.statusVariant} /></td>
                <td>{inv.due}</td>
                <td className="text-[12px]">
                  {inv.actions.map((a, i) => (
                    <span key={a}>
                      {i > 0 && ' · '}
                      <span className="text-navy-2 font-semibold cursor-pointer hover:underline">{a}</span>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Panel>
    </Layout>
  );
}
