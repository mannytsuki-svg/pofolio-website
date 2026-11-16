import React, { useEffect, useRef } from 'react';
import './SpecularFrame.css';

export default function SpecularFrame({ as: Element = 'figure', className = 'profile-visual', children }) {
  const frame = useRef(null);

  useEffect(() => {
    const element = frame.current;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let update = 0;
    let pointer;

    function reset() {
      cancelAnimationFrame(update);
      update = 0;
      element.style.removeProperty('--light-angle');
      element.style.removeProperty('--light-level');
    }

    function follow(event) {
      if (!visible || event.pointerType === 'touch' || reducedMotion.matches) return;
      pointer = event;
      if (!update) update = requestAnimationFrame(draw);
    }

    function draw() {
      update = 0;
      const rect = element.getBoundingClientRect();
      const halfWidth = rect.width / 2;
      const halfHeight = rect.height / 2;
      const x = pointer.clientX - rect.left - halfWidth;
      const y = pointer.clientY - rect.top - halfHeight;
      const distance = Math.hypot(Math.max(Math.abs(x) - halfWidth, 0), Math.max(Math.abs(y) - halfHeight, 0));
      if (distance >= 290) {
        reset();
        return;
      }
      const near = 1 - distance / 290;
      const strength = near * near * (3 - 2 * near);
      const angle = Math.atan2(x / halfWidth, -y / halfHeight);
      element.style.setProperty('--light-angle', `${angle}rad`);
      element.style.setProperty('--light-level', String(0.35 + 0.65 * strength));
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) reset();
    }, { rootMargin: '290px' });
    observer.observe(element);
    window.addEventListener('pointermove', follow, { passive: true });
    window.addEventListener('blur', reset);
    document.documentElement.addEventListener('pointerleave', reset);
    reducedMotion.addEventListener('change', reset);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(update);
      window.removeEventListener('pointermove', follow);
      window.removeEventListener('blur', reset);
      document.documentElement.removeEventListener('pointerleave', reset);
      reducedMotion.removeEventListener('change', reset);
    };
  }, []);

  return (
    <Element ref={frame} className={`${className} specular-frame`}>
      {children}
      <span className="specular-frame__glow" aria-hidden="true" />
      <span className="specular-frame__rim" aria-hidden="true" />
    </Element>
  );
}
