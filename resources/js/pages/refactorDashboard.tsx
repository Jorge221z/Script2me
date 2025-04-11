import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import UploadForm from '../components/Forms/UploadForm';
import { FiCopy, FiTrash2 } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import BackgroundPattern from '@/layouts/app/BackgroundPattern';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Procesa tus archivos de manera personalizada. Sube y transforma tus scripts con opciones avanzadas.',
        href: '/refactor-dashboard',
    },
];

export default function Refactor() {
    const { contents = [], names = [], flash } = usePage<{
        contents: string[];
        names: string[];
        flash: { success?: string; error?: string };
    }>().props;

    const handleClearSession = () => {
        router.post('/clear-session');
    };

    useEffect(() => {
        if (flash && flash.success) {
            toast.success(flash.success);
        }
        if (flash && flash.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster position="bottom-center" />
            <Head title="AI-powered code processing" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl">
                    <UploadForm actionUrl="/process" />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 rounded-xl border md:min-h-min p-4 overflow-y-auto">
                    <div className="flex justify-between mb-4 items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            Processed files {contents.length > 0 ? `(${contents.length})` : ''}
                        </h2>
                        <div className="flex space-x-2">
                            {contents.length > 0 && (
                                <>
                                    <button
                                        onClick={handleClearSession}
                                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                                    >
                                        <FiTrash2 className="inline-block" />
                                        Clear history
                                    </button>
                                    <button
                                        onClick={() => {
                                            const fullContent = contents
                                                .map((content, index) => {
                                                    const fileName = names[index];
                                                    return `Nombre: ${fileName}\nContenido:\n--------------------------------------------------\n${content}\n--------------------------------------------------\n\n`;
                                                })
                                                .join('\n');
                                            navigator.clipboard.writeText(fullContent);
                                            toast.success('¡Contenido copiado al portapapeles!');
                                        }}
                                        className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                                    >
                                        <FiCopy className="inline-block" />
                                        Copy all
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {contents.length > 0 ? (
                        <div className="space-y-4">
                            {contents.map((content, index) => {
                                const fileName = names[index] || `Archivo ${index + 1}`;
                                return (
                                    <div
                                        key={index}
                                        className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl border p-4"
                                    >
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                            Name: {fileName}
                                        </h3>
                                        <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap pt-4 max-h-[300px] overflow-y-auto">
                                            {content}
                                        </pre>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="relative text-center py-12 px-4 rounded-xl border border-dashed border-black dark:border-gray-700 bg-gray-200 dark:bg-neutral-950/20">
                            <BackgroundPattern />
                            <div className="relative">
                                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <line x1="10" y1="9" x2="8" y2="9" />
                                </svg>
                                <p className="text-gray-600 dark:text-gray-400 font-medium">There are no uploaded files yet</p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Add some to see them here</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
