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
        title: 'Upload your files',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { contents = [], names = [], success } = usePage<{
        contents: string[];
        names: string[];
        success?: string;
    }>().props;

    const handleClearSession = () => {
        router.post('/clear-session', {}, {
            onSuccess: () => {
                toast.success('Historial limpiado correctamente');
            }
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
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Mensaje de éxito */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl">
                    {/* Formulario */}
                    <UploadForm />
                </div>
                {/* Zona de vista previa */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 rounded-xl border md:min-h-min p-4 overflow-y-auto">
                    {/* Botones de acción */}
                    <div className="flex justify-between mb-4 items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            Archivos cargados {contents.length > 0 ? `(${contents.length})` : ''}
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
                                            const fullContent = contents.map((content, index) => {
                                                const fileName = names[index];
                                                return `Archivo: ${fileName}
Contenido:
--------------------------------------------------
${content}
--------------------------------------------------\n\n`;
                                            }).join('\n');

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
                                        <div className="mb-3 space-y-1">
                                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                                Archivo: {fileName}
                                            </h3>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-x-0 top-0 h-px bg-gray-200 dark:bg-gray-600" />
                                            <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap pt-4 max-h-[300px] overflow-y-auto">
                                                {content}
                                            </pre>
                                            <div className="absolute inset-x-0 bottom-0 h-px bg-gray-200 dark:bg-gray-600" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400 text-center py-10">
                            <p>Todavía no hay archivos subidos.</p>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

