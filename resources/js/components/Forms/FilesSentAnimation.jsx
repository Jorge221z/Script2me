import React, { useEffect, useState, useRef } from 'react';

const FilesSentAnimation = ({ show }) => {
    const [visible, setVisible] = useState(false);
    const [barKey, setBarKey] = useState(0); // Para forzar reinicio de animación
    const [barStyle, setBarStyle] = useState({});
    const timeoutRef = useRef();

    useEffect(() => {
        if (show) {
            // Busca el botón del formulario principal
            const btn = document.querySelector('form button[type="submit"]');
            if (btn) {
                const rect = btn.getBoundingClientRect();
                setBarStyle({
                    position: 'fixed',
                    left: rect.left + 'px',
                    top: rect.top + 'px',
                    width: rect.width + 'px',
                    height: '8px',
                    borderRadius: '6px',
                    zIndex: 10000,
                    pointerEvents: 'none',
                });
            } else {
                setBarStyle({
                    position: 'fixed',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '320px',
                    height: '8px',
                    borderRadius: '6px',
                    zIndex: 10000,
                    pointerEvents: 'none',
                });
            }
            setVisible(false); // Oculta primero para reiniciar animación
            setTimeout(() => {
                setBarKey(prev => prev + 1); // Cambia la key para forzar el reinicio de la animación
                setVisible(true);
                clearTimeout(timeoutRef.current);
                timeoutRef.current = setTimeout(() => setVisible(false), 1000);
            }, 10);
        } else {
            setVisible(false);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [show]);

    if (!visible) return null;

    return (
        <>
            <div style={barStyle} className="files-sent-animation-bar" key={barKey}>
                <div className="bar" />
            </div>
            <style>
                {`
                .files-sent-animation-bar {
                    display: none;
                }
                `}
            </style>
        </>
    );
};

export default FilesSentAnimation;
