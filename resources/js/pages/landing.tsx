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
  Sparkles,
  Rocket,
  ChevronDown,
  Github,
  User,
} from "lucide-react"
import { motion } from "framer-motion"

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

  const pageNavRef = useRef<HTMLElement>(null)

  const sections: SectionInfo[] = [
    { id: "hero", titleKey: "Home", icon: Home },
    { id: "features", titleKey: "Toolkit", icon: Sparkles },
    { id: "our-story", titleKey: "Our Story", icon: Rocket },
    { id: "contact", titleKey: "Contact", icon: Mail },
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
      titleKey: "Prompt Builder",
      descriptionKey:
        "Analiza y transforma tu código en prompts listos para LLMs. Carga scripts, genera entradas estructuradas para asistentes inteligentes en un solo clic. Open source, gratis y sin registro.",
      href: "/dashboard",
      ctaKey: "Try Prompt Builder",
      color: "emerald",
    },
    {
      id: "ai-refactor",
      icon: BrainCircuit,
      titleKey: "AI Refactor",
      descriptionKey:
        "Analiza y transforma automáticamente tus scripts para mejorar su rendimiento, estructura y mantenibilidad. Refactorización inteligente con comprensión contextual, con un solo clic. Ideal para flujos de trabajo modernos y desarrollo escalable. Todo gracias a Google Gemini.",
      href: "/refactor-dashboard",
      ctaKey: "Try it Now",
      color: "cyan",
    },
    {
      id: "ai-scanner",
      icon: Radar,
      titleKey: "AI Security Scanner",
      descriptionKey:
        "Analiza tu código en profundidad con la API de Google Gemini. Busqueda de vulnerabilidades y de patrones inseguros. Recibe recomendaciones precisas para fortalecer la seguridad y mitigar riesgos potenciales.",
      href: "/security-dashboard",
      ctaKey: "Scan your code Now",
      color: "amber",
    },
  ]

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Script2me - AI Tools for Developers" />

      <main className="bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
        <section
          id="hero"
          className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 dark:from-emerald-700 dark:via-teal-700 dark:to-sky-800 text-white py-28 md:py-40 flex items-center justify-center text-center overflow-hidden min-h-[calc(100vh-var(--app-header-height,64px)-var(--page-nav-height,56px))]"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-full h-full">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white/10 backdrop-blur-3xl"
                  style={{
                    width: Math.random() * 300 + 50,
                    height: Math.random() * 300 + 50,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0.1, scale: 0.8 }}
                  animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [0.8, 1.2, 0.8],
                    x: [0, Math.random() * 50 - 25, 0],
                    y: [0, Math.random() * 50 - 25, 0],
                  }}
                  transition={{
                    duration: Math.random() * 10 + 15,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex justify-center mb-8">
                <motion.div
                  className="relative"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-sky-400 blur-xl opacity-70 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-emerald-500 to-teal-500 p-5 rounded-full">
                    <Sparkles className="h-12 w-12 text-white" />
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
                  Supercharge your development with AI
                </span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-emerald-100 dark:text-sky-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Build, refactor, and secure your code using <br/> Script2me’s modular AI toolkit.
              </motion.p>

              <motion.div
                className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.button
                  onClick={() => scrollToSection("features")}
                  className="bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-white dark:text-emerald-700 dark:hover:bg-emerald-50 font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-lg inline-flex items-center group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Toolkit
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.button
                  onClick={() => scrollToSection("contact")}
                  className="bg-transparent hover:bg-white/20 border-2 border-white text-white font-semibold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Us
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
                  aria-label="Scroll to features"
                >
                  <span className="text-sm font-medium mb-2">Scroll Down</span>
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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-in-out group relative ${activeSection === section.id
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
                      className={`flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ${activeSection === section.id
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-neutral-900 dark:text-white">
                Our Toolkit
              </h2>
              <p className="text-center text-neutral-600 dark:text-neutral-400 mb-12 md:mb-16 max-w-2xl mx-auto text-lg">
                Discover how Script2me can transform your development workflow <br /> with AI-powered tools.
              </p>
            </motion.div>

            <div
              className="
                grid grid-cols-1 md:grid-cols-3
                gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-12
                max-w-5xl md:max-w-6xl lg:max-w-7xl xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto
              "
            >
              {featureCards.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={
                    feature.id === "prompt-builder"
                      ? "relative overflow-hidden px-6 py-12 min-h-[340px] rounded-2xl shadow-xl border border-[#00bb89]/30 dark:border-[#00bb89]/40 bg-gradient-to-br from-[#d1fff7] via-[#aaf4de] to-[#8eeecb] dark:from-[#013a2c] dark:via-[#015e46] dark:to-[#00bb89]/50 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:border-[#00bb89]/60 hover:scale-[1.03] group"
                      : feature.id === "ai-refactor"
                        ? "relative overflow-hidden px-6 py-12 min-h-[340px] rounded-2xl shadow-xl border border-cyan-300/30 dark:border-cyan-700/40 bg-gradient-to-br from-cyan-100 via-sky-100 to-blue-100 dark:from-[#0c4a6e] dark:via-[#0c2d4d] dark:to-[#0f172a] backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:border-cyan-400/60 hover:scale-[1.03] group"
                        : feature.id === "ai-scanner"
                          ? "relative overflow-hidden px-6 py-12 min-h-[340px] rounded-2xl shadow-xl border border-amber-200/30 dark:border-amber-800/40 bg-gradient-to-br from-amber-100 via-orange-100 to-pink-100 dark:from-amber-900 dark:via-orange-950 dark:to-pink-900 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:border-amber-400/60 hover:scale-[1.03] group"
                          : "bg-neutral-50 dark:bg-neutral-800 px-6 py-12 min-h-[340px] rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  }
                  style={{
                    minWidth: "340px",
                    maxWidth: "480px",
                    margin: "0 auto",
                  }}
                >
                  {/* Fondo animado sutil para Prompt Builder */}
                  {feature.id === "prompt-builder" && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-30 animate-pulse"
                      style={{
                        background: "radial-gradient(circle at 70% 30%, #00bb89 0%, #d1fff7 60%, transparent 90%)",
                      }}
                    />
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
                        ? "relative z-10 inline-flex items-center justify-center p-4 rounded-full bg-white/80 dark:bg-[#026e52]/80 shadow-lg ring-2 ring-[#00bb89]/30 dark:ring-[#00bb89]/40 mb-4 group-hover:ring-4 transition-all"
                        : feature.id === "ai-refactor"
                          ? "relative z-10 inline-flex items-center justify-center p-4 rounded-full bg-white/80 dark:bg-cyan-900/80 shadow-lg ring-2 ring-cyan-300/30 dark:ring-cyan-700/40 mb-4 group-hover:ring-4 transition-all"
                          : feature.id === "ai-scanner"
                            ? "relative z-10 inline-flex items-center justify-center p-4 rounded-full bg-white/80 dark:bg-amber-900/80 shadow-lg ring-2 ring-amber-300/30 dark:ring-amber-700/40 mb-4 group-hover:ring-4 transition-all"
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
                        ? "mb-4 text-neutral-700 dark:text-neutral-200 font-medium"
                        : feature.id === "ai-refactor"
                          ? "mb-4 text-neutral-700 dark:text-neutral-200 font-medium"
                          : feature.id === "ai-scanner"
                            ? "mb-4 text-neutral-700 dark:text-neutral-200 font-medium"
                            : "text-neutral-600 dark:text-neutral-300 mb-4"
                    }
                  >
                    {feature.id === "prompt-builder" ? (
                      <>
                        Convierte tus archivos de código en prompts listos para LLMs, con salidas estructuradas para chatbots.
                        <br/> Carga tus scripts y obtén resultados en un clic.
                        <br /> 100% open source, gratuito y sin registro.
                        <br /> La función estrella de Script2me.
                      </>
                    ) : feature.id === "ai-refactor" ? (
                      <>
                        Analiza y transforma automáticamente tu código para mejorar su rendimiento, estructura y mantenibilidad. Refactorización inteligente con comprensión contextual, con un solo clic.
                        <br /> Ideal para flujos de trabajo modernos y desarrollo escalable.
                      </>
                    ) : feature.id === "ai-scanner" ? (
                      <>
                        Analiza tu código en profundidad con la API de Google Gemini. 
                        <br />Búsqueda de vulnerabilidades y de patrones inseguros en entornos backend principalmente. <br /> Recibe recomendaciones precisas para fortalecer la seguridad y mitigar riesgos potenciales.
                      </>
                    ) : (
                      feature.descriptionKey
                    )}
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
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
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
                        ¿Porqué Script2me?
                      </h2>
                      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                        <p>
                          Script2me nace fruto de las limitatciones impuestas por los chatbots de IA, que permiten
                          un bajo numero de archivos adjuntos. <br/> Tareas que se quedaban a medias por no poder adjuntar todos los
                          archivos necesarios para una correcta comprensión del contexto.
                        </p>
                        <p>
                          'Prompt Builder' viene a cubrir este problema. Con esta herramienta, puedes subir tus archivos de código y
                          convertirlos en un único prompt con salida optimizada para ser procesado por un asistente de IA. Esto te permite
                          obtener respuestas más precisas y relevantes, mejorando así tu productividad y eficiencia.
                        </p>
                        <p>
                          Tras desarrollar esta herramienta, decidí expandir mis horizontes y crear otras herramientas que también
                          están relacionadas con la IA.<br/> Así nacieron 'AI Refactor' y 'AI Security Scanner', que utilizan
                          la API de Google Gemini para ofrecerte una experiencia de desarrollo aún más enriquecedora.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
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
                        Detrás de Script2me
                      </h3>

                      <div className="space-y-4 text-neutral-700 dark:text-neutral-300">
                        <p className="leading-relaxed">
                          Script2me es un proyecto independiente creado y mantenido enteramente por mí, un desarrollador Full Stack
                          junior apasionado por la tecnología y sobretodo por la IA.
                        </p>

                        <p className="leading-relaxed">
                          Mi misión es simplificar y potenciar el día a día de los desarrolladores utilizando la
                          inteligencia artificial como herramienta clave para resolver problemas complejos en su codigo de manera
                          eficiente.
                        </p>

                        <div className="mt-6">
                          <h4 className="text-lg font-semibold mb-3 text-emerald-700 dark:text-emerald-400">
                            Stack Tecnológico
                          </h4>
                          <p className="mb-3">Script2me ha sido desarrollado enteramente con:</p>
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
                          <div className="flex items-center justify-center md:justify-start mt-6 gap-2">
                            <span className="font-medium text-emerald-700 dark:text-emerald-300 text-base mr-0">
                              AI powered by
                            </span>
                            <img
                              src="/images/gemini.svg"
                              alt="Gemini"
                              className="h-8 w-auto align-middle"
                              style={{ display: "inline-block" }}
                            />
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
                          Ver código en GitHub
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-600/20 backdrop-blur-md mb-6">
                <Mail className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Contact Us</h2>
              <p className="text-xl mb-10 text-neutral-300">Have questions or feedback? Reach out to us via email.</p>

              <motion.a
                href="mailto:tuemail@example.com"
                className="inline-flex items-center justify-center bg-emerald-600 text-white hover:bg-emerald-700 font-semibold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Send Email
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.a>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="bg-neutral-800 dark:bg-neutral-950 text-neutral-400 dark:text-neutral-500 py-12 m-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© {new Date().getFullYear()} Script2me. All rights reserved.</p>
        </div>
      </footer>
    </AppLayout>
  )
}

export default LandingPage



