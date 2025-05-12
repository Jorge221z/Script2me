"use client"

import type React from "react"

import { Breadcrumbs } from "@/components/breadcrumbs"
import { Icon } from "@/components/icon"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { useInitials } from "@/hooks/use-initials"
import { cn } from "@/lib/utils"
import type { BreadcrumbItem, SharedData } from "@/types"
import { Link, usePage } from "@inertiajs/react"
import { Menu, BookType, Github, Home, BrainCircuit, Moon, Sun, Globe, Pickaxe, Radar } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { useTranslation } from "react-i18next"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AppLogo from "./app-logo"
import { useLanguage } from "@/contexts/language-context"

// Selector de idioma simplificado
function LanguageSelector() {
    const { currentLanguage, changeLanguage, isChangingLanguage } = useLanguage()
    const { t } = useTranslation()

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value
        if (newLang === currentLanguage || isChangingLanguage) return

        try {
            await changeLanguage(newLang)
        } catch (error) {
            console.error("Error al cambiar el idioma:", error)
            // Error silencioso para el usuario
        }
    }

    const languages = [
        { code: "en", label: "English" },
        { code: "es", label: "Español" },
    ]

    return (
        <div className="relative flex items-center ml-2">
            <span
                className={cn(
                    "inline-flex items-center justify-center rounded-full p-1 mr-1 border shadow-sm",
                    isChangingLanguage ? "animate-pulse bg-amber-100 border-amber-300" : "bg-gray-100 border-emerald-200/40",
                )}
                style={{ boxShadow: "0 1px 6px 0 rgba(16,185,129,0.06)" }}
            >
                <Globe className="h-4 w-4 text-gray-950" aria-hidden="true" />
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
                    isChangingLanguage && "opacity-70",
                )}
                style={{ minWidth: 90 }}
                aria-label={t("language.select")}
            >
                {languages.map((l) => (
                    <option key={l.code} value={l.code} className="bg-neutral-800 text-neutral-100">
                        {l.label}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 text-xs">
                &#9662;
            </span>
        </div>
    )
}

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[]
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>()
    const { auth } = page.props
    const getInitials = useInitials()
    const user = auth?.user || { name: "User", avatar: "", email: "" }
    const { theme, toggleTheme } = useTheme()
    const { t } = useTranslation()

    // Track the currently selected nav item
    const [selectedItem, setSelectedItem] = useState<string | null>(null)
    // Store refs to all nav items for measuring positions
    const navItemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map())
    // Track hover state for each item
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)

    // Botones principales (antes en sidebar)
    const mainNavItems = [
        {
            title: t("landing.home"),
            href: "/home",
            icon: Home,
        },
        {
            title: "Prompt Builder",
            href: "/dashboard",
            icon: Pickaxe,
        },
        {
            title: "AI Refactor",
            href: "/refactor-dashboard",
            icon: BrainCircuit,
        },
        {
            title: "AI Scanner",
            href: "/security-dashboard",
            icon: Radar,
        },
    ]

    // Botones de footer (antes en sidebar)
    const footerNavItems = [
        {
            key: "theme",
            title: theme === "light" ? t("theme.dark") : t("theme.light"),
            href: "#",
            icon: theme === "light" ? Moon : Sun,
            onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault()
                toggleTheme()
            },
        },
        {
            key: "terms",
            title: "",
            href: "/terms",
            icon: BookType,
        },
        {
            key: "github",
            title: "",
            href: "https://github.com/Jorge221z/script2me.git",
            icon: Github,
        },
    ]

    // Initialize the selected item based on the current URL
    useEffect(() => {
        const currentItem = mainNavItems.find((item) => item.href === page.url)
        if (currentItem) {
            setSelectedItem(currentItem.href)
        }
    }, [page.url])

    // Get the dimensions and position of the selected nav item
    const getSelectedItemDimensions = () => {
        if (!selectedItem || !navItemRefs.current.has(selectedItem)) {
            return { width: 0, height: 0, left: 0, top: 0 }
        }

        const element = navItemRefs.current.get(selectedItem)
        if (!element) return { width: 0, height: 0, left: 0, top: 0 }

        const rect = element.getBoundingClientRect()
        const parentRect = element.parentElement?.getBoundingClientRect() || { left: 0, top: 0 }

        return {
            width: rect.width,
            height: rect.height,
            left: rect.left - parentRect.left,
            top: rect.top - parentRect.top,
        }
    }

    // Handle nav item click
    const handleNavItemClick = (href: string) => {
        if (href === selectedItem) return
        setSelectedItem(href)
    }

    return (
        <>
            <div className="border-sidebar-border/80 border-b bg-neutral-900 text-neutral-100">
                <div className="mx-auto flex h-16 items-center px-2 sm:px-4 md:max-w-8xl">
                    {/* Mobile: Logo a la izquierda, menú hamburguesa a la derecha */}
                    <div className="flex md:hidden w-full items-center justify-between">
                        {/* Logo visible en móvil, alineado a la izquierda, con margen izquierdo */}
                        <Link href="/home" prefetch className="flex items-center gap-0 group flex-shrink-0 ml-2">
                            <AppLogo className="h-12 w-12 bg-transparent p-0 m-0" />
                            <span className="text-xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors -ml-1">
                                Script2me
                            </span>
                        </Link>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="mr-1 h-[44px] text-white border border-neutral-700 rounded-md flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 hover:text-emerald-400 transition-all"
                                    aria-label="Abrir menú de navegación principal"
                                >
                                    <Menu className="h-5 w-5" />
                                    <span className="text-sm font-medium">{t("header.menu")}</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="right"
                                className="bg-neutral-900 text-neutral-100 flex h-full w-72 flex-col items-stretch justify-between border-l border-neutral-700"
                            >
                                <SheetHeader className="flex justify-between text-left border-b border-neutral-800 pb-4">
                                    <div className="flex items-center gap-2">
                                        <AppLogo className="h-8 w-10 bg-transparent p-0 m-0" />
                                        <span className="text-lg font-bold tracking-tight">Script2me</span>
                                    </div>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-6 p-4 pt-6 overflow-y-auto">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-2">
                                            <h3 className="text-xs uppercase text-neutral-500 font-semibold mb-2">
                                                {t("header.navigation")}
                                            </h3>
                                            <div className="relative flex flex-col space-y-3">
                                                {mainNavItems.map((item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center justify-start space-x-2 font-medium py-3 px-3 rounded-md transition-colors z-10 relative",
                                                            selectedItem === item.href ? "text-emerald-400" : "hover:text-emerald-300",
                                                        )}
                                                        onClick={() => handleNavItemClick(item.href)}
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                ))}
                                                {selectedItem && (
                                                    <motion.div
                                                        className="absolute left-0 right-0 rounded-md z-[-1]"
                                                        layoutId="mobile-nav-indicator"
                                                        initial={false}
                                                        animate={{
                                                            height: "48px",
                                                            width: "100%",
                                                            y: mainNavItems.findIndex((item) => item.href === selectedItem) * 56,
                                                            opacity: 1,
                                                        }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 400,
                                                            damping: 30,
                                                        }}
                                                    >
                                                        <div className="absolute inset-0 bg-neutral-800 rounded-md" />
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2 mt-8">
                                            <h3 className="text-xs uppercase text-neutral-500 font-semibold mb-2">{t("header.links")}</h3>
                                            {footerNavItems.map((item) =>
                                                item.href === "#" ? (
                                                    <a
                                                        key={item.key}
                                                        href={item.href}
                                                        onClick={item.onClick}
                                                        className="flex items-center space-x-2 font-medium py-2 px-3 rounded-md hover:bg-neutral-800 transition-colors"
                                                    >
                                                        <Icon iconNode={item.icon} className={item.title === "" ? "h-5 w-5 mx-auto" : "h-5 w-5"} />
                                                        {item.title && <span>{item.title}</span>}
                                                    </a>
                                                ) : item.href.startsWith("http") ? (
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
                                                            <span>{t("header.github")}</span>
                                                        </a>
                                                    ) : (
                                                        <a
                                                            key={item.key}
                                                            href={item.href}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center space-x-2 font-medium py-2 px-3 rounded-md hover:bg-neutral-800 transition-colors"
                                                        >
                                                            <Icon
                                                                iconNode={item.icon}
                                                                className={item.title === "" ? "h-5 w-5 mx-auto" : "h-5 w-5"}
                                                            />
                                                            {item.title && <span>{item.title}</span>}
                                                        </a>
                                                    )
                                                ) : item.icon === BookType ? (
                                                    // BookType: icono a la izquierda, texto "T&C" a la derecha SOLO en sidebar móvil
                                                    <Link
                                                        key={item.key}
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center space-x-2 font-medium py-2 px-3 rounded-md hover:bg-neutral-800 transition-colors",
                                                            page.url === item.href ? "bg-neutral-800 text-emerald-400" : ""
                                                        )}
                                                    >
                                                        <Icon iconNode={item.icon} className="h-5 w-5" />
                                                        <span>T&C</span>
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        key={item.key}
                                                        href={item.href}
                                                        className={cn(
                                                            "flex items-center space-x-2 font-medium py-2 px-3 rounded-md transition-colors",
                                                            page.url === item.href ? "bg-neutral-800 text-emerald-400" : "hover:bg-neutral-800",
                                                        )}
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        {item.title && <span>{item.title}</span>}
                                                    </Link>
                                                ),
                                            )}
                                            <LanguageSelector />
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo y título en md+ */}
                    <Link
                        href="/home"
                        prefetch
                        className="flex items-center gap-0 mr-2 sm:mr-4 group flex-shrink-0 hidden md:flex"
                    >
                        <AppLogo className="h-12 w-12 bg-transparent p-0 m-0" />
                        <span className="text-xl sm:text-2xl font-bold tracking-tight group-hover:text-emerald-400 transition-colors -ml-1">
                            Script2me
                        </span>
                    </Link>

                    {/* Separador flexible para empujar los botones a la derecha en md+ */}
                    <div className="hidden md:block ml-18" />

                    {/* Botones principales (sidebar) - visibles en md+ */}
                    <nav className="ml-1 sm:ml-2 hidden md:flex items-center gap-2 flex-wrap relative">
                        {/* Animated background indicator */}
                        {selectedItem && (
                            <motion.div
                                className="absolute rounded-md z-0 nav-indicator"
                                layoutId="desktop-nav-indicator"
                                initial={false}
                                animate={getSelectedItemDimensions()}
                                transition={{
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 30,
                                }}
                            >
                                <div className="absolute inset-0 bg-neutral-800 dark:bg-neutral-800 rounded-md" />
                                <div className="absolute inset-0 border border-emerald-500/20 rounded-md" />
                                <div className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-emerald-900/0 via-emerald-500/10 to-emerald-900/0 rounded-md" />

                                {/* Underline fijo que no cambia de tamaño durante la transición */}
                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 nav-underline" />
                            </motion.div>
                        )}

                        {/* Hover indicator */}
                        <AnimatePresence>
                            {hoveredItem && hoveredItem !== selectedItem && (
                                <motion.div
                                    className="absolute rounded-md z-[-1]"
                                    initial={{ opacity: 0 }}
                                    animate={{
                                        opacity: 1,
                                        ...(() => {
                                            const el = navItemRefs.current.get(hoveredItem)
                                            if (!el) return {}
                                            const rect = el.getBoundingClientRect()
                                            const parentRect = el.parentElement?.getBoundingClientRect() || { left: 0, top: 0 }
                                            return {
                                                width: rect.width,
                                                height: rect.height,
                                                left: rect.left - parentRect.left,
                                                top: rect.top - parentRect.top,
                                            }
                                        })(),
                                    }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="absolute inset-0 bg-neutral-800/30 dark:bg-neutral-700/20 rounded-md" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {mainNavItems.map((item) => (
                            <Link
                                key={item.title}
                                href={item.href}
                                ref={(el) => {
                                    if (el) navItemRefs.current.set(item.href, el)
                                }}
                                className={cn(
                                    "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors z-10 relative",
                                    selectedItem === item.href
                                        ? "text-emerald-400"
                                        : "dark:text-neutral-100 hover:text-emerald-300 dark:hover:text-emerald-300",
                                )}
                                onClick={() => handleNavItemClick(item.href)}
                                onMouseEnter={() => setHoveredItem(item.href)}
                                onMouseLeave={() => setHoveredItem(null)}
                                prefetch
                            >
                                <motion.div
                                    animate={selectedItem === item.href ? { scale: [1, 1.1, 1] } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <item.icon className="h-5 w-5" />
                                </motion.div>
                                <span className="hidden lg:inline">{item.title}</span>
                            </Link>
                        ))}
                    </nav>

                    {/* Botones de footer (sidebar) - visibles en lg+ */}
                    <div className="ml-auto flex items-center gap-1 sm:gap-2 flex-wrap">
                        <div className="hidden lg:flex items-center gap-1 sm:gap-2">
                            {footerNavItems.map((item) => {
                                const isActive = page.url === item.href
                                const baseClasses =
                                    "flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                const activeClasses = "bg-gray-100 text-emerald-400 dark:bg-neutral-800 dark:text-emerald-400"
                                const inactiveClasses =
                                    "dark:text-neutral-100 dark:hover:text-emerald-400 hover:text-gray-950 dark:hover:bg-neutral-800 hover:bg-gray-100"
                                const className = cn(baseClasses, isActive ? activeClasses : inactiveClasses)
                                if (item.href === "#") {
                                    return (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            onClick={item.onClick}
                                            className={className + (item.title === "" ? " flex items-center justify-center px-2 py-2" : "")}
                                        >
                                            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                                                <item.icon className="h-4 w-4 mx-auto" />
                                            </motion.div>
                                            {item.title && <span className="hidden sm:inline">{item.title}</span>}
                                        </a>
                                    )
                                } else if (item.href.startsWith("http")) {
                                    return (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={className + (item.title === "" ? " flex items-center justify-center px-2 py-2" : "")}
                                        >
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                                <item.icon className="h-4 w-4 mx-auto" />
                                            </motion.div>
                                            {item.title && <span className="hidden sm:inline">{item.title}</span>}
                                        </a>
                                    )
                                } else {
                                    return (
                                        <Link key={item.key} href={item.href} className={className} prefetch>
                                            <item.icon className="h-4 w-4 mx-auto" />
                                            {item.title && <span className="hidden sm:inline">{item.title}</span>}
                                        </Link>
                                    )
                                }
                            })}
                        </div>
                        {/* Footer solo iconos en tablet (md+) pero no en lg+ */}
                        <div className="hidden md:flex lg:hidden items-center gap-1">
                            {footerNavItems.map((item) => {
                                const isActive = page.url === item.href
                                const baseClasses =
                                    "flex items-center justify-center px-2 py-2 rounded-md text-sm font-medium transition-colors"
                                const activeClasses = "bg-gray-100 text-emerald-400 dark:bg-neutral-800 dark:text-emerald-400"
                                const inactiveClasses =
                                    "dark:text-neutral-100 hover:text-emerald-400 dark:hover:bg-neutral-800 hover:bg-gray-100"
                                const className = cn(baseClasses, isActive ? activeClasses : inactiveClasses)
                                if (item.href === "#") {
                                    return (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            onClick={item.onClick}
                                            className={className}
                                            style={{ minWidth: 0 }}
                                        >
                                            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}>
                                                <item.icon className="h-5 w-5 mx-auto" />
                                            </motion.div>
                                        </a>
                                    )
                                } else if (item.href.startsWith("http")) {
                                    return (
                                        <a
                                            key={item.key}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={className}
                                            style={{ minWidth: 0 }}
                                        >
                                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                                <item.icon className="h-5 w-5 mx-auto" />
                                            </motion.div>
                                        </a>
                                    )
                                } else {
                                    return (
                                        <Link key={item.key} href={item.href} className={className} style={{ minWidth: 0 }} prefetch>
                                            <item.icon className="h-5 w-5 mx-auto" />
                                        </Link>
                                    )
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
    )
}




