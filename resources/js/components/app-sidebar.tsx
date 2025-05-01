import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { useTheme } from '@/hooks/use-theme';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Github, LayoutGrid, Moon, Sun, Home, BookType, BrainCircuit } from 'lucide-react';
import AppLogo from './app-logo';
import { useTranslation } from 'react-i18next';

export function AppSidebar() {
    const { theme, toggleTheme } = useTheme();
    const { state } = useSidebar(); // Obtener el estado de la sidebar
    const { t } = useTranslation(); // Inicializar traducción

    // Handler para el evento onClick
    const handleThemeToggle = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        toggleTheme();
    };

    // Creamos los ítems de la barra lateral incluyendo el toggle de tema
    const mainNavItems: NavItem[] = [
        {
            title: t('Home'),
            href: '/dashboard',
            icon: Home,
        },
        {
            title: t('AI Refactor'),
            href: '/refactor-dashboard',
            icon: BrainCircuit,
        }
    ];

    const footerNavItems: NavItem[] = [
        {
            title: t('Terms and Conditions'),
            href: '/terms',
            icon: BookType,
        },
        {
            title: t('Repository'),
            href: 'https://github.com/Jorge221z/script2me.git',
            icon: Github,
        },
        /*{
            title: t('Documentation'),
            href: 'https://laravel.com/docs/starter-kits',
            icon: BookOpen,
        },*/
        {
            title: theme === 'light' ? t('Dark') : t('Light'),
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
                            size="xl"
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
