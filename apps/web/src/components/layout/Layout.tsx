import { ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import adminDashboardService from '../../services/adminDashboardService';
import { api } from '../../services/api';
import { useAuth } from '../../store/auth';

// Module-level cache so we only fetch once per session
let cachedFacilityName: string | null = null;

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  const { role, permissions, setPermissions } = useAuth();
  const [facilityName, setFacilityName] = useState<string>(cachedFacilityName ?? '—');

  useEffect(() => {
    if (cachedFacilityName) return;
    adminDashboardService.getDashboard().then((data) => {
      cachedFacilityName = data.facilityName;
      setFacilityName(data.facilityName);
    }).catch(() => {});
  }, []);

  // Fetch permissions once for facility_admin users (super_admin sees everything)
  useEffect(() => {
    if (role !== 'facility_admin' || permissions !== null) return;
    api.get('/admin/settings/me').then((res) => {
      setPermissions(res.data.permissions as string[]);
    }).catch(() => {
      // If fetch fails, default to empty — backend enforces real security
      setPermissions([]);
    });
  }, [role, permissions, setPermissions]);

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
