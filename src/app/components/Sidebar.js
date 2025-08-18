"use client";

import { useState } from "react";
import { Plus, Settings } from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/auth/UserProfile";

export default function AppSidebar() {
    const [chats, setChats] = useState([]);

    const createNewChat = () => {
        const newChat = {
            id: Date.now(),
            title: "New Chat",
            timestamp: new Date(),
        };
        setChats([newChat, ...chats]);
    };

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                    </div>
                    <span className="font-semibold">AI Fiesta</span>
                </div>

                <Button
                    onClick={createNewChat}
                    className="w-full justify-start gap-2"
                    variant="secondary"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm">New Chat</span>
                </Button>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <div className="flex items-center justify-between px-2">
                        <SidebarGroupLabel>Projects</SidebarGroupLabel>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="w-5 h-5 p-0"
                        >
                            <Plus className="w-3 h-3" />
                        </Button>
                    </div>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chats.length === 0 ? (
                                <div className="text-muted-foreground text-sm text-center py-8 px-2">
                                    No chats yet
                                </div>
                            ) : (
                                chats.map((chat) => (
                                    <SidebarMenuItem key={chat.id}>
                                        <SidebarMenuButton className="flex flex-col items-start p-3 h-auto">
                                            <div className="text-sm font-medium truncate w-full">
                                                {chat.title}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {chat.timestamp.toLocaleDateString()}
                                            </div>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="w-full justify-start gap-2">
                            <Settings className="w-4 h-4" />
                            <span className="text-sm">Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <UserProfile />
            </SidebarFooter>
        </Sidebar>
    );
}
