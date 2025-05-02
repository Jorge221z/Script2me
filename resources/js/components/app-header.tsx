import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu, Search, BookType, Github, Home, BrainCircuit, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from 'react-i18next';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const user = auth?.user || { name: 'User', avatar: '', email: '' };
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();

    // Botones principales (antes en sidebar)
    const mainNavItems = [
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

    // Botones de footer (antes en sidebar)
    const footerNavItems = [
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
        {
            title: theme === 'light' ? t('Dark') : t('Light'),
            href: '#',
            icon: theme === 'light' ? Moon : Sun,
            onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                toggleTheme();
            },
        },
    ];

    return (
        <>
            <div className="border-sidebar-border/80 border-b bg-neutral-900 text-neutral-100">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px] text-white">
                                    {/* Solo el icono de menú hamburguesa */}
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-neutral-900 text-neutral-100 flex h-full w-64 flex-col items-stretch justify-between">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <div className="flex items-center gap-2">
                                        <AppLogo className="h-8 w-10 bg-transparent p-0 m-0" />
                                        <span className="text-lg font-bold tracking-tight">Script2me</span>
                                    </div>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {footerNavItems.map((item) =>
                                                item.href === '#' ? (
                                                    <a
                                                        key={item.title}
                                                        href={item.href}
                                                        onClick={item.onClick}
                                                        className="flex items-center space-x-2 font-medium"
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </a>
                                                ) : item.href.startsWith('http') ? (
                                                    <a
                                                        key={item.title}
                                                        href={item.href}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-2 font-medium"
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </a>
                                                ) : (
                                                    <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo y título usando AppLogo, sin fondo y mismo tamaño que en la sidebar */}
                    <Link href="/dashboard" prefetch className="flex items-center gap-1 mr-4 group">
                        <AppLogo className="h-16 w-9 bg-transparent p-0 m-0" />
                        <span className="text-2xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors">Script2me</span>
                    </Link>

                    {/* Botones principales (antes en sidebar) */}
                    <nav className="ml-2 flex items-center gap-2">
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400",
                                    page.url === item.href ? "bg-neutral-800 text-emerald-400" : "text-neutral-100"
                                )}
                                prefetch
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        {/* Botones de footer (antes en sidebar) */}
                        {footerNavItems.map((item) =>
                            item.href === '#' ? (
                                <a
                                    key={item.title}
                                    href={item.href}
                                    onClick={item.onClick}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400 text-neutral-100"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.title}</span>
                                </a>
                            ) : item.href.startsWith('http') ? (
                                <a
                                    key={item.title}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400 text-neutral-100"
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.title}</span>
                                </a>
                            ) : (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400 text-neutral-100"
                                    prefetch
                                >
                                    <item.icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.title}</span>
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b bg-neutral-900 text-neutral-400">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-400 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
