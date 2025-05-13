//será jsx este archivo porque no necesitamos tipar este componente //
import { useState, useEffect, useRef } from 'react';

export default function BackgroundPattern() {
  const [particles, setParticles] = useState([]);
  const animationRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Generar puntos para el patrón
    const colors = [
      'bg-emerald-600/40', 'bg-blue-600/40', 'bg-cyan-600/40',
      'bg-indigo-600/40', 'bg-violet-600/40'
    ];

    // Crear las partículas
    const newParticles = [];
    for (let i = 0; i < 200; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.floor(Math.random() * 6) + 2,
        velocityX: (Math.random() - 0.5) * 0.008, // Velocidad reducida significativamente
        velocityY: (Math.random() - 0.5) * 0.008, // Velocidad reducida significativamente
        opacity: Math.random() * 0.4 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseSpeed: 0.2 + Math.random() * 0.8, // Pulso más lento
      });
    }

    setParticles(newParticles);

    // Función de animación
    let lastTimestamp = 0;

    const animate = (timestamp) => {
      // Reducir la frecuencia de actualización para movimiento más lento
      if (lastTimestamp && timestamp - lastTimestamp < 40) { // ~25 FPS en lugar de 60 FPS
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Calcular delta time para movimiento suave
      const deltaTime = lastTimestamp ? Math.min((timestamp - lastTimestamp) / 25, 2) : 1;
      lastTimestamp = timestamp;

      setParticles(currentParticles =>
        currentParticles.map(particle => {
          // Calcular nueva posición
          let newX = particle.x + particle.velocityX * deltaTime;
          let newY = particle.y + particle.velocityY * deltaTime;

          // Añadir un pequeño movimiento ondulatorio (reducido)
          const time = timestamp / 2000; // Más lento
          const wobbleX = Math.sin(time * particle.pulseSpeed + particle.id) * 0.015; // Reducido
          const wobbleY = Math.cos(time * particle.pulseSpeed + particle.id) * 0.015; // Reducido

          newX += wobbleX;
          newY += wobbleY;

          // Rebote en los bordes
          if (newX <= 0 || newX >= 100) {
            particle.velocityX *= -0.9; // Más amortiguación en los rebotes
            newX = Math.max(0, Math.min(100, newX));
          }

          if (newY <= 0 || newY >= 100) {
            particle.velocityY *= -0.9; // Más amortiguación en los rebotes
            newY = Math.max(0, Math.min(100, newY));
          }

          return {
            ...particle,
            x: newX,
            y: newY,
            scale: 1 + Math.sin(time * particle.pulseSpeed) * 0.05 // Pulso reducido
          };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    // Iniciar animación
    animationRef.current = requestAnimationFrame(animate);

    // Limpiar al desmontar
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hidden dark:block absolute inset-0 overflow-hidden pointer-events-none"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full ${particle.color || 'bg-gray-700'} will-change-transform`}
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 1.5}px ${particle.size / 2}px rgba(156, 226, 235, 0.25)`,
            transform: `translate(${particle.x}vw, ${particle.y}vh) scale(${particle.scale || 1})`,
            filter: particle.size > 4 ? `blur(${particle.size > 5 ? 1 : 0.5}px)` : 'none',
            transition: 'transform 0.3s ease-out' // Transición más lenta y suave
          }}
        />
      ))}
    </div>
  );
}
