'use client';

import { useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { createDocument } from '@/lib/hooks/useFirestore';
import { ProjectFeedback } from '@/lib/types';
import { useAuth } from '@/lib/contexts/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectType: 'client' | 'company';
  requiresClientId?: boolean;
}

export function FeedbackModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  projectType,
  requiresClientId = false,
}: FeedbackModalProps) {
  const { user, firebaseUser } = useAuth();
  const [submissionType, setSubmissionType] = useState<ProjectFeedback['type']>('feedback');
  const [formData, setFormData] = useState({
    name: '',
    feedback: '',
    description: '',
    rating: 5,
    clientId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientIdError, setClientIdError] = useState(false);
  const clientIdRef = useRef<HTMLDivElement>(null);

  // Auto-populate user data when modal opens
  useEffect(() => {
    if (isOpen && firebaseUser) {
      setFormData((prev) => ({
        ...prev,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
      }));
      setClientIdError(false);
    }
  }, [isOpen, firebaseUser]);

  // Derived values per render (respect explicit toggle only)
  const effectiveType: ProjectFeedback['type'] = submissionType;
  const needsClientId = projectType === 'client' && effectiveType === 'feedback';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear client ID error when user starts typing
    if (e.target.name === 'clientId') {
      setClientIdError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !firebaseUser) {
      setError('You must be logged in to submit feedback');
      return;
    }

    // Check client ID first
    if (needsClientId && !formData.clientId.trim()) {
      setClientIdError(true);
      // Scroll to client ID field
      if (clientIdRef.current) {
        clientIdRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setError('Client ID is required to submit feedback for this project');
      return;
    }

    if (!formData.feedback.trim()) {
      setError('Please provide your feedback or improvement idea');
      return;
    }

    if (!formData.name.trim()) {
      setError('Please provide a name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const feedbackData: any = {
        projectId,
        projectType,
        userName: formData.name.trim(),
        userEmail: firebaseUser.email || '',
        feedback: formData.feedback,
        suggestions: formData.description || '',
        type: effectiveType,
        isApproved: projectType === 'company' ? true : false, // Auto-approve for company projects, pending for client projects
      };

      // Only add rating for feedback type
      if (effectiveType === 'feedback') {
        feedbackData.rating = Number(formData.rating);
      }

      // Only add clientId if required
      if (needsClientId) {
        feedbackData.clientId = formData.clientId.trim();
      }

      await createDocument<ProjectFeedback>('projectFeedback', feedbackData);

      // Reset form and close
      setFormData({ 
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Anonymous',
        feedback: '', 
        description: '', 
        rating: 5, 
        clientId: '' 
      });
      setClientIdError(false);
      alert('Thank you! Your feedback has been submitted successfully.');
      onClose();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share Feedback on ${projectName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Type toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-900 rounded-lg p-1 inline-flex gap-1 border border-gray-800">
            <button
              type="button"
              onClick={() => setSubmissionType('feedback')}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-md text-xs md:text-sm font-medium transition-all ${
                submissionType === 'feedback'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg border border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              💬 Feedback
            </button>
            <button
              type="button"
              onClick={() => setSubmissionType('improvement')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                submissionType === 'improvement'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg border border-purple-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              💡 Improvement Idea
            </button>
          </div>
        </div>

        {/* Name field - auto-populated but editable */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        {needsClientId && (
          <div ref={clientIdRef}>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
              Client ID <span className="text-red-500">*</span> (Required)
            </label>
            <Input
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              placeholder="Client ID is required"
              required={needsClientId}
              className={clientIdError ? 'border-red-500 bg-red-50' : ''}
            />
            {clientIdError && (
              <p className="text-red-500 text-xs mt-1 font-medium">Client ID is required</p>
            )}
          </div>
        )}

        {effectiveType === 'feedback' && (
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-900 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239CA3AF' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="5" className="bg-gray-900 text-gray-100">★★★★★ Excellent</option>
              <option value="4" className="bg-gray-900 text-gray-100">★★★★☆ Good</option>
              <option value="3" className="bg-gray-900 text-gray-100">★★★☆☆ Average</option>
              <option value="2" className="bg-gray-900 text-gray-100">★★☆☆☆ Below Average</option>
              <option value="1" className="bg-gray-900 text-gray-100">★☆☆☆☆ Poor</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            {effectiveType === 'feedback' ? 'Your Feedback' : 'Your Improvement Idea'} <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="feedback"
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            placeholder={
              effectiveType === 'feedback'
                ? 'Share your thoughts about this project...'
                : 'Describe your improvement idea...'
            }
            rows={4}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Details (Optional)
          </label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Any additional information or details..."
            rows={3}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Submitting...' : submissionType === 'feedback' ? 'Submit Feedback' : 'Submit Idea'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
