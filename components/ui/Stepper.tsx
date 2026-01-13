'use client';
import React, { useState, Children, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Stepper.css';

interface StepperProps {
  children: React.ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (step: number) => void;
  }) => React.ReactNode;
  [key: string]: any;
}

export default function Stepper({
  children,
  initialStep = 1,
  step,
  onStepChange,
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  nextButtonProps,
  backButtonProps,
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  disableStepIndicators = false,
  ...rest
}: StepperProps & { step?: number }) {
  const currentStep = typeof step === 'number' ? step : initialStep;
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const nextBtnProps: React.ButtonHTMLAttributes<HTMLButtonElement> =
    nextButtonProps ?? {};
  const backBtnProps: React.ButtonHTMLAttributes<HTMLButtonElement> =
    backButtonProps ?? {};

  return (
    <div className="outer-container">
      <div className={`step-circle-container ${stepCircleContainerClassName}`}>
        {/* Step indicators */}
        <div className={`step-indicator-row ${stepContainerClassName}`}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                <StepIndicator
                  step={stepNumber}
                  disableStepIndicators={!!disableStepIndicators}
                  currentStep={currentStep}
                  onClickStep={() => {}}
                />
                {isNotLastStep && (
                  <StepConnector isComplete={currentStep > stepNumber} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Step content */}
        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={0}
          className={`step-content-default ${contentClassName}`}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {/* Footer navigation */}
        {!isCompleted && (
          <div className={`footer-container ${footerClassName}`}>
            <div className={`footer-nav ${currentStep !== 1 ? 'spread' : 'end'}`}>
              {currentStep !== 1 && (
                <button
                  type="button"
                  className={`back-button ${currentStep === 1 ? 'inactive' : ''}`}
                  {...backBtnProps}
                  onClick={(e) => {
                    e.preventDefault();
                    backBtnProps.onClick?.(e);
                    if (onStepChange) {
                      onStepChange(currentStep - 1);
                    }
                  }}
                >
                  {backButtonText}
                </button>
              )}

              <button
                type="button"
                className="next-button"
                {...nextBtnProps}
                onClick={(e) => {
                  e.preventDefault();
                  nextBtnProps.onClick?.(e);
                  if (!nextBtnProps.disabled && onStepChange) {
                    onStepChange(currentStep + 1);
                  }
                }}
              >
                {nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --- Step content wrapper --- */
interface StepContentWrapperProps {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: React.ReactNode;
  className?: string;
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className,
}: StepContentWrapperProps) {
  const [parentHeight, setParentHeight] = useState<number>(0);

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition
            key={currentStep}
            direction={direction}
            onHeightReady={(h: number) => setParentHeight(h)}
          >
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* --- Slide transition --- */
interface SlideTransitionProps {
  children: React.ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}

function SlideTransition({ children, direction, onHeightReady }: SlideTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

/* --- Step variants --- */
const stepVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '50%' : '-50%',
    opacity: 0,
  }),
};

/* --- Step component --- */
export function Step({ children }: { children: React.ReactNode }) {
  return <div className="step-default">{children}</div>;
}

/* --- Step indicator --- */
interface StepIndicatorProps {
  step: number;
  currentStep: number;
  onClickStep: (step: number) => void;
  disableStepIndicators: boolean;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }: StepIndicatorProps) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) onClickStep(step);
  };

  return (
    <motion.div onClick={handleClick} className="step-indicator" animate={status} initial={false}>
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: '#222', color: '#a3a3a3' },
          active: { scale: 1, backgroundColor: '#5227FF', color: '#5227FF' },
          complete: { scale: 1, backgroundColor: '#5227FF', color: '#3b82f6' },
        }}
        transition={{ duration: 0.3 }}
        className="step-indicator-inner"
      >
        {status === 'complete' ? (
          <CheckIcon className="check-icon" />
        ) : status === 'active' ? (
          <div className="active-dot" />
        ) : (
          <span className="step-number">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

/* --- Step connector --- */
function StepConnector({ isComplete }: { isComplete: boolean }) {
  const lineVariants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete: { width: '100%', backgroundColor: '#5227FF' },
  };

  return (
    <div className="step-connector">
      <motion.div
        className="step-connector-inner"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

/* --- Check icon --- */
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
