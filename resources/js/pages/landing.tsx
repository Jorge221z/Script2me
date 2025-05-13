"use client"

import AppLayout from "@/layouts/app-layout"
import { Head, Link } from "@inertiajs/react"
import type React from "react"
import { useEffect, useState, useRef } from "react"
import {
  Home,
  Pickaxe,
  BrainCircuit,
  Radar,
  Mail,
  ArrowRight,
  MenuIcon,
  XIcon,
  Rocket,
  ChevronDown,
  Github,
  User,
  Wrench,
} from "lucide-react"
import { motion } from "framer-motion"
import { useTranslation } from "react-i18next"

interface SectionInfo {
  id: string
  titleKey: string
  icon: React.ElementType
}

const APP_LAYOUT_HEADER_HEIGHT_VALUE = 64

const LandingPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>("hero")
  const [isPageNavSticky, setIsPageNavSticky] = useState<boolean>(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false)
  const [isContactHovered, setIsContactHovered] = useState(false)
  const { t } = useTranslation()

  const pageNavRef = useRef<HTMLElement>(null)

  const sections: SectionInfo[] = [
    { id: "hero", titleKey: t("landing.home"), icon: Home },
    { id: "features", titleKey: t("landing.toolkit"), icon: Wrench },
    { id: "our-story", titleKey: t("landing.ourStory"), icon: Rocket },
    { id: "contact", titleKey: t("landing.contact"), icon: Mail },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (pageNavRef.current) {
        setIsPageNavSticky(window.scrollY > pageNavRef.current.offsetTop - APP_LAYOUT_HEADER_HEIGHT_VALUE)
      }

      let currentSectionId = sections[0]?.id || "hero"
      for (const section of sections) {
        const element = document.getElementById(section.id)
        if (element) {
          const rect = element.getBoundingClientRect()
          const pageNavHeight = isPageNavSticky && pageNavRef.current ? pageNavRef.current.offsetHeight : 0
          const effectiveOffset = APP_LAYOUT_HEADER_HEIGHT_VALUE + pageNavHeight + 20

          if (rect.top <= effectiveOffset && rect.bottom >= effectiveOffset) {
            currentSectionId = section.id
            break
          }
        }
      }
      setActiveSection(currentSectionId)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isPageNavSticky])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    const pageNavHeight = pageNavRef.current?.offsetHeight || 0
    if (element) {
      const topPos = element.offsetTop - APP_LAYOUT_HEADER_HEIGHT_VALUE - (isPageNavSticky ? pageNavHeight : 0) - 10
      window.scrollTo({
        top: topPos,
        behavior: "smooth",
      })
    }
    setIsMobileMenuOpen(false)
  }

  const breadcrumbs = [{ title: "Landing", href: "/landing" }]

  const featureCards = [
    {
      id: "prompt-builder",
      icon: Pickaxe,
      titleKey: t("landing.features.promptBuilder.title"),
      descriptionKey: t("landing.features.promptBuilder.description"),
      href: "/dashboard",
      ctaKey: t("landing.features.promptBuilder.cta"),
      color: "emerald",
    },
    {
      id: "ai-refactor",
      icon: BrainCircuit,
      titleKey: t("landing.features.aiRefactor.title"),
      descriptionKey: t("landing.features.aiRefactor.description"),
      href: "/refactor-dashboard",
      ctaKey: t("landing.features.aiRefactor.cta"),
      color: "cyan",
    },
    {
      id: "ai-scanner",
      icon: Radar,
      titleKey: t("landing.features.aiScanner.title"),
      descriptionKey: t("landing.features.aiScanner.description"),
      href: "/security-dashboard",
      ctaKey: t("landing.features.aiScanner.cta"),
      color: "amber",
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={t("landing.pageTitle")} />

      <main className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
        <section
          id="hero"
          className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 dark:from-emerald-700 dark:via-teal-700 dark:to-sky-800 text-white py-28 md:py-40 flex items-center justify-center text-center overflow-hidden min-h-[calc(100vh-var(--app-header-height,64px)-var(--page-nav-height,56px))]"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex justify-center mb-8">
                <motion.div
                  className="relative flex items-center justify-center"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{ width: 140, height: 140 }}
                >
                  {/* Fondo animado gradiente tipo reloj girando */}
                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-logo-conic-gradient"
                    style={{
                      width: 180,
                      height: 180,
                      zIndex: 0,
                      borderRadius: "9999px",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    className="relative bg-gradient-to-r from-white via-slate-50 to-white dark:from-white dark:via-slate-100 dark:to-white p-0 rounded-full shadow-xl ring-4 ring-white/50 backdrop-blur-sm z-10 flex items-center justify-center"
                    style={{ width: 120, height: 120 }}
                  >
                    <motion.img
                      src="/images/logo.png"
                      alt={t("landing.logoAlt")}
                      className="h-24 w-24 object-contain drop-shadow-md"
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, 0],
                      }}
                      transition={{
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                        repeatDelay: 0.5,
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-300 to-white animate-gradient-x">
                  {t("landing.hero.title")}
                </span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-emerald-100 dark:text-sky-100 whitespace-pre-line"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                {t("landing.hero.subtitle")}
              </motion.p>

              <motion.div
                className="flex flex-col items-center space-y-4 sm:space-y-0 sm:flex-row sm:justify-center sm:space-x-4 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.button
                  onClick={() => scrollToSection("features")}
                  className="cursor-pointer relative bg-white text-neutral-800 dark:bg-white dark:text-neutral-800 font-semibold py-4 px-12 rounded-full shadow-lg text-xl inline-flex items-center group overflow-hidden isolate"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {/* Wider animated border */}
                  <div className="absolute inset-[-16px] rounded-full overflow-hidden z-0 pointer-events-none">
                    <div
                      className="absolute left-1/2 top-1/2"
                      style={{
                        width: "calc(100% + 32px)",
                        height: "calc(100% + 32px)",
                        transform: "translate(-50%, -50%)",
                        borderRadius: "9999px",
                        background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)",
                        animation: "spin 8s linear infinite",
                        opacity: 1,
                        display: "none",
                      }}
                    />
                  </div>

                  {/* Smoother animated background with fluid transitions (solo en hover) */}
                  <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                    <div
                      className="absolute inset-0 opacity-100 group-hover:block hidden animate-fluid-gradient"
                      style={{
                        background:
                          "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #22d3ee 75%, #f59e42 100%)",
                        backgroundSize: "400% 400%",
                        animation: "fluidGradient 8s ease-in-out infinite",
                      }}
                    />
                  </div>

                  {/* Pulsing rings solo en hover */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="absolute w-full h-full rounded-full bg-white/30 group-hover:block hidden"
                      style={{ animation: "pulseRing 2.5s ease-in-out infinite" }}
                    />
                    <div
                      className="absolute w-full h-full rounded-full bg-white/20 group-hover:block hidden"
                      style={{ animation: "pulseRing 2.5s ease-in-out infinite 0.6s" }}
                    />
                    <div
                      className="absolute w-full h-full rounded-full bg-white/10 group-hover:block hidden"
                      style={{ animation: "pulseRing 2.5s ease-in-out infinite 1.2s" }}
                    />
                  </div>

                  {/* Overlay for text contrast */}
                  <div className="absolute inset-[5px] bg-white/60 rounded-full z-10"></div>

                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }

                    @keyframes fluidGradient {
                      0% { background-position: 0% 0%; }
                      25% { background-position: 100% 0%; }
                      50% { background-position: 100% 100%; }
                      75% { background-position: 0% 100%; }
                      100% { background-position: 0% 0%; }
                    }

                    @keyframes moveParticle {
                      0% { transform: translateY(0) translateX(0); }
                      25% { transform: translateY(-10px) translateX(10px); }
                      50% { transform: translateY(-15px) translateX(-5px); }
                      75% { transform: translateY(-5px) translateX(-15px); }
                      100% { transform: translateY(0) translateX(0); }
                    }

                    @keyframes pulseRing {
                      0% { transform: scale(0.7); opacity: 0.3; }
                      50% { transform: scale(1); opacity: 0.1; }
                      100% { transform: scale(1.3); opacity: 0; }
                    }

                    .animate-spin-slow {
                      animation: spin 8s linear infinite;
                    }

                    .animate-fluid-gradient {
                      animation: fluidGradient 8s ease-in-out infinite;
                    }
                  `}</style>

                  {/* Button content with high contrast for readability */}
                  <span className="relative z-20 flex items-center transition-all duration-300">
                    <span className="group-hover:scale-105 transition-transform duration-300 bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-[#7928CA] group-hover:to-[#FF0080]">
                      {t("landing.hero.exploreButton")}
                    </span>
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 group-hover:text-[#FF0080] transition-all duration-300" />
                  </span>
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection("contact")}
                  className="cursor-pointer bg-transparent border-2 border-white text-white font-semibold py-4 px-6 rounded-full shadow-lg transform transition-all text-base
                    hover:bg-white/20 hover:backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-emerald-400/60 flex items-center justify-center relative overflow-hidden"
                  style={{
                    paddingRight: isContactHovered ? 25 : 24, // 25px ≈ pr-[6.25], 24px ≈ px-6
                    transition: "padding-right 0.45s cubic-bezier(0.4,0,0.2,1)",
                  }}
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setIsContactHovered(true)}
                  onMouseLeave={() => setIsContactHovered(false)}
                >
                  <span className="relative flex items-center w-full justify-center">
                    <motion.span
                      animate={isContactHovered ? { x: -8 } : { x: 0 }}
                      transition={{ type: "tween", duration: 0.45, ease: "easeInOut" }}
                      className="block"
                    >
                      {t("landing.hero.contactButton")}
                    </motion.span>
                    {isContactHovered && (
                      <motion.span
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ type: "tween", duration: 0.45, ease: "easeInOut" }}
                        className="flex items-center pointer-events-none ml-2"
                      >
                        <Mail className="h-5 w-5 text-emerald-200" />
                      </motion.span>
                    )}
                  </span>
                </motion.button>
              </motion.div>

              {/* Scroll Down indicator moved below buttons */}
              <motion.div
                className="text-white flex justify-center w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{
                  opacity: { delay: 1.5, duration: 1 },
                  y: { delay: 1.5, duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                }}
              >
                <button
                  onClick={() => scrollToSection("features")}
                  className="flex flex-col items-center"
                  aria-label={t("landing.hero.scrollAriaLabel")}
                >
                  <span className="text-sm font-medium mb-2">{t("landing.hero.scrollDown")}</span>
                  <ChevronDown className="h-6 w-6 animate-bounce" />
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <nav
          ref={pageNavRef}
          className={`bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md shadow-sm py-3 transition-all duration-300 ease-in-out w-full ${isPageNavSticky ? `sticky top-[${APP_LAYOUT_HEADER_HEIGHT_VALUE}px] z-40` : "relative z-40"}`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="hidden md:flex">
              <ul className="flex space-x-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out group relative ${
                        activeSection === section.id
                          ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                          : "text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                      }`}
                    >
                      <span className="flex items-center">
                        <section.icon className="h-4 w-4 mr-1.5" />
                        {section.titleKey}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden bg-white dark:bg-neutral-800 shadow-lg absolute w-full z-30 mt-1 rounded-b-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ul className="flex flex-col space-y-1 px-2 pt-2 pb-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`cursor-pointer flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ${
                        activeSection === section.id
                          ? "bg-emerald-500 text-white dark:bg-emerald-600"
                          : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                      }`}
                    >
                      <section.icon className="h-5 w-5 mr-2" />
                      {section.titleKey}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </nav>

        <section id="features" className="py-16 md:py-24 bg-[#d1d1d1] dark:bg-neutral-900">
          <div
            className="
              container mx-auto px-4 sm:px-6 lg:px-8
              max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl 2xl:max-w-[1600px]
            "
          >
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-neutral-900 dark:text-white">
                {t("landing.features.title")}
              </h2>
              <p className="text-center text-neutral-600 dark:text-neutral-400 mb-12 md:mb-16 max-w-2xl mx-auto text-lg whitespace-pre-line">
                {t("landing.features.subtitle")}
              </p>
            </motion.div>

            <div
              className="
                grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12
                max-w-5xl md:max-w-6xl lg:max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto
              "
            >
              {featureCards.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3 + index * 0.1,
                  }}
                  className={`
                    ${index === 2 ? "md:col-span-2 lg:col-span-1 md:max-w-md md:mx-auto" : ""}
                    ${
                      feature.id === "prompt-builder"
                        ? "relative overflow-hidden px-6 py-12 min-h-[340px] rounded-2xl shadow-xl border border-[#00bb89]/30 dark:border-[#00bb89]/40 bg-gradient-to-br from-[#d1fff7] via-[#aaf4de] to-[#8eeecb] dark:from-[#013a2c] dark:via-[#015e46] dark:to-[#00bb89]/50 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:border-[#00bb89]/60 hover:scale-[1.03] group"
                        : feature.id === "ai-refactor"
                          ? "relative overflow-hidden px-6 py-12 min-h-[340px] rounded-2xl shadow-xl border border-cyan-300/30 dark:border-cyan-700/40 bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 dark:from-[#0c4a6e] dark:via-[#0c2d4d] dark:to-[#0f172a] backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:border-cyan-400/60 hover:scale-[1.03] group"
                          : feature.id === "ai-scanner"
                            ? "relative overflow-hidden px-6 py-12 min-h-[340px] rounded-2xl shadow-xl border border-amber-200/30 dark:border-amber-800/40 bg-gradient-to-br from-amber-100 via-orange-100 to-pink-100 dark:from-amber-900 dark:via-orange-950 dark:to-pink-900 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:border-amber-400/60 hover:scale-[1.03] group"
                            : "bg-neutral-50 dark:bg-neutral-800 px-6 py-12 min-h-[340px] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    }
                  `}
                  style={{
                    maxWidth: "100%",
                    margin: "0 auto",
                    minHeight: "340px",
                    overflow: "hidden",
                  }}
                >
                  {/* Fondo animado sutil para Prompt Builder */}
                  {feature.id === "prompt-builder" && (
                    <>
                      {/* Light mode background - keep original */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-30 animate-pulse dark:hidden"
                        style={{
                          background: "radial-gradient(circle at 70% 30%, #00bb89 0%, #d1fff7 60%, transparent 90%)",
                        }}
                      />
                      {/* Dark mode background - new darker version */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-30 animate-pulse hidden dark:block"
                        style={{
                          background: "radial-gradient(circle at 70% 30%, #00bb89 0%, #015e46 60%, transparent 90%)",
                        }}
                      />
                    </>
                  )}

                  {/* Fondo animado sutil para AI Refactor */}
                  {feature.id === "ai-refactor" && (
                    <>
                      {/* Light mode background */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-20 animate-pulse dark:hidden"
                        style={{
                          background: "radial-gradient(circle at 70% 30%, #0284c7 0%, #e0f7ff 60%, transparent 90%)",
                        }}
                      />
                      {/* Dark mode background */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-15 animate-pulse hidden dark:block"
                        style={{
                          background: "radial-gradient(circle at 70% 30%, #0284c7 0%, #051e2d 60%, transparent 90%)",
                        }}
                      />
                    </>
                  )}

                  {/* Fondo animado sutil para AI Scanner */}
                  {feature.id === "ai-scanner" && (
                    <>
                      {/* Light mode background */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-20 animate-pulse dark:hidden"
                        style={{
                          background: "radial-gradient(circle at 70% 30%, #f59e0b 0%, #fff7ed 60%, transparent 90%)",
                        }}
                      />
                      {/* Dark mode background */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-15 animate-pulse hidden dark:block"
                        style={{
                          background: "radial-gradient(circle at 70% 30%, #f59e0b 0%, #451a03 60%, transparent 90%)",
                        }}
                      />
                    </>
                  )}

                  <div
                    className={
                      feature.id === "prompt-builder"
                        ? "relative z-10 inline-flex items-center justify-center p-4 rounded-full shadow-lg ring-2 ring-[#00bb89]/30 dark:ring-[#00bb89]/40 mb-4 group bg-white/80 dark:bg-[linear-gradient(135deg,#015e46_0%,#013a2c_100%)]"
                        : feature.id === "ai-refactor"
                          ? "relative z-10 inline-flex items-center justify-center p-4 rounded-full bg-white/80 dark:bg-[linear-gradient(135deg,#0c2d4d_0%,#0c4a6e_100%)] shadow-lg ring-2 ring-cyan-300/30 dark:ring-cyan-700/40 mb-4 group-hover:ring-4 transition-all"
                          : feature.id === "ai-scanner"
                            ? "relative z-10 inline-flex items-center justify-center p-4 rounded-full bg-white/80 dark:bg-[linear-gradient(135deg,#451a03_0%,#f59e0b_60%)] shadow-lg ring-2 ring-amber-300/30 dark:ring-amber-700/40 mb-4 group-hover:ring-4 transition-all"
                            : `inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4`
                    }
                  >
                    <feature.icon
                      size={32}
                      className={
                        feature.id === "prompt-builder"
                          ? "text-[#00bb89] drop-shadow-[0_0_8px_rgba(0,187,137,0.35)] group-hover:scale-110 transition-transform"
                          : feature.id === "ai-refactor"
                            ? "text-cyan-500 dark:text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.35)] group-hover:scale-110 transition-transform"
                            : feature.id === "ai-scanner"
                              ? "text-amber-500 dark:text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.35)] group-hover:scale-110 transition-transform"
                              : "text-emerald-600 dark:text-emerald-300"
                      }
                    />
                  </div>
                  <h3
                    className={
                      feature.id === "prompt-builder"
                        ? "text-2xl md:text-3xl font-extrabold mb-2 text-[#007f5f] dark:text-emerald-200 drop-shadow dark:drop-shadow-lg"
                        : feature.id === "ai-refactor"
                          ? "text-2xl md:text-3xl font-extrabold mb-2 bg-gradient-to-r from-cyan-500 via-blue-400 to-fuchsia-400 dark:from-cyan-300 dark:via-blue-400 dark:to-fuchsia-400 bg-clip-text text-transparent drop-shadow dark:drop-shadow-lg animate-gradient-x"
                          : feature.id === "ai-scanner"
                            ? "text-2xl md:text-3xl font-extrabold mb-2 bg-gradient-to-r from-amber-500 via-pink-400 to-fuchsia-400 dark:from-amber-300 dark:via-pink-400 dark:to-fuchsia-400 bg-clip-text text-transparent drop-shadow dark:drop-shadow-lg animate-gradient-x"
                            : "text-xl font-semibold mb-2 text-neutral-900 dark:text-white"
                    }
                  >
                    {feature.titleKey}
                  </h3>
                  <p
                    className={
                      feature.id === "prompt-builder"
                        ? "mb-4 text-neutral-700 dark:text-neutral-200 font-medium whitespace-pre-line"
                        : feature.id === "ai-refactor"
                          ? "mb-4 text-neutral-700 dark:text-neutral-200 font-medium whitespace-pre-line"
                          : feature.id === "ai-scanner"
                            ? "mb-4 text-neutral-700 dark:text-neutral-200 font-medium whitespace-pre-line"
                            : "text-neutral-600 dark:text-neutral-300 mb-4"
                    }
                  >
                    {feature.descriptionKey}
                  </p>
                  <Link
                    href={feature.href}
                    className={
                      feature.id === "prompt-builder"
                        ? "inline-flex items-center font-semibold text-[#00bb89] hover:text-emerald-300 underline underline-offset-4 decoration-2 decoration-[#00bb89] hover:decoration-[#008f6b] transition-all group"
                        : feature.id === "ai-refactor"
                          ? "inline-flex items-center font-semibold text-cyan-500 hover:text-blue-500 underline underline-offset-4 decoration-2 decoration-cyan-400 hover:decoration-blue-400 transition-all group"
                          : feature.id === "ai-scanner"
                            ? "inline-flex items-center font-semibold text-amber-500 hover:text-pink-500 underline underline-offset-4 decoration-2 decoration-amber-400 hover:decoration-pink-400 transition-all group"
                            : `inline-flex items-center text-${feature.color}-600 dark:text-${feature.color}-400 hover:text-${feature.color}-700 dark:hover:text-${feature.color}-300 font-medium transition-colors`
                    }
                  >
                    {feature.ctaKey}
                    <span className="ml-1">
                      <ArrowRight
                        className={`h-4 w-4 ${feature.id === "prompt-builder" || feature.id === "ai-refactor" || feature.id === "ai-scanner" ? "group-hover:translate-x-1 transition-transform" : ""}`}
                      />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="our-story" className="py-16 md:py-24 bg-[#d1d1d1] dark:bg-neutral-800/50 m-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur-xl opacity-30" />
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 p-8 md:p-12">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl" />

                    <div className="relative">
                      <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 mb-6">
                        <Rocket className="h-6 w-6" />
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
                        {t("landing.story.title")}
                      </h2>
                      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                        <p>{t("landing.story.paragraph1")}</p>
                        <p>{t("landing.story.paragraph2")}</p>
                        <p>{t("landing.story.paragraph3")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="relative"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 shadow-2xl">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -mt-20 -mr-20" />
                  <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -mb-20 -ml-20" />

                  <div className="relative z-10 p-8 md:p-12">
                    <div className="text-center md:text-left">
                      <div className="flex justify-center md:justify-start mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 blur-lg opacity-70" />
                          <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full">
                            <User className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
                        {t("landing.behindProject.title")}
                      </h3>

                      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                        <p className="leading-relaxed">{t("landing.behindProject.paragraph1")}</p>

                        <p className="leading-relaxed">{t("landing.behindProject.paragraph2")}</p>

                        <div className="mt-6">
                          <h4 className="text-lg font-semibold mb-3 text-emerald-700 dark:text-emerald-400">
                            {t("landing.behindProject.techStack")}
                          </h4>
                          <p className="mb-3">{t("landing.behindProject.developedWith")}</p>
                          <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {["Laravel", "React", "Tailwind CSS", "Inertia.js", "MySQL"].map((tech) => (
                              <span
                                key={tech}
                                className="px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                          {/* AI powered by Gemini - inline, bigger icon */}
                          <div className="flex flex-wrap items-center justify-center md:justify-start mt-6 gap-6">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-emerald-700 dark:text-emerald-300 text-base mr-0">
                                {t("landing.behindProject.poweredBy")}
                              </span>
                              <img
                                src="/images/gemini.svg"
                                alt="Gemini"
                                className="h-8 w-auto align-middle mb-1.5"
                                style={{ display: "inline-block" }}
                              />
                            </div>
                            
                            <div className="flex items-center gap-2 ml-6">
                              <span className="font-medium text-emerald-700 dark:text-emerald-300 text-base mr-0">
                                {t("landing.behindProject.deployedOn")}
                              </span>
                              <img
                                src="/images/digitalocean.svg"
                                alt="Digital Ocean"
                                className="h-8 w-auto align-middle"
                                style={{ display: "inline-block" }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-6 border-t border-emerald-200/50 dark:border-emerald-800/30">
                        <a
                          href="https://github.com/Jorge221z/Script2me"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-emerald-700 dark:text-emerald-300 hover:text-emerald-500 dark:hover:text-emerald-200 font-medium transition-colors"
                        >
                          <Github className="h-5 w-5 mr-2" />
                          {t("landing.behindProject.viewOnGithub")}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-24 md:py-32 relative overflow-hidden">
          {/* Simplified dark background */}
          <div className="absolute inset-0 bg-neutral-900" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              className="max-w-3xl mx-auto text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-600/20 backdrop-blur-md mb-6">
                <Mail className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">{t("landing.contact.title")}</h2>
              <p className="text-xl mb-10 text-neutral-300">{t("landing.contact.subtitle")}</p>

              <motion.a
                href="mailto:jorgemunozcast12@gmail.com"
                className="inline-flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 font-semibold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t("landing.contact.buttonText")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.a>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-300 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-400 py-12 m-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>
            © {new Date().getFullYear()} Script2me. {t("landing.footer.rights")}
          </p>
        </div>
      </footer>
    </AppLayout>
  )
}

export default LandingPage


