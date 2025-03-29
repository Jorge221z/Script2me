import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useTheme } from '@/hooks/use-theme';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Moon, Sun, Home } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Home',
        href: '/dashboard',
        icon: Home,
    },
];

export function AppSidebar() {
    const { theme, toggleTheme } = useTheme();
    const { state } = useSidebar(); // Obtener el estado de la sidebar

    // Handler para el evento onClick
    const handleThemeToggle = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        toggleTheme();
    };

    // Creamos los ítems de la barra lateral incluyendo el toggle de tema
    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/Jorge221z/script2me.git',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits',
            icon: BookOpen,
        },
        {
            title: theme === 'light' ? 'Dark' : 'Light',
            href: '#',
            icon: theme === 'light' ? Moon : Sun,
            onClick: handleThemeToggle,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="side bg-neutral-900 text-neutral-100 rounded-tr-md rounded-br-md">
            <SidebarHeader className='p-2'>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                        >
                            <Link href="/dashboard" prefetch className={state === 'collapsed' ? 'mt-8 flex justify-center' : ''}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <div className={state === 'collapsed' ? 'mt-8' : 'mt-4'}>
                    <NavMain items={mainNavItems} />
                </div>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
