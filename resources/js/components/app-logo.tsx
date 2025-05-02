export default function AppLogo(props: React.ComponentProps<'span'>) {
    return (
        <span {...props} className={`flex items-center ${props.className ?? ''}`}>
            <img
                src="/images/logo.png"
                alt="Logo"
                className="h-12 w-11 rounded-lg object-cover
                transition-all duration-200 ease-in-out hover:scale-105"
                onError={(e) => {
                    console.error('Error al cargar el logo');
                    e.currentTarget.style.display = 'none';
                }}
            />
        </span>
    );
}
