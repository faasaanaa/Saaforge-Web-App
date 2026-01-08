'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParagraphCarouselProps {
  paragraphs: string[];
  displayDuration?: number;
  transitionDuration?: number;
  className?: string;
}

export function ParagraphCarousel({
  paragraphs,
  displayDuration = 5000,
  transitionDuration = 0.6,
  className = '',
}: ParagraphCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % paragraphs.length);
    }, displayDuration);

    return () => clearInterval(interval);
  }, [paragraphs.length, displayDuration]);

  return (
    <div className={`relative min-h-[150px] flex items-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: transitionDuration }}
          className="absolute inset-0 w-full overflow-hidden break-words"
        >
          <p className={`whitespace-pre-wrap text-gray-300 ${className}`}>
            {paragraphs[currentIndex]}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
