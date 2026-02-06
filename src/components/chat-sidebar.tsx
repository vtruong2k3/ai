'use client';

import { useState } from 'react';
import { useChatStore } from '@/store/chat.store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    MessageSquarePlus,
    MessageSquare,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './user-menu';

interface ChatSidebarProps {
    onNewChat: () => void;
    isMobileOpen?: boolean;
    onMobileToggle?: (open: boolean) => void;
}

export function ChatSidebar({ onNewChat, isMobileOpen = false, onMobileToggle }: ChatSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { sessions, currentSessionId, setCurrentSession, deleteSession } = useChatStore();

    const handleNewChat = () => {
        onNewChat();
    };

    const handleSelectChat = (id: string) => {
        setCurrentSession(id);
    };

    const handleDeleteChat = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('Xóa đoạn chat này?')) {
            deleteSession(id);
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hôm nay';
        if (days === 1) return 'Hôm qua';
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <>
            {/* Mobile backdrop overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => onMobileToggle?.(false)}
                />
            )}

            <div
                className={cn(
                    'relative h-full border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-300 flex flex-col',
                    // Desktop: collapsible sidebar
                    'lg:relative',
                    isCollapsed ? 'lg:w-16' : 'lg:w-56 xl:w-64',
                    // Mobile: fixed drawer
                    'fixed inset-y-0 left-0 z-50 w-64',
                    'lg:translate-x-0',
                    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Desktop toggle button - hidden on mobile */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:block absolute -right-3 top-4 z-50 rounded-full border border-slate-200 bg-white p-1 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </button>

                {!isCollapsed ? (
                    <>
                        {/* Header with Branding */}
                        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                                    <MessageSquarePlus className="text-white w-5 h-5" />
                                </div>
                                <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                    VuTruong Chat
                                </h1>
                            </div>
                            <Button
                                onClick={handleNewChat}
                                className="w-full gap-2 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                                <span>Chat mới</span>
                            </Button>
                        </div>

                        {/* Chat list */}
                        <ScrollArea className="flex-1 p-2">
                            {sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <MessageSquare className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-700" />
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Chưa có đoạn chat nào
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {sessions.map((session) => (
                                        <div
                                            key={session.id}
                                            onClick={() => handleSelectChat(session.id)}
                                            className={cn(
                                                'group relative cursor-pointer rounded-lg border p-3 transition-all hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20',
                                                currentSessionId === session.id
                                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20'
                                                    : 'border-slate-200 dark:border-slate-800'
                                            )}
                                        >
                                            <div className="relative pr-8 w-full">
                                                <div className="overflow-hidden w-[140px]">
                                                    <h3 className="truncate text-sm font-medium text-slate-900 dark:text-slate-100 block">
                                                        {session.title}
                                                    </h3>
                                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                        {formatDate(session.updatedAt)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => handleDeleteChat(e, session.id)}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {/* Footer with UserMenu */}
                        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                            <UserMenu side="top" align="start" showName={true} />
                        </div>
                    </>
                ) : (
                    // Collapsed sidebar
                    <div className="flex h-full flex-col items-center gap-4 py-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-2">
                            <MessageSquarePlus className="text-white w-5 h-5" />
                        </div>
                        <Button
                            onClick={handleNewChat}
                            size="icon"
                            className="h-10 w-10 bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                        >
                            <MessageSquarePlus className="h-5 w-5" />
                        </Button>
                        <div className="mt-auto">
                            <UserMenu side="right" align="end" />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
