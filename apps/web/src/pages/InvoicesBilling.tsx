import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/layout/Layout';
import Badge from '../components/ui/Badge';
import KpiCard from '../components/ui/KpiCard';
import Panel from '../components/ui/Panel';
import TabNav from '../components/ui/TabNav';
import adminBillingService, { InvoiceRow, InvoiceListResponse } from '../services/adminBillingService';

const TABS = ['all', 'unpaid', 'paid', 'overdue'];
const TAB_LABELS: Record<string, string> = { all: 'All Invoices', unpaid: 'Unpaid', paid: 'Paid', overdue: 'Overdue' };

type BadgeVariant = 'success' | 'warning' | 'urgent' | 'neutral';

function statusVariant(status: string): BadgeVariant {
  if (status === 'paid') return 'success';
  if (status === 'unpaid') return 'warning';
  if (status === 'overdue') return 'urgent';
  return 'neutral';
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function deltaToneColor(tone: string): string {
  if (tone === 'positive') return '#1F8A5F';
  if (tone === 'negative') return '#C0392B';
  if (tone === 'warning') return '#C97A2B';
  return '#5C6B7A';
}

export default function InvoicesBilling() {
  const [activeTab, setActiveTab] = useState('all');
  const [result, setResult] = useState<InvoiceListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  const load = useCallback(async (tab: string) => {
    setLoading(true);
    try {
      const res = await adminBillingService.listInvoices(tab);
      setResult(res);
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(activeTab); }, [load, activeTab]);

  const handlePay = async (invoice: InvoiceRow) => {
    if (payingId) return;
    setPayingId(invoice.id);
    try {
      await adminBillingService.payInvoice(invoice.id);
      await load(activeTab);
    } catch {} finally {
      setPayingId(null);
    }
  };

  const tabLabels = TABS.map(t =>
    result?.counts[t] != null ? `${TAB_LABELS[t]} (${result.counts[t]})` : TAB_LABELS[t]
  );

  const paymentMethod = result?.paymentMethod;

  return (
    <Layout>
      <h1 className="font-display font-extrabold text-[16.5px] text-ink mb-4">Invoices &amp; Billing</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3 mb-[18px]">
        {loading
          ? Array(4).fill(null).map((_, i) => <KpiCard key={i} label="…" value="—" delta="" />)
          : (result?.kpis ?? []).map(k => (
              <KpiCard key={k.label} label={k.label} value={k.value} delta={k.delta} deltaColor={deltaToneColor(k.deltaTone)} />
            ))
        }
      </div>

      {paymentMethod && (
        <p className="text-[11.5px] text-slate mb-3">
          Payment method: {paymentMethod.label} ····{paymentMethod.last4}
        </p>
      )}

      <TabNav
        tabs={tabLabels}
        active={tabLabels[TABS.indexOf(activeTab)]}
        onChange={(label) => {
          const idx = tabLabels.indexOf(label);
          if (idx >= 0) setActiveTab(TABS[idx]);
        }}
      />

      <Panel>
        <div className="overflow-hidden rounded-[10px] border border-line">
          <table className="adm-table">
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
              {loading ? (
                <tr><td colSpan={6} className="text-center text-[12px] text-slate py-8">Loading…</td></tr>
              ) : (result?.items ?? []).length === 0 ? (
                <tr><td colSpan={6} className="text-center text-[12px] text-slate py-8">No invoices found.</td></tr>
              ) : (result?.items ?? []).map((inv) => (
                <tr key={inv.id}>
                  <td className="font-semibold">{inv.number}</td>
                  <td>{dateLabel(inv.issuedOn)}</td>
                  <td className="font-semibold">₹{inv.total.toLocaleString('en-IN')}</td>
                  <td><Badge label={inv.status.charAt(0).toUpperCase() + inv.status.slice(1)} variant={statusVariant(inv.status)} /></td>
                  <td>{dateLabel(inv.dueOn)}</td>
                  <td className="text-[12px]">
                    <span
                      className="text-navy-2 font-semibold cursor-pointer hover:underline"
                      onClick={() => adminBillingService.downloadInvoice(inv.id)}
                    >View</span>
                    {inv.status !== 'paid' && (
                      <>
                        {' · '}
                        <span
                          className="text-navy-2 font-semibold cursor-pointer hover:underline"
                          onClick={() => handlePay(inv)}
                        >
                          {payingId === inv.id ? 'Paying…' : 'Pay Now'}
                        </span>
                      </>
                    )}
                    {inv.status === 'paid' && (
                      <>
                        {' · '}
                        <span
                          className="text-navy-2 font-semibold cursor-pointer hover:underline"
                          onClick={() => adminBillingService.downloadInvoice(inv.id)}
                        >Download</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </Layout>
  );
}
