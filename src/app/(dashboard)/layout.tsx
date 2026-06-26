import Sidebar from '@/components/layout/Sidebar';
import { AppProvider } from '@/context/AppContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="app-layout">
        <Sidebar />
        <main className="app-main">
          {children}
        </main>
      </div>
    </AppProvider>
  );
}
