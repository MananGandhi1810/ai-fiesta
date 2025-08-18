'use client';

import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Sidebar from './Sidebar';
import MultiPanelChatWrapper from './MultiPanelChatWrapper';

export default function ClientLayout({ children }) {
  const [activeChatId, setActiveChatId] = useState(null);

  const ensureChat = async () => {
    if (activeChatId) return activeChatId;
    const res = await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Chat' }) });
    if (res.ok) { const { id } = await res.json(); setActiveChatId(id); return id; }
    return null;
  };

  return (
    <SidebarProvider>
      <div className="dark h-screen bg-background text-foreground flex overflow-hidden">
        <Sidebar onSelectChat={setActiveChatId} activeChatId={activeChatId} />
        <main className="flex-1 flex flex-col overflow-hidden">
          <MultiPanelChatWrapper activeChatId={activeChatId} ensureChat={ensureChat} />
        </main>
      </div>
    </SidebarProvider>
  );
}
