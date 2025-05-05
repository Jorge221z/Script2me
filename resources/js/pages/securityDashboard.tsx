import { useEffect, useState } from 'react';
import { type BreadcrumbItem } from '@/types';
import { usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { Toaster, toast } from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import AppLayout from '@/layouts/app-layout';
import UploadForm from '../components/Forms/UploadForm';
import { Head } from '@inertiajs/react';
import BackgroundPattern from '@/layouts/app/BackgroundPattern';
import { FileText, Expand } from 'lucide-react';

interface Vulnerability {
    line: number;
    issue: string;
    suggestion?: string;
}

interface SecurityResult {
    score: number;
    summary?: string;
    critical_lines?: number[];
    vulnerabilities: Vulnerability[];
}

interface SecResponse extends Record<string, any> {
    SecContents: SecurityResult[];
    SecNames: string[];
    flash: { success?: string; error?: string };
}

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
                    sessionStorage.setItem('flash.success', t('securityDashboard.sessionCleared'));
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

        // flash messages
        const successMessage = sessionStorage.getItem('flash.success');
        if (successMessage) {
            setTimeout(() => {
                toast.success(successMessage);
                sessionStorage.removeItem('flash.success');
            }, 300);
        }
        if (flash.success) toast.success(flash.success);
        if (flash.error) toast.error(flash.error);
    }, [SecContents, SecNames, flash, t]);

    useEffect(() => {
        // refresh data once
        router.reload({ only: ['SecContents', 'SecNames'] });
    }, []);

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: t('securityDashboard.description'),
                    href: '/security-dashboard',
                },
            ]}
        >
            <Toaster position="bottom-center" />
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
                <div className="mb-0 px-1 py-0.5 rounded bg-gradient-to-l from-amber-100 via-amber-50 to-white dark:from-amber-900 dark:via-amber-950 dark:to-black text-center border border-amber-100 dark:border-amber-900">
                    <span className="text-[0.78rem] md:text-sm font-normal text-amber-700 dark:text-amber-300 leading-tight">
                        {t('securityDashboard.introLine1')}
                        <br />
                        <span className="font-normal text-gray-700 dark:text-gray-200">
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
                        progressMaxTime={15000}
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
                                    <FiTrash2 /> {t('securityDashboard.clearHistory')}
                                </button>
                            )}
                        </div>
                    </div>

                    {localResults.length > 0 ? (
                        <div className="space-y-6">
                            {localResults.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-amber-200 dark:border-amber-700 shadow-sm bg-white dark:bg-black"
                                >
                                    {/* File header & score */}
                                    <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-950/10 border-b border-amber-200 dark:border-amber-700 rounded-t-xl">
                                        <h3 className="font-medium text-amber-800 dark:text-amber-200 truncate">
                                            {item.filename}
                                        </h3>
                                        <span className="text-sm font-semibold">
                                            {t('securityDashboard.score')}: {item.result.score}/100
                                        </span>
                                    </div>

                                    {/* Critical issues preview */}
                                    <div className="px-4 py-3">
                                        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {t('securityDashboard.criticalIssues')}
                                        </h4>
                                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                            {item.result.vulnerabilities.slice(0, 3).map((v, i) => (
                                                <li key={i}>
                                                    <span className="font-medium">Line {v.line}:</span> {v.issue}
                                                </li>
                                            ))}
                                        </ul>
                                        {item.result.vulnerabilities.length > 3 && (
                                            <button
                                                onClick={() => {
                                                    setModalVulns(item.result.vulnerabilities);
                                                    setModalFile(item.filename);
                                                    setModalOpen(true);
                                                }}
                                                className="group mt-2 text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white shadow-lg border-0 transition-all duration-200 hover:from-blue-500 hover:to-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 flex items-center gap-2"
                                                aria-label={t('securityDashboard.showAll')}
                                                title={t('securityDashboard.showAll')}
                                            >
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="drop-shadow-sm">{t('securityDashboard.showAll')}</span>
                                                    <Expand className="w-4 h-4 text-white group-hover:scale-110 transition-transform duration-200" />
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
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