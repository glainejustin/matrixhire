import { useEffect, useRef } from "react";

interface MatrixRainProps {
  className?: string;
  opacity?: number;
}

export function MatrixRain({ className = "absolute inset-0 pointer-events-none", opacity = 0.15 }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set size
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Characters
    const charString = "0101101101001011100110001GLOBALSYSTEMSMATRIXRECRUIT010101SOFTWAREINTELLIGENCE";
    const chars = charString.split("");
    const fontSize = 12;
    const columns = Math.ceil(canvas.width / fontSize);

    // Drops y positions
    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = Math.random() * -100;
    }

    let animationId: number;

    const draw = () => {
      // Semi-transparent background to build trail effect
      ctx.fillStyle = `rgba(3, 7, 18, 0.08)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`; // Glowing Emerald
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // Reset if it goes off screen randomly
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [opacity]);

  return <canvas ref={canvasRef} className={className} style={{ mixBlendMode: "screen" }} />;}
