'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from './Sidebar';

export default function ClientLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="dark h-screen bg-background text-foreground flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
