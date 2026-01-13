"use client";
import React, { useState } from 'react';
import Stepper, { Step } from '@/components/ui/Stepper';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

interface OrderStepperFormProps {
  onSubmit: (data: any) => void;
  loading?: boolean;
}

export default function OrderStepperForm({ onSubmit, loading }: OrderStepperFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    serviceType: '',
    description: '',
    budget: '',
    timeline: '',
  });
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const isStep1Valid = formData.name.trim() !== '' && formData.email.trim() !== '';
  const isStep2Valid = formData.serviceType.trim() !== '' && formData.budget.trim() !== '' && formData.timeline.trim() !== '';
  const isStep3Valid = formData.description.trim() !== '';

  const isCurrentStepValid = (s: number) => {
    if (s === 1) return isStep1Valid;
    if (s === 2) return isStep2Valid;
    if (s === 3) return isStep3Valid;
    return false;
  };

  const markTouched = (fields: string[]) => setTouched((prev) => ({ ...prev, ...Object.fromEntries(fields.map(f => [f, true])) }));

  const handleNext = () => {
    if (step === 1) markTouched(['name', 'email']);
    if (step === 2) markTouched(['serviceType', 'budget', 'timeline']);
    if (step === 3) markTouched(['description']);

    if (!isCurrentStepValid(step)) return;

    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stepper
        step={step}
        initialStep={1}
        backButtonProps={{ onClick: handleBack, type: 'button' }}
        nextButtonProps={{
          onClick: (e: React.MouseEvent) => { e.preventDefault(); if (step === totalSteps) handleSubmit(); else handleNext(); },
          type: 'button',
          disabled: false,
        }}
        backButtonText="Previous"
        nextButtonText={step === totalSteps ? 'Submit' : 'Next'}
      >
        <Step>
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} onBlur={() => markTouched(['name'])} placeholder="John Doe" error={touched.name && !formData.name.trim() ? 'Required' : undefined} />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={() => markTouched(['email'])} placeholder="john@example.com" error={touched.email && !formData.email.trim() ? 'Required' : undefined} />
        </Step>

        <Step>
          <div>
            <label className="block text-sm font-medium text-white mb-1">Type of Service</label>
            <select name="serviceType" value={formData.serviceType} onChange={handleChange} onBlur={() => markTouched(['serviceType'])} className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
              <option value="">Select a service</option>
              <option value="automation">Automation</option>
              <option value="website">Website Development</option>
              <option value="custom-software">Custom Software</option>
              <option value="consulting">Consulting</option>
              <option value="other">Other</option>
            </select>
            {touched.serviceType && !formData.serviceType.trim() && (
              <p className="mt-2 text-sm text-red-500">Please select a service type</p>
            )}
          </div>
          <Input label="Budget Range" name="budget" value={formData.budget} onChange={handleChange} placeholder="e.g., $5,000 - $10,000" error={touched.budget && !formData.budget.trim() ? 'Required' : undefined} />
          <Input label="Timeline" name="timeline" value={formData.timeline} onChange={handleChange} placeholder="e.g., 2-3 months" error={touched.timeline && !formData.timeline.trim() ? 'Required' : undefined} />
        </Step>

        <Step>
          <Textarea label="Project Description" name="description" value={formData.description} onChange={handleChange} onBlur={() => markTouched(['description'])} rows={6} placeholder="Describe your project in detail" error={touched.description && !formData.description.trim() ? 'Required' : undefined} />
        </Step>
      </Stepper>
    </form>
  );
}
