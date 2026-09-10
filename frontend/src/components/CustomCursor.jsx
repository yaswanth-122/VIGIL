import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on non-touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      return;
    }

    setIsVisible(true);

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.closest('button') ||
        target.closest('a') ||
        target.classList.contains('clickable')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, []);

  // Smooth trailing animation loop
  useEffect(() => {
    if (!isVisible) return;
    let animFrame;

    const followPointer = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.25,
        y: prev.y + (position.y - prev.y) * 0.25,
      }));
      animFrame = requestAnimationFrame(followPointer);
    };

    animFrame = requestAnimationFrame(followPointer);
    return () => cancelAnimationFrame(animFrame);
  }, [position, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Inner Glowing Cursor Dot */}
      <div
        className="fixed w-3 h-3 bg-cyan-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg shadow-cyan-400/80 transition-transform duration-75 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`,
        }}
      ></div>

      {/* Outer Lagging Glow Ring */}
      <div
        className={`fixed rounded-full -translate-x-1/2 -translate-y-1/2 border border-cyan-400/60 transition-all duration-300 ease-out ${
          isHovered ? 'w-12 h-12 bg-cyan-500/10 border-cyan-300 scale-110 glow-cyan' : 'w-8 h-8 bg-transparent'
        }`}
        style={{
          left: `${trailingPos.x}px`,
          top: `${trailingPos.y}px`,
        }}
      ></div>
    </div>
  );
}
