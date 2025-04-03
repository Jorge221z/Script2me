import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();

    // Función para prevenir la navegación para AI Refactor
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, title: string) => {
        if (title === 'AI Refactor (Coming soon)') {
            e.preventDefault();
        }
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Toolkit</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={item.href === page.url}
                            tooltip={{ children: item.title === 'AI Refactor (Coming soon)' ? 'Coming soon' : item.title }}
                            className={item.title === 'AI Refactor (Coming soon)' ? 'opacity-70 bg-red-400 hover:bg-red-400 cursor-not-allowed text-black' : ''}
                            aria-disabled={item.title === 'AI Refactor (Coming soon)' ? 'true' : 'false'}
                        >
                            <Link
                                href={item.href}
                                prefetch={item.title !== 'AI Refactor (Coming soon)'}
                                onClick={(e) => handleClick(e, item.title)}
                                className={item.title === 'AI Refactor (Coming soon)' ? 'pointer-events-none' : ''}
                            >
                                {item.icon && <item.icon className={item.title === 'AI Refactor (Coming soon)' ? 'text-red-500' : ''} />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
