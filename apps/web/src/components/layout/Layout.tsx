import { ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import adminDashboardService from '../../services/adminDashboardService';

// Module-level cache so we only fetch once per session
let cachedFacilityName: string | null = null;

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  const [facilityName, setFacilityName] = useState<string>(cachedFacilityName ?? '—');

  useEffect(() => {
    if (cachedFacilityName) return;
    adminDashboardService.getDashboard().then((data) => {
      cachedFacilityName = data.facilityName;
      setFacilityName(data.facilityName);
    }).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar facility={facilityName} />
        <main className="flex-1 bg-paper p-[20px_22px] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
