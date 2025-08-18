"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Settings, Edit2, Trash2, Check, X } from "lucide-react";
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
    SidebarMenuAction,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/components/auth/UserProfile";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";

export default function AppSidebar({ onSelectChat, activeChatId }) {
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true); // only for initial fetch
    const [editingChatId, setEditingChatId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const inputRef = useRef(null);
    const firstFetchRef = useRef(true);

    useEffect(() => {
        if (editingChatId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingChatId]);

    const fetchChats = async () => {
        try {
            if (firstFetchRef.current) setLoading(true); // only show loading placeholder first time
            const res = await fetch('/api/chats');
            if (res.ok) {
                const data = await res.json();
                setChats(data.chats || []);
                if (!activeChatId && data.chats && data.chats.length > 0) {
                    onSelectChat && onSelectChat(data.chats[0].id);
                }
            }
        } finally {
            if (firstFetchRef.current) {
                setLoading(false);
                firstFetchRef.current = false;
            }
        }
    };

    useEffect(() => { fetchChats(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, []);

    const createNewChat = async () => {
        const res = await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Chat' }) });
        if (res.ok) {
            const { id } = await res.json();
            onSelectChat && onSelectChat(id);
            setChats(prev => [{ id, title: 'New Chat' }, ...prev]);
            fetchChats();
        }
    };

    const renameChat = async (id, title) => {
        if (!title.trim()) return cancelEdit();
        await fetch(`/api/chats/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: title.trim() }) });
        setChats(prev => prev.map(c => c.id === id ? { ...c, title: title.trim() } : c));
        setEditingChatId(null);
        setEditTitle("");
    };

    const deleteChat = async (id) => {
        await fetch(`/api/chats/${id}`, { method: 'DELETE' });
        // Fetch updated list
        const res = await fetch('/api/chats');
        if (res.ok) {
            const data = await res.json();
            const list = data.chats || [];
            setChats(list);
            if (list.length === 0) {
                // Auto-create a new chat and select it
                const createRes = await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'New Chat' }) });
                if (createRes.ok) {
                    const { id: newId } = await createRes.json();
                    setChats([{ id: newId, title: 'New Chat' }]);
                    onSelectChat && onSelectChat(newId);
                }
            } else {
                // If deleted active chat, select first remaining
                if (activeChatId === id) {
                    onSelectChat && onSelectChat(list[0].id);
                }
            }
        } else {
            // Fallback refetch
            fetchChats();
        }
    };

    const startEdit = (chat) => { setEditingChatId(chat.id); setEditTitle(chat.title); };
    const cancelEdit = () => { setEditingChatId(null); setEditTitle(""); };
    const handleEditKey = (e, id) => { if (e.key === 'Enter') { e.preventDefault(); renameChat(id, editTitle); } else if (e.key === 'Escape') { cancelEdit(); } };

    const createNewChatButton = (
        <Button onClick={createNewChat} variant="outline" size="sm" className="w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Chat</span>
        </Button>
    );

    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                    </div>
                    <span className="font-semibold">AI Fiesta</span>
                </div>
                {createNewChatButton}
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <div className="flex items-center justify-between px-2">
                        <SidebarGroupLabel>Chats</SidebarGroupLabel>
                        <Button size="sm" variant="ghost" className="w-5 h-5 p-0" onClick={createNewChat}>
                            <Plus className="w-3 h-3" />
                        </Button>
                    </div>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {loading ? (
                                <div className="text-muted-foreground text-sm text-center py-8 px-2">Loading...</div>
                            ) : chats.length === 0 ? (
                                <div className="text-muted-foreground text-sm text-center py-8 px-2">No chats yet. Start typing to create one.</div>
                            ) : (
                                chats.map(chat => (
                                    <SidebarMenuItem key={chat.id} className="group">
                                        {editingChatId === chat.id ? (
                                            <div className="flex items-center gap-2 w-full p-2 border rounded-md bg-accent/20">
                                                <Input
                                                    ref={inputRef}
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    onKeyDown={(e) => handleEditKey(e, chat.id)}
                                                    onBlur={() => renameChat(chat.id, editTitle)}
                                                    className="flex-1 h-8 text-xs"
                                                    placeholder="Chat title"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onMouseDown={(e) => { e.preventDefault(); renameChat(chat.id, editTitle); }}
                                                    className="p-1 h-7 w-7"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onMouseDown={(e) => { e.preventDefault(); cancelEdit(); }}
                                                    className="p-1 h-7 w-7"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <SidebarMenuButton
                                                    isActive={activeChatId === chat.id}
                                                    onClick={() => onSelectChat && onSelectChat(chat.id)}
                                                    className="pr-14"
                                                >
                                                    <span className="truncate text-sm font-medium w-full text-left">{chat.title}</span>
                                                </SidebarMenuButton>
                                                <SidebarMenuAction
                                                    showOnHover
                                                    onClick={(e) => { e.stopPropagation(); startEdit(chat); }}
                                                    className="right-8"
                                                    aria-label="Rename chat"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </SidebarMenuAction>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <SidebarMenuAction
                                                            showOnHover
                                                            onClick={(e) => { e.stopPropagation(); }}
                                                            className="text-destructive"
                                                            aria-label="Delete chat"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </SidebarMenuAction>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This chat and all associated messages will be permanently deleted.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteChat(chat.id)}>Delete</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
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