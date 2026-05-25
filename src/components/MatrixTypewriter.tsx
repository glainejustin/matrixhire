import { useState, useEffect } from "react";

interface MatrixTypewriterProps {
  text: string;
  delay?: number;
  scrambleLoops?: number;
  highlightColor?: string;
}

export function MatrixTypewriter({ 
  text, 
  delay = 40, 
  scrambleLoops = 3,
  highlightColor = "#10b981" 
}: MatrixTypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let currentTextIndex = 0;
    let scrambleAttempts = 0;
    let timer: NodeJS.Timeout;

    const matrixSymbols = "Ø01⚡︎◆◇▲▼◀▶█▄▌▐▀░▒▓█☄⚔⚔⚒☣☠⚙⚙⚙⚙⚜✴✦★☆";

    const typeStep = () => {
      if (currentTextIndex < text.length) {
        if (scrambleAttempts < scrambleLoops) {
          // Temporarily show a scrambled character for authentic Matrix telemetry look
          const randomChar = matrixSymbols[Math.floor(Math.random() * matrixSymbols.length)];
          setDisplayedText((prev) => {
            const finished = text.slice(0, currentTextIndex);
            return finished + randomChar;
          });
          scrambleAttempts++;
          timer = setTimeout(typeStep, delay / 2);
        } else {
          // Lock in the real character
          setDisplayedText(text.slice(0, currentTextIndex + 1));
          currentTextIndex++;
          scrambleAttempts = 0;
          timer = setTimeout(typeStep, delay);
        }
      } else {
        setDisplayedText(text);
        setIsCompleted(true);
      }
    };

    timer = setTimeout(typeStep, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [text, delay, scrambleLoops]);

  return (
    <span className="font-mono">
      {displayedText}
      {!isCompleted && (
        <span 
          className="inline-block w-1.5 h-3 ml-0.5 animate-pulse" 
          style={{ backgroundColor: highlightColor }}
        />
      )}
    </span>
  );
}
