//será jsx este archivo porque no necesitamos tipar este componente //
import { useState, useEffect } from 'react';

export default function BackgroundPattern() {
  const [patterns, setPatterns] = useState([]);

  useEffect(() => {
    // Generar puntos para el patrón
    const newPatterns = [];
    for (let i = 0; i < 220; i++) {
      newPatterns.push({
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        size: Math.floor(Math.random() * 4) + 2
      });
    }
    setPatterns(newPatterns);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {patterns.map((pattern, index) => (
        <div
          key={index}
          className="absolute rounded-full bg-gray-300 dark:bg-gray-700 opacity-50"
          style={{
            top: `${pattern.y}%`,
            left: `${pattern.x}%`,
            width: `${pattern.size}px`,
            height: `${pattern.size}px`
          }}
        />
      ))}
    </div>
  );
}
