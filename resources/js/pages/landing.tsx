import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react';
import {
  Home,
  Pickaxe,
  BrainCircuit,
  Radar,
  Mail,
  ArrowRight,
  Menu as MenuIcon,
  X as XIcon,
  Sparkles,
  Rocket,
} from 'lucide-react';

interface SectionInfo {
  id: string;
  titleKey: string;
  icon: React.ElementType;
}

const APP_LAYOUT_HEADER_HEIGHT_VALUE = 64;

const LandingPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isPageNavSticky, setIsPageNavSticky] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const pageNavRef = useRef<HTMLElement>(null);

  const sections: SectionInfo[] = [
    { id: 'hero', titleKey: 'Home', icon: Home },
    { id: 'features', titleKey: 'Features', icon: Pickaxe },
    { id: 'our-story', titleKey: 'Our Story', icon: Rocket },
    { id: 'contact', titleKey: 'Contact', icon: Mail },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (pageNavRef.current) {
        setIsPageNavSticky(window.scrollY > (pageNavRef.current.offsetTop - APP_LAYOUT_HEADER_HEIGHT_VALUE));
      }

      let currentSectionId = sections[0]?.id || 'hero';
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const pageNavHeight = isPageNavSticky && pageNavRef.current ? pageNavRef.current.offsetHeight : 0;
          const effectiveOffset = APP_LAYOUT_HEADER_HEIGHT_VALUE + pageNavHeight + 20;

          if (rect.top <= effectiveOffset && rect.bottom >= effectiveOffset) {
            currentSectionId = section.id;
            break;
          }
        }
      }
      setActiveSection(currentSectionId);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, isPageNavSticky]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    const pageNavHeight = pageNavRef.current?.offsetHeight || 0;
    if (element) {
      const topPos = element.offsetTop - APP_LAYOUT_HEADER_HEIGHT_VALUE - (isPageNavSticky ? pageNavHeight : 0) - 10;
      window.scrollTo({
        top: topPos,
        behavior: 'smooth',
      });
    }
    setIsMobileMenuOpen(false);
  };

  const breadcrumbs = [{ title: 'Landing', href: '/landing' }];

  const featureCards = [
    {
      id: 'prompt-builder',
      icon: Pickaxe,
      titleKey: 'Prompt Builder',
      descriptionKey: 'Transform your code files into optimized prompts for AI assistants. Upload, process, and enhance your scripts with a single click—completely free & open-source.',
      href: '/dashboard',
      ctaKey: 'Try Prompt Builder',
      color: 'emerald',
    },
    {
      id: 'ai-refactor',
      icon: BrainCircuit,
      titleKey: 'AI Refactor',
      descriptionKey: 'Leverage Gemini\'s advanced AI to transform and enhance your code. Improve performance, structure, and maintainability with machine learning—effortlessly, with just one click.',
      href: '/refactor-dashboard',
      ctaKey: 'Refactor Now',
      color: 'orange',
    },
    {
      id: 'ai-scanner',
      icon: Radar,
      titleKey: 'AI Security Scanner',
      descriptionKey: 'Scan your code for vulnerabilities and security issues using the Google Gemini API. Get targeted recommendations to fix weak points and strengthen your overall security posture.',
      href: '/security-dashboard',
      ctaKey: 'Scan for Security',
      color: 'amber',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Script2me - AI Tools for Developers" />

      <main className="bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">
        <section id="hero" className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 dark:from-emerald-700 dark:via-teal-700 dark:to-sky-800 text-white py-28 md:py-40 flex items-center justify-center text-center overflow-hidden min-h-[calc(100vh-var(--app-header-height,64px)-var(--page-nav-height,56px))]">
          <div className="absolute inset-0 opacity-10 dark:opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="hero-pattern-dots" patternUnits="userSpaceOnUse" width="50" height="50"><circle cx="5" cy="5" r="1" fill="currentColor" /></pattern></defs><rect width="100%" height="100%" fill="url(#hero-pattern-dots)" /></svg>
          </div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <Sparkles className="mx-auto h-16 w-16 text-amber-300 mb-6 animate-pulse" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-300 to-white animate-gradient-x">
              Supercharge your development with AI
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-emerald-100 dark:text-sky-100">
              Build, refactor, and secure your code with Script2me's AI-powered tools.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:flex sm:justify-center sm:space-x-4">
              <button
                onClick={() => scrollToSection('features')}
                className="bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-neutral-100 dark:text-emerald-700 dark:hover:bg-neutral-200 font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-lg inline-flex items-center group"
              >
                Explore Features
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="bg-transparent hover:bg-white/20 border-2 border-white text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
              >
                Contact Us
              </button>
            </div>
          </div>
        </section>

        <nav
          ref={pageNavRef}
          className={`bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md shadow-sm py-3 transition-all duration-300 ease-in-out w-full ${isPageNavSticky ? `sticky top-[${APP_LAYOUT_HEADER_HEIGHT_VALUE}px] z-40` : 'relative z-40'}`}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center">
            <div className="hidden md:flex">
              <ul className="flex space-x-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-in-out group relative ${activeSection === section.id
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                        }`}
                    >
                      {section.titleKey}
                      <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 dark:bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out ${activeSection === section.id ? 'scale-x-100' : ''}`}></span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 focus:outline-none p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-neutral-800 shadow-lg absolute w-full z-30 mt-1 rounded-b-md">
              <ul className="flex flex-col space-y-1 px-2 pt-2 pb-3">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors duration-150 ${activeSection === section.id
                        ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }`}
                    >
                      {section.titleKey}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <section id="features" className="py-16 md:py-24 bg-[#d1d1d1] dark:bg-neutral-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-neutral-900 dark:text-white">Our Features</h2>
            <p className="text-center text-neutral-600 dark:text-neutral-400 mb-12 md:mb-16 max-w-2xl mx-auto text-lg">
              Discover how Script2me can transform your development workflow <br/> with AI-powered tools.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featureCards.map((feature) => (
                <div
                  key={feature.id}
                  className={
                    feature.id === 'prompt-builder'
                      ? "relative overflow-hidden p-6 rounded-2xl shadow-xl border border-[#00bb89]/30 dark:border-[#00bb89]/40 bg-gradient-to-br from-[#e6faf5] via-white to-[#e6faf5] dark:from-[#014d3a] dark:via-[#026e52] dark:to-[#00bb89]/60 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:border-[#00bb89]/60 hover:scale-[1.03] group"
                      : "bg-neutral-50 dark:bg-neutral-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  }
                >
                  {/* Fondo animado sutil para Prompt Builder */}
                  {feature.id === 'prompt-builder' && (
                    <div className="absolute inset-0 pointer-events-none opacity-30 animate-pulse"
                      style={{
                        background: "radial-gradient(circle at 70% 30%, #00bb89 0%, #e6faf5 60%, transparent 90%)"
                      }}
                    />
                  )}
                  <div
                    className={
                      feature.id === 'prompt-builder'
                        ? "relative z-10 inline-flex items-center justify-center p-4 rounded-full bg-white/80 dark:bg-[#026e52]/80 shadow-lg ring-2 ring-[#00bb89]/30 dark:ring-[#00bb89]/40 mb-4 group-hover:ring-4 transition-all"
                        : feature.id === 'ai-refactor'
                          ? 'inline-flex items-center justify-center p-3 rounded-full bg-orange-100 dark:bg-orange-900/70 mb-4'
                          : feature.id === 'ai-scanner'
                            ? 'inline-flex items-center justify-center p-3 rounded-full bg-amber-100 dark:bg-neutral-900 mb-4'
                            : `inline-flex items-center justify-center p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50 mb-4`
                    }
                  >
                    <feature.icon
                      size={32}
                      className={
                        feature.id === 'prompt-builder'
                          ? "text-[#00bb89] drop-shadow-[0_0_8px_rgba(0,187,137,0.35)] group-hover:scale-110 transition-transform"
                          : feature.id === 'ai-refactor'
                            ? 'text-orange-600 dark:text-orange-300'
                            : feature.id === 'ai-scanner'
                              ? 'text-amber-600 dark:text-amber-300'
                              : 'text-emerald-600 dark:text-emerald-300'
                      }
                    />
                  </div>
                  <h3 className={
                    feature.id === 'prompt-builder'
                      ? "text-2xl md:text-3xl font-extrabold mb-2 bg-gradient-to-r from-[#00bb89] via-[#00bb89] to-emerald-400 dark:from-[#00bb89] dark:via-[#1cdba8] dark:to-emerald-200 bg-clip-text text-transparent drop-shadow-lg"
                      : "text-xl font-semibold mb-2 text-neutral-900 dark:text-white"
                  }>
                    {feature.titleKey}
                  </h3>
                  <p className={
                    feature.id === 'prompt-builder'
                      ? "mb-4 text-neutral-700 dark:text-neutral-200 font-medium"
                      : "text-neutral-600 dark:text-neutral-300 mb-4"
                  }>
                    {feature.descriptionKey}
                  </p>
                  <Link
                    href={feature.href}
                    className={
                      feature.id === 'prompt-builder'
                        ? "inline-flex items-center font-semibold text-[#00bb89] hover:text-[#008f6b] underline underline-offset-4 decoration-2 decoration-[#00bb89] hover:decoration-[#008f6b] transition-all group"
                        : `inline-flex items-center text-${feature.color}-600 dark:text-${feature.color}-400 hover:text-${feature.color}-700 dark:hover:text-${feature.color}-300 font-medium transition-colors`
                    }
                  >
                    {feature.ctaKey}
                    <span className="ml-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="our-story" className="py-16 md:py-24 bg-[#d1d1d1] dark:bg-neutral-800/50 m-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Rocket className="mx-auto h-12 w-12 text-emerald-500 dark:text-emerald-400 mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">Nuestra Historia</h2>
            <p className="max-w-3xl mx-auto text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Script2me nació de una pasión por simplificar el proceso de desarrollo. Frustrados por las tareas que consumían tiempo, como la optimización de código y las verificaciones de seguridad, nuestros fundadores imaginaron una plataforma que aprovechara la IA para empoderar a los desarrolladores.
            </p>
            <p className="max-w-3xl mx-auto text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4">
              Comenzando como un pequeño proyecto, Script2me ha crecido hasta convertirse en un conjunto de herramientas integral que ayuda a los desarrolladores a construir, refactorizar y asegurar su código con facilidad. Nuestro viaje ha estado impulsado por la creencia de que la IA puede revolucionar el desarrollo de software, haciéndolo más eficiente y accesible.
            </p>
            <p className="max-w-3xl mx-auto text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
              Hoy, Script2me está comprometido a evolucionar continuamente y ofrecer soluciones innovadoras que satisfagan las necesidades de los desarrolladores en todo el mundo. Únete a nosotros en este viaje para transformar la forma en que codificas.
            </p>
          </div>
        </section>

        <section id="contact" className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-700 dark:to-teal-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Mail className="mx-auto h-12 w-12 text-white mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Contact Us</h2>
            <p className="text-emerald-100 dark:text-emerald-200 mb-12 md:mb-16 max-w-2xl mx-auto text-lg">
              Have questions or feedback? Reach out to us via email.
            </p>
            <a
              href="mailto:tuemail@example.com"
              className="inline-flex items-center justify-center bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-neutral-100 dark:text-emerald-700 dark:hover:bg-neutral-200 font-semibold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
            >
              Send Email
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-neutral-800 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 py-12 m-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© {new Date().getFullYear()} Script2me. All rights reserved.</p>
        </div>
      </footer>
    </AppLayout>
  );
};

export default LandingPage;