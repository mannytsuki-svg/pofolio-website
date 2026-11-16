import React, { useRef, useState } from 'react';

export default function ProjectReveal({ src, alt }) {
  const mosaic = useRef(null);
  const [pixelated, setPixelated] = useState(false);

  function pixelate(event) {
    const image = event.currentTarget;
    const canvas = mosaic.current;
    const context = canvas.getContext('2d');
    if (!context || !image.naturalWidth) return;

    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const width = image.naturalWidth * scale;
    const height = image.naturalHeight * scale;
    const alignment = src.endsWith('hengqin-waterfront-cover.webp') ? .42 : .5;
    context.filter = 'grayscale(1)';
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) * alignment, width, height);
    setPixelated(true);
  }

  return (
    <div className="project-image" data-pixelated={pixelated}>
      <img src={src} alt={alt} decoding="async" onLoad={pixelate} />
      <canvas ref={mosaic} width="30" height="20" aria-hidden="true" />
    </div>
  );
}
