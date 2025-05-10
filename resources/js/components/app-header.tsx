import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, BookType, Github, Home, BrainCircuit, Moon, Sun, Globe, Pickaxe, Radar } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import { useLanguage } from '@/contexts/language-context';

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

// Selector de idioma simplificado
function LanguageSelector() {
    const { currentLanguage, changeLanguage, isChangingLanguage } = useLanguage();
    const { t } = useTranslation();

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        if (newLang === currentLanguage || isChangingLanguage) return;
        
        try {
            await changeLanguage(newLang);
        } catch (error) {
            console.error("Error al cambiar el idioma:", error);
            // Error silencioso para el usuario
        }
    };

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Español' },
    ];

    return (
        <div className="relative flex items-center ml-2">
            <span
                className={cn(
                    "inline-flex items-center justify-center rounded-full p-1 mr-1 border shadow-sm",
                    isChangingLanguage 
                        ? "animate-pulse bg-amber-100 border-amber-300" 
                        : "bg-gray-100 border-emerald-200/40"
                )}
                style={{ boxShadow: '0 1px 6px 0 rgba(16,185,129,0.06)' }}
            >
                <Globe 
                    className="h-4 w-4 text-gray-950" 
                    aria-hidden="true" 
                />
            </span>
            <select
                value={currentLanguage}
                onChange={handleChange}
                disabled={isChangingLanguage}
                className={cn(
                    "appearance-none rounded-md px-3 py-1 pr-7 font-semibold transition-all cursor-pointer",
                    "bg-neutral-800 text-neutral-100 border border-neutral-700",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-400",
                    "hover:border-emerald-400",
                    "shadow-sm",
                    isChangingLanguage && "opacity-70"
                )}
                style={{ minWidth: 90 }}
                aria-label={t('language.select')}
            >
                {languages.map((l) => (
                    <option
                        key={l.code}
                        value={l.code}
                        className="bg-neutral-800 text-neutral-100"
                    >
                        {l.label}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">&#9662;</span>
        </div>
    );
}

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
            title: 'Home',
            href: '/landing',
            icon: Home,
        },
        {
            title: 'Prompt Builder',
            href: '/dashboard',
            icon: Pickaxe,
        },
        {
            title: 'AI Refactor',
            href: '/refactor-dashboard',
            icon: BrainCircuit,
        },
        {
            title: 'AI Scanner',
            href: '/security-dashboard',
            icon: Radar,
        }
    ];

    // Botones de footer (antes en sidebar)
    const footerNavItems = [
        {
            key: 'theme',
            title: theme === 'light' ? 'Dark' : 'Light',
            href: '#',
            icon: theme === 'light' ? Moon : Sun,
            onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                toggleTheme();
            },
        },
        {
            key: 'terms',
            title: '',
            href: '/terms',
            icon: BookType,
        },
        {
            key: 'github',
            title: '',
            href: 'https://github.com/Jorge221z/script2me.git',
            icon: Github,
        },
    ];

    return (
        <>
            <div className="border-sidebar-border/80 border-b bg-neutral-900 text-neutral-100">
                <div className="mx-auto flex h-16 items-center px-2 sm:px-4 md:max-w-8xl">
                    {/* Mobile: Logo a la izquierda, menú hamburguesa a la derecha */}
                    <div className="flex md:hidden w-full items-center justify-between">
                        {/* Logo visible en móvil, alineado a la izquierda, con margen izquierdo */}
                        <Link href="/dashboard" prefetch className="flex items-center gap-0 group flex-shrink-0 ml-2">
                            <AppLogo className="h-12 w-12 bg-transparent p-0 m-0" />
                            <span className="text-xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors -ml-1">Script2me</span>
                        </Link>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="mr-1 h-[44px] text-white border border-neutral-700 rounded-md flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 hover:text-emerald-400 transition-all"
                                    aria-label="Abrir menú de navegación principal"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="text-sm font-medium">Menú</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="bg-neutral-900 text-neutral-100 flex h-full w-72 flex-col items-stretch justify-between border-l border-neutral-700">
                                <SheetHeader className="flex justify-between text-left border-b border-neutral-800 pb-4">
                                    <div className="flex items-center gap-2">
                                        <AppLogo className="h-8 w-10 bg-transparent p-0 m-0" />
                                        <span className="text-lg font-bold tracking-tight">Script2me</span>
                                    </div>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-6 p-4 pt-6 overflow-y-auto">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-2">
                                            <h3 className="text-xs uppercase text-neutral-500 font-semibold mb-2">Navegación</h3>
                                            {mainNavItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className={cn(
                                                        "flex items-center space-x-2 font-medium py-2 px-3 rounded-md transition-colors",
                                                        page.url === item.href ? "bg-neutral-800 text-emerald-400" : "hover:bg-neutral-800"
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="flex flex-col space-y-2 mt-8">
                                            <h3 className="text-xs uppercase text-neutral-500 font-semibold mb-2">Enlaces</h3>
                                            {footerNavItems.map((item) =>
                                                item.href === '#' ? (
                                                    <a
                                                        key={item.key}
                                                        href={item.href}
                                                        onClick={item.onClick}
                                                        className="flex items-center space-x-2 font-medium py-2 px-3 rounded-md hover:bg-neutral-800 transition-colors"
                                                    >
                                                        <Icon iconNode={item.icon} className={item.title === '' ? "h-5 w-5 mx-auto" : "h-5 w-5"} />
                                                        {item.title && <span>{item.title}</span>}
                                                    </a>
                                                ) : item.href.startsWith('http') ? (
                                                    item.icon === Github ? (
                                                        // GitHub: icono a la izquierda, texto "Repositorio" a la derecha SOLO en sidebar móvil
                                                        <a
                                                            key="github"
                                                            href={item.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center space-x-2 font-medium py-2 px-3 rounded-md hover:bg-neutral-800 transition-colors"
                                                        >
                                                            <Icon iconNode={item.icon} className="h-5 w-5" />
                                                            <span>GitHub</span>
                                                        </a>
                                                    ) : (
                                                        <a
                                                            key={item.key}
                                                            href={item.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center space-x-2 font-medium py-2 px-3 rounded-md hover:bg-neutral-800 transition-colors"
                                                        >
                                                            <Icon iconNode={item.icon} className={item.title === '' ? "h-5 w-5 mx-auto" : "h-5 w-5"} />
                                                            {item.title && <span>{item.title}</span>}
                                                        </a>
                                                    )
                                                ) : (
                                                    <Link
                                                        key={item.key}
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center space-x-2 font-medium py-2 px-3 rounded-md transition-colors",
                                                            page.url === item.href ? "bg-neutral-800 text-emerald-400" : "hover:bg-neutral-800"
                                                        )}
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                )
                                            )}
                                            <LanguageSelector />
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo y título en md+ */}
                    <Link href="/dashboard" prefetch className="flex items-center gap-0 mr-2 sm:mr-4 group flex-shrink-0 hidden md:flex">
                        <AppLogo className="h-12 w-12 bg-transparent p-0 m-0" />
                        <span className="text-xl sm:text-2xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors -ml-1">Script2me</span>
                    </Link>

                    {/* Separador flexible para empujar los botones a la derecha en md+ */}
                    <div className="hidden md:block ml-18" />

                    {/* Botones principales (sidebar) - visibles en md+ */}
                    <nav className="ml-1 sm:ml-2 hidden md:flex items-center gap-2 flex-wrap">
                        {mainNavItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    page.url === item.href
                                        ? "bg-gray-100 hover:bg-gray-300 dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400"
                                        : "dark:text-neutral-100 hover:bg-white dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-emerald-400"
                                )}
                                prefetch
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="hidden lg:inline">{item.title}</span>
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
                            {footerNavItems.map((item) => {
                                const isActive = page.url === item.href;
                                const baseClasses = "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors";
                                const activeClasses = "bg-gray-100 text-emerald-400 dark:bg-neutral-800 dark:text-emerald-400";
                                const inactiveClasses = "dark:text-neutral-100 dark:hover:text-emerald-400 hover:text-gray-950 dark:hover:bg-neutral-800 hover:bg-gray-100";
                                const className = cn(
                                    baseClasses,
                                    isActive ? activeClasses : inactiveClasses
                                );
                                if (item.href === '#') {
                                    return (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            onClick={item.onClick}
                                            className={className + (item.title === '' ? ' flex items-center justify-center px-2 py-2' : '')}
                                        >
                                            <item.icon className="h-4 w-4 mx-auto" />
                                            {item.title && <span className="hidden sm:inline">{item.title}</span>}
                                        </a>
                                    );
                                } else if (item.href.startsWith('http')) {
                                    return (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={className + (item.title === '' ? ' flex items-center justify-center px-2 py-2' : '')}
                                        >
                                            <item.icon className="h-4 w-4 mx-auto" />
                                            {item.title && <span className="hidden sm:inline">{item.title}</span>}
                                        </a>
                                    );
                                } else {
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className={className}
                                            prefetch
                                        >
                                            <item.icon className="h-4 w-4 mx-auto" />
                                            {item.title && <span className="hidden sm:inline">{item.title}</span>}
                                        </Link>
                                    );
                                }
                            })}
                        </div>
                        {/* Footer solo iconos en móvil (xs/sm) - ocultos */}
                        {/* <div className="flex md:hidden items-center gap-1">
                            ...eliminado en móvil...
                        </div> */}
                        {/* Footer solo iconos en tablet (md+) pero no en lg+ */}
                        <div className="hidden md:flex lg:hidden items-center gap-1">
                            {footerNavItems.map((item) => {
                                const isActive = page.url === item.href;
                                const baseClasses = "flex items-center justify-center px-2 py-2 rounded-md text-sm font-medium transition-colors";
                                const activeClasses = "bg-gray-100 text-emerald-400 dark:bg-neutral-800 dark:text-emerald-400";
                                const inactiveClasses = "dark:text-neutral-100 hover:text-emerald-400 dark:hover:bg-neutral-800 hover:bg-gray-100";
                                const className = cn(
                                    baseClasses,
                                    isActive ? activeClasses : inactiveClasses
                                );
                                if (item.href === '#') {
                                    return (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            onClick={item.onClick}
                                            className={className}
                                            style={{ minWidth: 0 }}
                                        >
                                            <item.icon className="h-5 w-5 mx-auto" />
                                        </a>
                                    );
                                } else if (item.href.startsWith('http')) {
                                    return (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={className}
                                            style={{ minWidth: 0 }}
                                        >
                                            <item.icon className="h-5 w-5 mx-auto" />
                                        </a>
                                    );
                                } else {
                                    return (
                                        <Link
                                            key={item.key}
                                            href={item.href}
                                            className={className}
                                            style={{ minWidth: 0 }}
                                            prefetch
                                        >
                                            <item.icon className="h-5 w-5 mx-auto" />
                                        </Link>
                                    );
                                }
                            })}
                        </div>
                        <div className="hidden md:flex">
                            <LanguageSelector />
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
