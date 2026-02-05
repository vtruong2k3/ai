'use client';

import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface UserMenuProps {
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    showName?: boolean;
}

export function UserMenu({ side = 'bottom', align = 'end', showName = false }: UserMenuProps) {
    const { data: session, status } = useSession();
    const router = useRouter();

    if (status === 'loading') {
        return (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        );
    }

    if (!session?.user) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/login')}
                className="ml-auto"
            >
                Đăng nhập
            </Button>
        );
    }

    const { user } = session;
    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "relative rounded-full transition-all duration-300",
                        showName ? "w-full h-auto flex items-center justify-start gap-3 px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" : "h-10 w-10"
                    )}
                >
                    <Avatar className="h-10 w-10 border border-slate-200 dark:border-slate-700">
                        <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                        <AvatarFallback className="bg-purple-600 text-white font-medium">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {showName && (
                        <div className="flex flex-col items-start overflow-hidden text-left">
                            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100 max-w-[140px]">
                                {user?.name}
                            </span>
                            <span className="truncate text-xs text-slate-500 dark:text-slate-400 max-w-[140px]">
                                {user?.email}
                            </span>
                        </div>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" side={side} align={align} forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
