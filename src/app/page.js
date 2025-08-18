'use client';

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MultiPanelChat from './components/MultiPanelChat';

export default function Home() {
  return (
    <div className="dark h-screen bg-background text-foreground flex overflow-hidden">
      <Sidebar />
      <MultiPanelChat />
    </div>
  );
}
