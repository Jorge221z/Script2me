import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';

export function UserInfo({ user, showEmail = false, ...props }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    // Proporcionar un usuario predeterminado cuando es null
    const defaultUser = {
        name: "Usuario",
        email: "usuario@ejemplo.com",
        // Añade cualquier otra propiedad que se esté utilizando
    };

    // Usar el usuario proporcionado o el predeterminado si es null
    const safeUser = user || defaultUser;

    return (
        <div {...props}>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={safeUser.avatar} alt={safeUser.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(safeUser.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{safeUser.name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{safeUser.email}</span>}
            </div>
        </div>
    );
}
