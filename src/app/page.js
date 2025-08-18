'use client';

import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from './components/Sidebar';
import MultiPanelChat from './components/MultiPanelChat';

export default function Home() {
  return (
    <SidebarProvider>
      <div className="dark h-screen bg-background text-foreground flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <MultiPanelChat />
        </main>
      </div>
    </SidebarProvider>
  );
}
