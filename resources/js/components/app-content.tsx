import { SidebarInset } from '@/components/ui/sidebar';
import * as React from 'react';
import '../../css/app.css';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, ...props }: AppContentProps) {
    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{children}</SidebarInset>;
    }

    return (
        <main className="app-content mx-auto flex h-full w-full max-w-[250rem] flex-1 flex-col gap-4 rounded-xl" {...props}>
            {children}
        </main>
    );
}
