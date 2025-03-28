import { useSidebar } from '@/components/ui/sidebar';


export default function AppLogo() {
    const { state, toggleSidebar } = useSidebar(); // Agregar toggleSidebar

    // Ajustar el tamaño del contenedor según el estado
    const containerSize = state === 'expanded' ? 'size-16' : 'size-13';

    return (
        <div className="flex items-center">
            <div
                className={`
                    bg-sidebar-primary
                    text-sidebar-primary-foreground
                    flex
                    aspect-square
                    ${containerSize}
                    items-center
                    justify-center
                    rounded-xl
                    overflow-visible
                    p-0
                    mb-4
                    mt-1
                    transition-all
                `}
                onClick={() => {
                    if (state === 'collapsed') {
                        toggleSidebar(); // Expandir la barra si está comprimida
                    }
                }}
            >
                <img
                    src="/images/logo.png"
                    alt="Logo"
                    className="mt-2.5 size-full object-contain"
                    onError={(e) => {
                        console.error('Error al cargar el logo');
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
            {state === 'expanded' && (
                <div className="grid flex-1 text-left">
                    <span className="text-2xl font-semibold leading-none">
                        script2me
                    </span>
                </div>
            )}
        </div>
    );
}
