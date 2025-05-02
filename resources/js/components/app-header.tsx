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
                <div className="mx-auto flex h-16 items-center px-2 sm:px-4 md:max-w-7xl">
                    {/* Mobile: Menú hamburguesa a la izquierda, logo a la derecha */}
                    <div className="flex md:hidden w-full items-center justify-between">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-1 h-[44px] w-[44px] text-white border border-neutral-700 rounded-md flex items-center justify-center"
                                    aria-label="Abrir menú de navegación principal"
                                >
                                    <Menu className="h-7 w-7" />
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
                        {/* Logo visible en móvil, alineado a la derecha, con margen derecho */}
                        <Link href="/dashboard" prefetch className="flex items-center gap-0 group flex-shrink-0 mr-2">
                            <AppLogo className="h-12 w-12 bg-transparent p-0 m-0" />
                            <span className="text-xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors -ml-1">Script2me</span>
                        </Link>
                    </div>

                    {/* Logo y título en md+ */}
                    <Link href="/dashboard" prefetch className="flex items-center gap-0 mr-2 sm:mr-4 group flex-shrink-0 hidden md:flex">
                        <AppLogo className="h-12 w-12 bg-transparent p-0 m-0" />
                        <span className="text-xl sm:text-2xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors -ml-1">Script2me</span>
                    </Link>

                    {/* Botones principales (sidebar) - visibles en md+ */}
                    <nav className="ml-1 sm:ml-2 hidden md:flex items-center gap-2 flex-wrap">
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400",
                                    page.url === item.href ? "bg-neutral-800 text-emerald-400" : "text-neutral-100"
                                )}
                                prefetch
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="hidden md:inline">{item.title}</span>
                            </Link>
                        ))}
                    </nav>
                    {/* Botones principales solo iconos en móvil (xs/sm) - ocultos */}
                    {/* <nav className="ml-1 flex md:hidden items-center gap-1 flex-wrap">
                        ...eliminado en móvil...
                    </nav> */}

                    {/* Botones de footer (sidebar) - visibles en lg+ */}
                    <div className="ml-auto flex items-center gap-1 sm:gap-2 flex-wrap">
                        <div className="hidden lg:flex items-center gap-1 sm:gap-2">
                            {footerNavItems.map((item) =>
                                item.href === '#' ? (
                                    <a
                                        key={item.title}
                                        href={item.href}
                                        onClick={item.onClick}
                                        className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400 text-neutral-100"
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
                                        className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400 text-neutral-100"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{item.title}</span>
                                    </a>
                                ) : (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400 text-neutral-100"
                                        prefetch
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{item.title}</span>
                                    </Link>
                                )
                            )}
                        </div>
                        {/* Footer solo iconos en móvil (xs/sm) - ocultos */}
                        {/* <div className="flex md:hidden items-center gap-1">
                            ...eliminado en móvil...
                        </div> */}
                        {/* Footer solo iconos en tablet (md+) pero no en lg+ */}
                        <div className="hidden md:flex lg:hidden items-center gap-1">
                            {footerNavItems.map((item) =>
                                item.href === '#' ? (
                                    <a
                                        key={item.title}
                                        href={item.href}
                                        onClick={item.onClick}
                                        className="flex items-center justify-center px-2 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400 text-neutral-100"
                                        style={{ minWidth: 0 }}
                                    >
                                        <item.icon className="h-5 w-5" />
                                    </a>
                                ) : item.href.startsWith('http') ? (
                                    <a
                                        key={item.title}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center px-2 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400 text-neutral-100"
                                        style={{ minWidth: 0 }}
                                    >
                                        <item.icon className="h-5 w-5" />
                                    </a>
                                ) : (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="flex items-center justify-center px-2 py-2 rounded-md text-sm font-medium transition-colors hover:bg-neutral-800 hover:text-emerald-400 text-neutral-100"
                                        style={{ minWidth: 0 }}
                                        prefetch
                                    >
                                        <item.icon className="h-5 w-5" />
                                    </Link>
                                )
                            )}
                        </div>
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
