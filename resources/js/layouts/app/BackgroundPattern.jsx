//será jsx este archivo porque no necesitamos tipar este componente //
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/use-theme';

export default function BackgroundPattern() {
  const [particles, setParticles] = useState([]);
  const animationRef = useRef(null);
  const containerRef = useRef(null);
  const { isDarkMode } = useTheme(); // Usar el hook existente en lugar de detectar manualmente

  useEffect(() => {
    // Solo generar partículas si estamos en modo oscuro
    if (!isDarkMode) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setParticles([]);
      return;
    }

    // Generar puntos para el patrón
    const colors = [
      'bg-emerald-400/40', 'bg-blue-400/40', 'bg-cyan-400/40',
      'bg-indigo-400/40', 'bg-violet-400/40'
    ];

    // Crear las partículas
    const newParticles = [];
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.floor(Math.random() * 4) + 3, // Tamaño aumentado (3-7px)
        velocityX: (Math.random() - 0.5) * 0.005,
        velocityY: (Math.random() - 0.5) * 0.005,
        opacity: Math.random() * 0.3 + 0.3, // Opacidad aumentada (0.3-0.6)
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: 0.1 + Math.random() * 0.4,
      });
    }

    setParticles(newParticles);

    // Función de animación
    let lastTimestamp = 0;

    const animate = (timestamp) => {
      const deltaTime = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 30, 2) : 1;
      lastTimestamp = timestamp;

      setParticles(currentParticles =>
        currentParticles.map(particle => {
          let newX = particle.x + particle.velocityX * deltaTime;
          let newY = particle.y + particle.velocityY * deltaTime;

          const time = timestamp / 3000;
          const wobbleX = Math.sin(time * particle.pulseSpeed + particle.id) * 0.01;
          const wobbleY = Math.cos(time * particle.pulseSpeed + particle.id) * 0.01;

          newX += wobbleX;
          newY += wobbleY;

          if (newX <= 0 || newX >= 100) {
            particle.velocityX *= -0.8;
            newX = Math.max(0, Math.min(100, newX));
          }

          if (newY <= 0 || newY >= 100) {
            particle.velocityY *= -0.8;
            newY = Math.max(0, Math.min(100, newY));
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            scale: 1 + Math.sin(time * particle.pulseSpeed) * 0.03
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDarkMode]);

  // Si no estamos en modo oscuro, no renderizar nada
  if (!isDarkMode) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="block absolute inset-0 overflow-hidden pointer-events-none"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${particle.color || 'bg-gray-500'} will-change-transform`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 1.2}px ${particle.size / 2}px rgba(156, 226, 235, 0.3)`,
            transform: `translate(${particle.x}vw, ${particle.y}vh) scale(${particle.scale || 1})`,
            filter: 'none', // Eliminar el desenfoque para mayor nitidez
            transition: 'transform 0.5s ease-out'
          }}
        />
      ))}
    </div>
  );
}
