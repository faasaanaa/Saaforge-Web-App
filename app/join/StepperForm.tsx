'use client';
import React, { useState, useEffect } from 'react';
import Stepper, { Step } from '@/components/ui/Stepper';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { Button } from '@/components/ui/Button';

const SKILL_SUGGESTIONS = [
  'Python', 'React', 'TypeScript', 'Node.js', 'Next.js', 'UI/UX Design', 'Tailwind CSS', 'AWS', 'Docker', 'Machine Learning', 'Data Science', 'DevOps', 'Blockchain', 'Figma', 'Linux', 'Git', 'TensorFlow', 'Web Development', 'Mobile Development', 'Cloud Computing', 'Cybersecurity', 'Open Source', 'Technical Writing'
];

const INTEREST_SUGGESTIONS = [
  'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'Natural Language Processing', 'Web Development', 'Mobile Development', 'Game Development', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Blockchain', 'Web3', 'Cryptocurrency', 'Data Science', 'Data Analytics', 'Big Data', 'IoT', 'Robotics', 'Augmented Reality', 'Virtual Reality', 'UI/UX Design', 'Product Design', 'Frontend Development', 'Backend Development', 'Full Stack Development', 'Database Management', 'System Architecture', 'Microservices', 'Serverless', 'API Development', 'Testing & QA', 'Agile Methodologies', 'Open Source', 'Technical Writing'
];

interface StepperFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}



export default function StepperForm({ onSubmit, loading }: StepperFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    achievements: '',
    githubUrl: '',
    linkedinUrl: '',
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Validation for each step
  const isStep1Valid = formData.name.trim() !== '' && formData.email.trim() !== '';
  const isStep2Valid = skills.length > 0 && interests.length > 0;
  const isStep3Valid = formData.reason.trim() !== '';

  // Only set touched for required fields on Next click or onBlur

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const canGoNext =
    (step === 1 && isStep1Valid) ||
    (step === 2 && isStep2Valid) ||
    (step === 3 && isStep3Valid) ||
    step === 4;

  const markTouched = (fields: string[]) => {
    setTouched((prev) => {
      const next = { ...prev };
      fields.forEach((f) => (next[f] = true));
      return next;
    });
  };
  const markStepTouched = () => {
    if (step === 1) {
      setTouched((prev) => ({ ...prev, name: true, email: true }));
    }
    if (step === 2) {
      setTouched((prev) => ({ ...prev, skills: true, interests: true }));
    }
    if (step === 3) {
      setTouched((prev) => ({ ...prev, reason: true }));
    }
  };

  const handleNext = () => {
    let touchedFields: string[] = [];
    if (step === 1) {
      touchedFields = ['name', 'email'];
    }
    if (step === 2) {
      touchedFields = ['skills', 'interests'];
    }
    if (step === 3) {
      touchedFields = ['reason'];
    }
    setTouched((prev) => {
      const next = { ...prev };
      touchedFields.forEach((f) => (next[f] = true));
      return next;
    });
    // If validation fails, do not advance
    if (
      (step === 1 && !isStep1Valid) ||
      (step === 2 && !isStep2Valid) ||
      (step === 3 && !isStep3Valid)
    ) {
      return;
    }
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  const handleStepperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ ...formData, skills, interests });
    }
  };

  return (
    <form onSubmit={handleStepperSubmit}>
      <Stepper
        step={step}
        initialStep={1}
        backButtonProps={{ onClick: handleBack, type: 'button' }}
        nextButtonProps={{
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            if (step === totalSteps) {
              // call submit handler directly
              handleStepperSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
            } else {
              handleNext();
            }
          },
          type: 'button',
          disabled: false,
        }}
        backButtonText="Previous"
        nextButtonText={step === totalSteps ? 'Submit' : 'Next'}
        disableStepIndicators={false}
      >
        <Step>
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => markTouched(['name'])}
            required
            placeholder="John Doe"
            error={touched.name && !formData.name.trim() ? 'Name is required' : undefined}
            className={touched.name && !formData.name.trim() ? 'border-red-500' : ''}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => markTouched(['email'])}
            required
            placeholder="john@example.com"
            error={touched.email && !formData.email.trim() ? 'Email is required' : undefined}
            className={touched.email && !formData.email.trim() ? 'border-red-500' : ''}
          />
        </Step>
        <Step>
          <AutocompleteInput
            label="Skills"
            value={skills}
            onChange={setSkills}
            suggestions={SKILL_SUGGESTIONS}
            placeholder="Start typing to search skills (e.g., Python, React)"
            helperText="Type and select from suggestions, or add your own"
            required
            error={touched.skills && skills.length === 0 ? 'Skills are required' : undefined}
            className={touched.skills && skills.length === 0 ? 'border-red-500' : ''}
          />
          <AutocompleteInput
            label="Interests"
            value={interests}
            onChange={setInterests}
            suggestions={INTEREST_SUGGESTIONS}
            placeholder="Start typing to search interests (e.g., AI, Web Development)"
            helperText="What areas of technology interest you?"
            error={touched.interests && interests.length === 0 ? 'Interests are required' : undefined}
            className={touched.interests && interests.length === 0 ? 'border-red-500' : ''}
          />
        </Step>
        <Step>
          <Textarea
            label="Achievements (Optional)"
            name="achievements"
            value={formData.achievements}
            onChange={handleChange}
            rows={4}
            placeholder="List your achievements (one per line)"
            helperText="Share your proudest accomplishments"
          />
          <Textarea
            label="Why do you want to join Saaforge?"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            onBlur={() => markTouched(['reason'])}
            required
            rows={4}
            placeholder="Tell us why you'd be a great fit for our team"
            error={touched.reason && !formData.reason.trim() ? 'This field is required' : undefined}
            className={touched.reason && !formData.reason.trim() ? 'border-red-500' : ''}
          />
        </Step>
        <Step>
          <Input
            label="GitHub Profile"
            name="githubUrl"
            type="url"
            value={formData.githubUrl}
            onChange={handleChange}
            placeholder="https://github.com/yourusername"
          />
          <Input
            label="LinkedIn Profile"
            name="linkedinUrl"
            type="url"
            value={formData.linkedinUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourusername"
          />
          {/* Submission handled by Stepper's Next button on final step */}
        </Step>
      </Stepper>
    </form>
  );
}
