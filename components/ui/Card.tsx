import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  dark?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, dark = true, onClick }: CardProps) {
  const baseClasses = dark
    ? 'glass-3d rounded-xl'
    : 'bg-white rounded-xl shadow-md';
  
  const hoverEffect = hover && dark
    ? { y: -4 }
    : hover
    ? { y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }
    : {};

  return (
    <motion.div
      whileHover={hoverEffect}
      onClick={onClick}
      className={`${baseClasses} ${hover && dark ? 'crystal-glass-hover' : ''} p-6 transition-all ${className}`}
    >
      <div className="card-content relative z-10">
        {children}
      </div>
    </motion.div>
  );
}
