import { useRef, useState } from 'react';

const AnimatedRemoveWrapper = ({ children, onRemove, file }) => {
    const [removing, setRemoving] = useState(false);
    const wrapperRef = useRef(null);

    const handleRemove = () => {
        setRemoving(true);
        setTimeout(() => {
            onRemove(file);
        }, 160); // Duración aún más corta
    };

    return (
        <div
            ref={wrapperRef}
            className={`transition-all duration-150 ease-in-out ${removing ? 'opacity-0 scale-90 blur-[2px] translate-x-16 pointer-events-none' : 'opacity-100 scale-100'}`}
        >
            {children({ onRemove: handleRemove })}
        </div>
    );
};

export default AnimatedRemoveWrapper;
