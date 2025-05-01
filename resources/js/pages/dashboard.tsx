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


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Turn code into optimized AI prompts. Upload, process, and enhance scripts—free & open-source.',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { contents = [], names = [], flash } = usePage<{
        contents: string[];
        names: string[];
        flash: { success?: string; error?: string };
    }>().props;

    const handleClearSession = () => {
        router.post('/clear-session', {}, {
            onSuccess: () => {
                sessionStorage.setItem('flash.success', 'Session cleared successfully');
                window.location.href = window.location.href; // Fuerza recarga completa
            }
        });
    };

    const [localContents, setLocalContents] = useState(contents);

    useEffect(() => {
        setLocalContents(contents);

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

    }, [contents, flash]);

    useEffect(() => {
        const refreshData = async () => {
            await router.reload({ only: ['contents', 'names'] });
        };

        // Solo ejecutar al montar el componente
        refreshData();
    }, []); // Array de dependencias vacío

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Toaster
                position="bottom-center"
                toastOptions={{
                    className: 'my-custom-toast',
                    style: {
                        background: '#363636',
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '20px 28px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                }}
            />
            <Head title="Code to AI prompts" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">

                <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl">
                    {/* Formulario */}
                    <UploadForm
                        actionUrl="/upload"
                        loadingTime={1000}
                        buttonText={""}
                        showCaptcha={false}
                        progressSpeed={50}
                        progressMaxTime={800}
                    />
                </div>
                {/* Zona de vista previa */}
                <div className="border-sidebar-border dark:border-sidebar-border relative min-h-[100vh] flex-1 rounded-xl border md:min-h-min p-4 overflow-y-auto">
                    {/* Botones de acción */}
                    <div className="flex justify-between mb-4 items-center">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                            Uploaded files {contents.length > 0 ? `(${contents.length})` : ''}
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
                                            const fullContent = contents.map((content, index) => {
                                                const fileName = names[index];
                                                return `Filename: ${fileName}
Content:
--------------------------------------------------
${content}
--------------------------------------------------\n\n`;
                                            }).join('\n');

                                            navigator.clipboard.writeText(fullContent);
                                            toast.success('¡Content copied to clipboard!');
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
                                                    {contentLines.length} {contentLines.length === 1 ? 'línea' : 'líneas'}
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
                                                            className="h-[1.5rem] w-10 px-2 flex items-center justify-end hover:bg-gray-300 dark:hover:bg-emerald-700/50 transition-colors"
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
                                                                className="h-[1.5rem] px-4 flex items-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
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
                                                {fileName.includes('.') ? `.${fileName.split('.').pop()}` : 'Sin extensión'}
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
                                    There are no uploaded files yet
                                </p>
                                <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                                    Add some to see them here
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
