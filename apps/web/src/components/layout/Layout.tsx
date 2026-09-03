import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

type Props = {
  children: ReactNode;
  facility?: string;
};

export default function Layout({ children, facility }: Props) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar facility={facility} />
        <main className="flex-1 bg-paper p-[20px_22px] overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
