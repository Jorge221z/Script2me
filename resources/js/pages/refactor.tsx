import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import UploadForm from '../components/Forms/UploadForm';
import { FiCopy, FiTrash2 } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Procesa tus archivos de manera personalizada. Sube y transforma tus scripts con opciones avanzadas.',
        href: '/refactor',
    },
];

export default function Refactor() {
    const { contents = [], names = [], success } = usePage<{
        contents: string[];
        names: string[];
        success?: string;
    }>().props;

    const handleClearSession = () => {
        router.post('/clear-session', {}, {
            onSuccess: () => {
                toast.success('Historial limpiado con éxito');
            },
        });
    };

    useEffect(() => {
        if (success) {
            toast.success(success);
        }
    }, [success]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster position="bottom-center" />
            <Head title="Procesar Archivos" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl">
                    <UploadForm />
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 rounded-xl border md:min-h-min p-4 overflow-y-auto">
                    <div className="flex justify-between mb-4 items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            Archivos procesados {contents.length > 0 ? `(${contents.length})` : ''}
                        </h2>
                        <div className="flex space-x-2">
                            {contents.length > 0 && (
                                <>
                                    <button
                                        onClick={handleClearSession}
                                        className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                                    >
                                        <FiTrash2 className="inline-block" />
                                        Limpiar historial
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
                                        Copiar todo
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
                                            Nombre: {fileName}
                                        </h3>
                                        <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap pt-4 max-h-[300px] overflow-y-auto">
                                            {content}
                                        </pre>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-center py-10">
                            <p>No hay archivos procesados aún.</p>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
