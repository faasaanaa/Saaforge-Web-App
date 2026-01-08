'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardCarouselProps {
  cards: {
    paragraphs: string[];
  }[];
  displayDuration?: number;
  transitionDuration?: number;
}

export function CardCarousel({
  cards,
  displayDuration = 5000,
  transitionDuration = 0.6,
}: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, displayDuration);

    return () => clearInterval(interval);
  }, [cards.length, displayDuration]);

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: transitionDuration }}
          className="w-full"
        >
          <div className="space-y-4">
            {cards[currentIndex].paragraphs.map((para, idx) => (
              <p key={idx} className="text-xs leading-relaxed text-justify break-words text-gray-300">
                {para}
              </p>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
