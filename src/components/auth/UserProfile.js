'use client';

import { signOut } from '@/lib/auth-client';
import { useAuthSession } from '@/components/auth/SessionProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';

export function UserProfile() {
  const { session } = useAuthSession();

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  const initials = session.user.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="border-t pt-4 mt-4">
      <div className="flex items-center gap-3 p-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={session.user.image} alt={session.user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {session.user.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {session.user.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="h-8 w-8 p-0"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
