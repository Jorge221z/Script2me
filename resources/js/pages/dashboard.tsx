import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import UploadForm from '../components/Forms/UploadForm';
import { FiCopy, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import BackgroundPattern from '@/layouts/app/BackgroundPattern';
import { useState } from 'react';
import { FileText, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../utils/i18n';
import CustomToast from '../components/CustomToast';
import { useSEO } from '@/hooks/use-seo';
import { getPageSEO } from '@/utils/seo';

export default function Dashboard() {
    const { contents = [], names = [], flash } = usePage<{
        contents: string[];
        names: string[];
        flash: { success?: string; error?: string };
    }>().props;

    const { t } = useTranslation();

    // SEO Configuration
    const seoConfig = getPageSEO('dashboard')
    const { SEOHead } = useSEO({
        ...seoConfig,
        pageName: 'dashboard'
    })

    const handleClearSession = () => {
        // Guardar el idioma actual antes de recargar
        sessionStorage.setItem('selectedLang', i18n.language);
        router.post('/clear-session', {}, {
            onSuccess: () => {
                sessionStorage.setItem('flash.success', t('dashboard.sessionCleared'));
                window.location.href = window.location.href; // Fuerza recarga completa
            }
        });
    };

    const [localContents, setLocalContents] = useState(contents);

    useEffect(() => {
        // Restaurar el idioma si está guardado en sessionStorage
        const storedLang = sessionStorage.getItem('selectedLang');
        if (storedLang && storedLang !== i18n.language) {
            i18n.changeLanguage(storedLang);
            sessionStorage.removeItem('selectedLang');
        }
        setLocalContents(contents);

        // Handle toast messages
        const successMessage = sessionStorage.getItem('flash.success');

        if (successMessage) {
            // Show the message from sessionStorage and remove it
            setTimeout(() => {
                toast.success(successMessage);
                sessionStorage.removeItem('flash.success');
            }, 300);
        } else if (flash && flash.success) {
            // Only show flash success if there was no sessionStorage message
            toast.success(flash.success);
        }

        // Always show error messages
        if (flash && flash.error) {
            toast.error(flash.error);
        }
    }, [contents, flash]);

    return (
        <AppLayout breadcrumbs={[
            {
                title: t('dashboard.description'),
                href: '/dashboard',
            },
        ]}>
            <CustomToast />
            <SEOHead />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Frase introductoria */}
                <div className="mb-0 px-1 py-0.5 rounded bg-gradient-to-br from-emerald-100 via-white to-emerald-200 dark:from-emerald-900 dark:via-black dark:to-emerald-700 text-center border border-emerald-200 dark:border-emerald-800 shadow-lg">
                    <span className="text-[0.85rem] md:text-base font-semibold bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 dark:from-emerald-300 dark:via-cyan-400 dark:to-emerald-400 bg-clip-text text-transparent animate-gradient-x drop-shadow-md">
                        {t('dashboard.introLine1')}
                        <br />
                        <span className="font-normal text-xs md:text-sm text-gray-700 dark:text-gray-200">
                            {t('dashboard.introLine2')}
                        </span>
                    </span>
                </div>

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl pb-6">
                    {/* Formulario */}
                    <UploadForm
                        actionUrl="/upload"
                        loadingTime={1000}
                        buttonText={t('dashboard.uploadButton')}
                        showCaptcha={false}
                        progressSpeed={50}
                        progressMaxTime={800}
                        // submitButtonText no se pasa, se usa el valor por defecto
                        // processingText no se pasa, se usa el valor por defecto
                    />
                </div>
                {/* Zona de vista previa */}
                <div className="border-sidebar-border dark:border-sidebar-border relative flex-1 rounded-xl border p-4 overflow-y-auto ml-6 mr-6">
                    {/* Botones de acción */}
                    <div className="flex justify-between mb-4 items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            {t('dashboard.uploadedFiles')} {contents.length > 0 ? `(${contents.length})` : ''}
                        </h2>
                        <div className="flex space-x-2">
                            {contents.length > 0 && (
                                <>
                                    <button
                                        onClick={handleClearSession}
                                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                                    >
                                        <FiTrash2 className="inline-block" />
                                        {t('dashboard.clearHistory')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const fullContent = contents.map((content, index) => {
                                                const fileName = names[index];
                                                return `Filename: ${fileName}
Content:
--------------------------------------------------
${content}
--------------------------------------------------\n\n`;
                                            }).join('\n');

                                            navigator.clipboard.writeText(fullContent);
                                            toast.success(t('dashboard.contentCopied'));
                                        }}
                                        className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                    >
                                        <FiCopy className="inline-block" />
                                        {t('dashboard.copyAll')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {contents.length > 0 ? (
                        <div className="space-y-6">
                            {contents.map((content, index) => {
                                const fileName = names[index] || `Archivo ${index + 1}`;
                                // Normalización de saltos de línea para asegurar compatibilidad
                                const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                                const contentLines = normalizedContent.split('\n');
                                return (
                                    <div key={index} className="rounded-xl border border-emerald-100 dark:border-gray-300 shadow-sm dark:shadow-none bg-white dark:bg-black">
                                        {/* Cabecera del archivo */}
                                        <div className="flex items-center justify-between px-2 py-3 bg-emerald-50 dark:bg-emerald-950/0 border border-emerald-200 dark:border-t-white border-l-white rounded-t-xl">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
                                                    <File className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <h3 className="font-medium text-emerald-800 dark:text-emerald-200 truncate">
                                                    {fileName}
                                                </h3>
                                            </div>
                                            <div className="flex-shrink-0 ml-2">
                                                <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300 font-medium">
                                                    {contentLines.length} {contentLines.length === 1 ? t('dashboard.line') : t('dashboard.lines')}
                                                </span>
                                            </div>

                                        </div>

                                        {/* Contenedor del visor de código con manejo mejorado del scroll */}
                                        <div className="relative max-h-[300px] overflow-y-auto">
                                            <div className="flex w-full min-w-fit">
                                                {/* Columna de números de línea */}
                                                <div className="sticky left-0 z-10 select-none py-2 text-right font-mono text-xs bg-emerald-50 dark:bg-emerald-950/30 border-r border-emerald-200 dark:border-emerald-500 flex-shrink-0">
                                                    {contentLines.map((_, lineIndex) => (
                                                        <div
                                                            key={lineIndex}
                                                            className="h-[2.1rem] w-10 px-2 flex items-center justify-end hover:bg-gray-300 dark:hover:bg-emerald-700/50 transition-colors"
                                                        >
                                                            <span className="text-emerald-400 dark:text-emerald-500">
                                                                {lineIndex + 1}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Contenido del archivo con mejor manejo de overflow */}
                                                <div className="flex-1 py-2 overflow-x-auto">
                                                    <pre className="font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                        {contentLines.map((line, lineIndex) => (
                                                            <div
                                                                key={lineIndex}
                                                                className="h-[2.1rem] px-4 flex items-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                                            >
                                                                {line || ' '}
                                                            </div>
                                                        ))}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pie del visor */}
                                        <div className="flex justify-between items-center pr-6 py-2 border-t border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-500 dark:text-emerald-400">
                                            {/* Tamaño al principio */}
                                            <span className='pl-4'>
                                                {/* calculamos en KB, con dos decimales */}
                                                {(content.length / 1024).toFixed(2)} KB
                                            </span>
                                            {/* Extensión al final */}
                                            <span className="truncate max-w-xs">
                                                {fileName.includes('.') ? `.${fileName.split('.').pop()}` : t('dashboard.noExtension')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="relative text-center py-12 px-4 h-auto min-h-[50vh] max-h-screen rounded-xl custom-border dark:border-gray-700 bg-gray-200 dark:bg-neutral-950/20">
                            <BackgroundPattern />
                            <div className="relative">
                                <FileText className="mx-auto h-15 w-15 text-gray-400 dark:text-gray-500 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                    {t('dashboard.noFiles')}
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                                    {t('dashboard.addFiles')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
