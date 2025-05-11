import { useEffect, useState } from 'react';
import { type BreadcrumbItem, Vulnerability, SecurityResult, SecResponse } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { toast } from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import AppLayout from '@/layouts/app-layout';
import UploadForm from '../components/Forms/UploadForm';
import { Head } from '@inertiajs/react';
import BackgroundPattern from '@/layouts/app/BackgroundPattern';
import { FileText, Expand, ShieldCheck } from 'lucide-react';
import CustomToast from '../components/CustomToast';

export default function Security() {
    const { SecContents = [], SecNames = [], flash } = usePage<SecResponse>().props;
    const { t } = useTranslation();
    const [localResults, setLocalResults] = useState<Array<{ filename: string; result: SecurityResult }>>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalVulns, setModalVulns] = useState<Vulnerability[]>([]);
    const [modalFile, setModalFile] = useState<string>('');

    // Clear session handler
    const handleClearSession = () => {
        sessionStorage.setItem('selectedLang', i18n.language);
        router.post(
            '/clear-sec-session',
            {},
            {
                onSuccess: () => {
                    sessionStorage.setItem('flash.success', t('dashboard.sessionCleared'));
                    window.location.reload();
                },
            }
        );
    };

    useEffect(() => {
        // restore language
        const storedLang = sessionStorage.getItem('selectedLang');
        if (storedLang && storedLang !== i18n.language) {
            i18n.changeLanguage(storedLang);
            sessionStorage.removeItem('selectedLang');
        }

        // combine names and results
        const combined = SecContents.map((result, idx) => ({ filename: SecNames[idx] || `File ${idx + 1}`, result }));
        setLocalResults(combined);

        // Handle toast messages
        const successMessage = sessionStorage.getItem('flash.success');
        
        if (successMessage) {
            // Show the message from sessionStorage and remove it
            setTimeout(() => {
                toast.success(successMessage);
                sessionStorage.removeItem('flash.success');
            }, 300);
        } else if (flash.success) {
            // Only show flash success if there was no sessionStorage message
            toast.success(flash.success);
        }
        
        // Always show error messages
        if (flash.error) toast.error(flash.error);
    }, [SecContents, SecNames, flash, t]);

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: t('securityDashboard.description'),
                    href: '/security-dashboard',
                },
            ]}
        >
            <CustomToast />
            {/* Modal for vulnerabilities */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative transition-all duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold transition-colors"
                            onClick={() => setModalOpen(false)}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <h3 className="text-xl font-bold mb-2 text-amber-800 dark:text-amber-200 truncate">
                            {modalFile}
                        </h3>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-6 text-lg">
                            {t('securityDashboard.allVulnerabilities')}
                        </h4>
                        <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {modalVulns.map((v, i) => (
                                <li key={i} className="border-l-4 pl-4 border-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded py-3 shadow-sm">
                                    <div className="mb-1">
                                        <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                            {t('securityDashboard.line')} {v.line}
                                        </span>
                                    </div>
                                    <div className="text-gray-700 dark:text-gray-300 text-base">
                                        {v.issue}
                                    </div>
                                    {v.suggestion && (
                                        <div className="text-md text-green-700 dark:text-green-300 mt-2">
                                            <span className="font-semibold">{t('securityDashboard.suggestion')}:</span> {v.suggestion}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            <Head title={t('securityDashboard.headTitle')} />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Intro text */}
                <div className="mb-0 px-1 py-0.5 rounded bg-gradient-to-br from-amber-100 via-white to-pink-100 dark:from-amber-900 dark:via-black dark:to-pink-900 text-center border border-amber-200 dark:border-amber-800 shadow-lg">
                    <span className="text-[0.85rem] md:text-base font-semibold bg-gradient-to-r from-amber-500 via-pink-400 to-fuchsia-400 dark:from-amber-300 dark:via-pink-400 dark:to-fuchsia-400 bg-clip-text text-transparent animate-gradient-x drop-shadow-md">
                        {t('securityDashboard.introLine1')}
                        <br />
                        <span className="font-normal text-xs md:text-sm text-gray-700-transparent dark:text-gray-200 bg-gradient-to-r from-gray-700 via-amber-600 to-pink-500 dark:from-gray-200 dark:via-amber-200 dark:to-pink-400 bg-clip-text animate-gradient-x">
                            {t('securityDashboard.introLine2')}
                        </span>
                    </span>
                </div>

                {/* Upload section */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl pb-6">
                    <UploadForm
                        actionUrl="/scan"
                        loadingTime={100}
                        buttonText={t('securityDashboard.uploadButton')}
                        showCaptcha={true}
                        progressSpeed={50}
                        progressMaxTime={9000}
                        submitButtonText={t('securityDashboard.scanFiles')}
                        processingText={t('securityDashboard.scanning')}
                    />
                </div>

                {/* Results section */}
                <div className="border-sidebar-border dark:border-sidebar-border relative flex-1 rounded-xl border p-4 overflow-y-auto ml-6 mr-6">
                    <div className="flex justify-between mb-4 items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            {t('securityDashboard.resultsTitle')} {localResults.length > 0 && `(${localResults.length})`}
                        </h2>
                        <div className="flex space-x-2">
                            {localResults.length > 0 && (
                                <button
                                    onClick={handleClearSession}
                                    className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                                >
                                    <FiTrash2 /> {t('refactorDashboard.clearHistory')}
                                </button>
                            )}
                        </div>
                    </div>

                    {localResults.length > 0 ? (
                        <div className="space-y-6">
                            {localResults.map((item, idx) => {
                                // Score color logic (solid, subtle backgrounds)
                                let scoreBg = "bg-gray-200 text-gray-800";
                                if (item.result.score < 60) {
                                    scoreBg = "bg-red-100 text-red-800 border border-red-200";
                                } else if (item.result.score < 80) {
                                    scoreBg = "bg-yellow-100 text-yellow-900 border border-yellow-200";
                                } else {
                                    scoreBg = "bg-green-100 text-green-900 border border-green-200";
                                }
                                return (
                                    <div
                                        key={idx}
                                        className="rounded-xl border border-amber-200 dark:border-amber-700 shadow-sm bg-white dark:bg-black"
                                    >
                                        {/* File header & score */}
                                        <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-950/10 border-b border-amber-200 dark:border-amber-700 rounded-t-xl">
                                            <h3 className="font-medium text-amber-800 dark:text-amber-200 truncate">
                                                {item.filename}
                                            </h3>
                                            <span
                                                className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors duration-200 ${scoreBg}`}
                                                title={t('securityDashboard.score')}
                                                style={{ minWidth: 90, textAlign: 'center' }}
                                            >
                                                {t('securityDashboard.score')}: {item.result.score}/100
                                            </span>
                                        </div>

                                        {/* Summary section */}
                                        {item.result.summary && (
                                            <div className="px-4 py-3 flex items-start gap-2 bg-gradient-to-r from-amber-50/60 via-white/80 to-amber-100/60 dark:from-amber-950/20 dark:via-black/40 dark:to-amber-900/20 rounded-b-none rounded-t-none mb-2">
                                                <span className="mt-1 text-amber-500 dark:text-amber-300">
                                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 15h-1.5v-1.5h1.5V17zm0-3h-1.5V7h1.5v7z"/></svg>
                                                </span>
                                                <div>
                                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        {t('securityDashboard.summary', 'Summary')}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                                        {item.result.summary}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Critical issues preview or secure message */}
                                        <div className="px-4 py-3">
                                            {item.result.vulnerabilities && item.result.vulnerabilities.length > 0 ? (
                                                <>
                                                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {t('securityDashboard.criticalIssues')}
                                                    </h4>
                                                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                                        {item.result.vulnerabilities.slice(0, 3).map((v, i) => (
                                                            <li key={i}>
                                                                <span className="font-medium"> {t('securityDashboard.line')} {v.line}:</span> {v.issue}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <button
                                                        onClick={() => {
                                                            setModalVulns(item.result.vulnerabilities);
                                                            setModalFile(item.filename);
                                                            setModalOpen(true);
                                                        }}
                                                        className="group mt-3 text-sm font-semibold px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg border-0 transition-all duration-200 hover:from-blue-500 hover:to-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 flex items-center gap-2 w-auto"
                                                        aria-label={t('securityDashboard.viewDetails')}
                                                        title={t('securityDashboard.viewDetails')}
                                                    >
                                                        <span className="inline-flex items-center gap-1">
                                                            <span className="drop-shadow-sm">
                                                                {item.result.vulnerabilities.length > 3 
                                                                    ? t('securityDashboard.showAll') 
                                                                    : t('securityDashboard.viewDetails', 'View Details')}
                                                            </span>
                                                            <Expand className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
                                                        </span>
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2 py-2">
                                                        {item.result.summary && (item.result.summary.includes('Not a source code file') || item.result.summary.includes('No es un archivo de código fuente') ) ? (
                                                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                            <FileText className="h-5 w-5" />
                                                            <p className="font-medium">{t('securityDashboard.notScriptFile')}</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                            <ShieldCheck className="h-5 w-5" />
                                                            <p className="font-medium">{t('securityDashboard.fileSecure')}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="relative text-center py-12 px-4 min-h-[50vh] rounded-xl border custom-border dark:border-gray-700 bg-gray-200 dark:bg-neutral-950/20">
                            <BackgroundPattern />
                            <div className="relative">
                                <FileText className="mx-auto h-15 w-15 text-gray-400 dark:text-gray-500 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                    {t('securityDashboard.noResults')}
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                                    {t('securityDashboard.addFilesPrompt')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}