import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import UploadForm from '../components/Forms/UploadForm';
import { FiCopy, FiTrash2 } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import BackgroundPattern from '@/layouts/app/BackgroundPattern';
import { useState } from 'react';
import { FileText, File } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../utils/i18n';

export default function Refactor() {
    const { ApiContents = [], ApiNames = [], flash } = usePage<{
        ApiContents: string[];
        ApiNames: string[];
        flash: { success?: string; error?: string };
    }>().props;

    const { t } = useTranslation();

    const handleClearSession = () => {
        // Guardar el idioma actual antes de recargar
        sessionStorage.setItem('selectedLang', i18n.language);
        router.post('/clear-api-session', {}, {
            onSuccess: () => {
                sessionStorage.setItem('flash.success', t('refactorDashboard.sessionCleared'));
                window.location.href = window.location.href; // Fuerza recarga completa
            }
        });
    };

    const [localContents, setLocalContents] = useState(ApiContents);

    useEffect(() => {
        // Restaurar el idioma si está guardado en sessionStorage
        const storedLang = sessionStorage.getItem('selectedLang');
        if (storedLang && storedLang !== i18n.language) {
            i18n.changeLanguage(storedLang);
            sessionStorage.removeItem('selectedLang');
        }
        setLocalContents(ApiContents);

        //para el flash de limpieza de sesión
        const successMessage = sessionStorage.getItem('flash.success');
        if (successMessage) {
            setTimeout(() => {
                toast.success(successMessage);
                sessionStorage.removeItem('flash.success'); // Limpiar el mensaje después de mostrarlo
            }
                , 300);
        }
        //para flash de otra procedencia

        if (flash && flash.success) {
            toast.success(flash.success);
        }
        if (flash && flash.error) {
            toast.error(flash.error);
        }
    }, [ApiContents, flash]);


    useEffect(() => {
        const refreshData = async () => {
            await router.reload({ only: ['ApiContents', 'ApiNames'] });
        };

        // Solo ejecutar al montar el componente
        refreshData();
    }, []); // Array de dependencias vacío

    return (
        <AppLayout breadcrumbs={[
            {
                title: t('refactorDashboard.description'),
                href: '/refactor-dashboard',
            },
        ]}>
            <Toaster
                position="bottom-center"
                toastOptions={{
                    className: 'my-custom-toast',
                    style: {
                        background: '#1e3a5c', // azul oscuro
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '20px 28px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                }}
            />
            <Head title={t('refactorDashboard.headTitle')} />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                {/* Frase introductoria */}
                <div className="mb-0 px-1 py-0.5 rounded bg-gradient-to-l from-cyan-100 via-cyan-50 to-white dark:from-cyan-900 dark:via-cyan-950 dark:to-black text-center border border-cyan-100 dark:border-cyan-900">
                    <span className="text-[0.78rem] md:text-sm font-normal text-cyan-700 dark:text-cyan-300 leading-tight">
                        {t('refactorDashboard.introLine1')}
                        <br />
                        <span className="font-normal text-gray-700 dark:text-gray-200">
                            {t('refactorDashboard.introLine2')}
                        </span>
                    </span>
                </div>

                <div className="border-blue-200 dark:border-blue-900 relative rounded-xl pb-6">
                    {/* Formulario */}
                    <UploadForm
                        actionUrl="/process"
                        loadingTime={100}
                        buttonText={t('refactorDashboard.uploadButton')}
                        showCaptcha={true}
                        progressSpeed={50}
                        progressMaxTime={15000}
                        submitButtonText={t('refactorDashboard.processFiles')}
                        processingText={t('refactorDashboard.processing')}
                    />
                </div>
                {/* Zona de vista previa */}
                <div className="border-sidebar-border dark:border-sidebar-border relative min-h-[100vh] flex-1 rounded-xl border md:min-h-min p-4 overflow-y-auto ml-6 mr-6">
                    {/* Botones de acción */}
                    <div className="flex justify-between mb-4 items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            {t('refactorDashboard.uploadedFiles')} {ApiContents.length > 0 ? `(${ApiContents.length})` : ''}
                        </h2>
                        <div className="flex space-x-2">
                            {ApiContents.length > 0 && (
                                <>
                                    <button
                                        onClick={handleClearSession}
                                        className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm text-white hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700"
                                    >
                                        <FiTrash2 className="inline-block" />
                                        {t('refactorDashboard.clearHistory')}
                                    </button>
                                    <button
                                        onClick={() => {
                                            const fullContent = ApiContents.map((content, index) => {
                                                const fileName = ApiNames[index];
                                                return `Filename: ${fileName}
Content:
--------------------------------------------------
${content}
--------------------------------------------------\n\n`;
                                            }).join('\n');

                                            navigator.clipboard.writeText(fullContent);
                                            toast.success(t('refactorDashboard.contentCopied'));
                                        }}
                                        className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                    >
                                        <FiCopy className="inline-block" />
                                        {t('refactorDashboard.copyAll')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {ApiContents.length > 0 ? (
                        <div className="space-y-6">
                            {ApiContents.map((content, index) => {
                                const fileName = ApiNames[index] || `Archivo ${index + 1}`;
                                // Normalización de saltos de línea para asegurar compatibilidad
                                const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                                const contentLines = normalizedContent.split('\n');
                                return (
                                    <div key={index} className="rounded-xl border border-cyan-100 dark:border-blue-300 shadow-sm dark:shadow-none bg-white dark:bg-black">
                                        {/* Cabecera del archivo */}
                                        <div className="flex items-center justify-between px-2 py-3 bg-cyan-50 dark:bg-cyan-950/0 border border-cyan-200 dark:border-t-white border-l-white rounded-t-xl">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
                                                    <File className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                                </div>
                                                <h3 className="font-medium text-cyan-800 dark:text-cyan-200 truncate">
                                                    {fileName}
                                                </h3>
                                            </div>
                                            <div className="flex-shrink-0 ml-2">
                                                <span className="px-2.5 py-1 text-xs rounded-full bg-cyan-100 dark:bg-cyan-800 text-cyan-600 dark:text-cyan-300 font-medium">
                                                    {contentLines.length} {contentLines.length === 1 ? t('refactorDashboard.line') : t('refactorDashboard.lines')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Contenedor del visor de código con manejo mejorado del scroll */}
                                        <div className="relative max-h-[300px] overflow-y-auto">
                                            <div className="flex w-full min-w-fit">
                                                {/* Columna de números de línea */}
                                                <div className="sticky left-0 z-10 select-none py-2 text-right font-mono text-xs bg-cyan-50 dark:bg-cyan-950/30 border-r border-cyan-200 dark:border-cyan-500 flex-shrink-0">
                                                    {contentLines.map((_, lineIndex) => (
                                                        <div
                                                            key={lineIndex}
                                                            className="h-[2.1rem] w-10 px-2 flex items-center justify-end hover:bg-blue-200 dark:hover:bg-cyan-700/50 transition-colors"
                                                        >
                                                            <span className="text-cyan-400 dark:text-cyan-500">
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
                                                                className="h-[2.1rem] px-4 flex items-center hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors"
                                                            >
                                                                {line || ' '}
                                                            </div>
                                                        ))}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pie del visor */}
                                        <div className="flex justify-between items-center pr-6 py-2 border-t border-cyan-200 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-950/30 text-xs text-cyan-500 dark:text-cyan-400">
                                            {/* Tamaño al principio */}
                                            <span className='pl-4'>
                                                {(content.length / 1024).toFixed(2)} KB
                                            </span>
                                            {/* Extensión al final */}
                                            <span className="truncate max-w-xs">
                                                {fileName.includes('.') ? `.${fileName.split('.').pop()}` : t('refactorDashboard.noExtension')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="relative text-center py-12 px-4 h-auto min-h-[50vh] max-h-screen rounded-xl custom-border dark:border-blue-700 bg-gray-200 dark:bg-neutral-950/20">
                            <BackgroundPattern />
                            <div className="relative">
                                <FileText className="mx-auto h-15 w-15 text-gray-400 dark:text-gray-500 mb-4" />
                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                    {t('refactorDashboard.noFiles')}
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                                    {t('refactorDashboard.addFiles')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
