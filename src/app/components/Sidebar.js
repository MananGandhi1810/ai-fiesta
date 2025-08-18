'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Settings, Zap } from 'lucide-react';

export default function Sidebar() {
  const [chats, setChats] = useState([]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: 'New Chat',
      timestamp: new Date(),
    };
    setChats([newChat, ...chats]);
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-semibold text-sidebar-foreground">AI Fiesta</span>
        </div>
        
        <Button 
          onClick={createNewChat}
          className="w-full justify-start gap-2"
          variant="secondary"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Chat</span>
        </Button>
      </div>

      {/* Projects Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Projects</span>
            <Button size="sm" variant="ghost" className="w-5 h-5 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Chat History */}
          <ScrollArea className="h-[400px]">
            {chats.length === 0 ? (
              <div className="text-muted-foreground text-sm text-center py-8">
                No chats yet
              </div>
            ) : (
              <div className="space-y-1">
                {chats.map((chat) => (
                  <Card key={chat.id} className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="p-2">
                      <div className="text-sm text-foreground truncate">{chat.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {chat.timestamp.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Card className="bg-destructive/10 border-destructive/20 mb-3">
          <CardContent className="p-3">
            <div className="text-destructive text-sm font-medium mb-1">Free Plan</div>
            <div className="text-destructive/80 text-xs mb-2">Message limit reached</div>
            <div className="w-full bg-destructive/20 rounded-full h-1 mb-2">
              <div className="bg-destructive h-1 rounded-full w-full"></div>
            </div>
            <div className="text-destructive/80 text-xs">Upgrade for unlimited messages</div>
          </CardContent>
        </Card>
        
        <Button className="w-full justify-start gap-2 mb-3" variant="default">
          <Zap className="w-4 h-4" />
          <span className="text-sm">Upgrade Plan</span>
        </Button>

        <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
}
