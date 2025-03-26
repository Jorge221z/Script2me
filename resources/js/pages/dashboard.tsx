import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import UploadForm from '../components/Forms/UploadForm';


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
        success?: string
            }>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Mensaje de éxito */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                        {success}
                    </div>
                )}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl border p-4">
                    {/* Explicación interactiva */}
                    <div className="mb-4 text-sm text-gray-600">
                        Arrastra o selecciona archivos para subirlos. Verás su contenido debajo. Soportamos múltiples formatos{' '}
                        <span className="relative group">
                            <span className="text-blue-500 cursor-pointer rounded-xl">i</span>
                            <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-64 z-10">
                                <p>Extensiones soportadas: txt, js, php, c, cpp, java, py, rb, html, css, y más.</p>
                            </div>
                        </span>
                    </div>
                    {/* Formulario */}
                    <UploadForm />
                </div>
                {/* Zona de vista previa */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 rounded-xl border md:min-h-min p-4 overflow-y-auto">
                    {contents.length > 0 ? (
                        <div className="space-y-4">
                            {contents.map((content, index) => (
                                <div
                                    key={index}
                                    className="border-sidebar-border/70 dark:border-sidebar-border relative rounded-xl border p-4"
                                >
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                        {names[index]}
                                    </h3>
                                    <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                        {content}
                                    </pre>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 dark:text-gray-400">
                            <p>Todavía no hay archivos subidos.</p>
                            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
