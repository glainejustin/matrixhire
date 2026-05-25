import { useEffect, useRef } from "react";

interface MenuMatrixRainProps {
  opacity?: number;
}

export function MenuMatrixRain({ opacity = 0.22 }: MenuMatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 200;
      canvas.height = canvas.parentElement?.clientHeight || 45;
    };

    resizeCanvas();
    
    // Add dynamic observer to resize correctly when menu structures toggle
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // High speed binary rain stream
    const chars = "010101ABCDEFGHIKLMNOPQRSTUVWXYZ1011".split("");
    const fontSize = 8;
    const columns = Math.ceil(canvas.width / fontSize);

    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -15; // tight initial offset for quick flow
    }

    let animationId: number;

    const draw = () => {
      // Fade trail suited for side elements
      ctx.fillStyle = "rgba(2, 6, 23, 0.12)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
      ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.95) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [opacity]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      style={{ mixBlendMode: "screen", opacity: 0.8 }}
    />
  );
}
