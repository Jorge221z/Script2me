interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
}

export function AppShell({ children, variant = 'header' }: AppShellProps) {
    return <div className="flex min-h-screen w-full flex-col">{children}</div>;
}
