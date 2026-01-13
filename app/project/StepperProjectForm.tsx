import React, { useState } from 'react';
import Stepper, { Step } from '@/components/ui/Stepper';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

interface StepperProjectFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

export default function StepperProjectForm({ onSubmit, loading }: StepperProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    techStack: '',
    demoUrl: '',
    githubUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleStepperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ ...formData });
    }
  };

  return (
    <Stepper initialStep={1}>
      <Step>
        <Input
          label="Project Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Awesome Project"
        />
        <Textarea
          label="Project Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Describe your project"
        />
      </Step>
      <Step>
        <Input
          label="Tech Stack (comma separated)"
          name="techStack"
          value={formData.techStack}
          onChange={handleChange}
          required
          placeholder="React, Node.js, Firebase"
        />
      </Step>
      <Step>
        <Input
          label="Demo URL (optional)"
          name="demoUrl"
          type="url"
          value={formData.demoUrl}
          onChange={handleChange}
          placeholder="https://demo.example.com"
        />
        <Input
          label="GitHub URL (optional)"
          name="githubUrl"
          type="url"
          value={formData.githubUrl}
          onChange={handleChange}
          placeholder="https://github.com/yourrepo"
        />
        <Button
          type="submit"
          size="lg"
          className="w-full mt-6"
          isLoading={loading}
          onClick={handleStepperSubmit}
        >
          Submit Project Request
        </Button>
      </Step>
    </Stepper>
  );
}
