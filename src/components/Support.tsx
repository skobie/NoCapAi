import React, { useState } from 'react';
import { X, Send, MessageSquare, Bug, Lightbulb, Star, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SupportProps {
  onClose: () => void;
}

type FeedbackType = 'review' | 'bug' | 'feature_request' | 'other';

interface FeedbackOption {
  value: FeedbackType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const feedbackOptions: FeedbackOption[] = [
  {
    value: 'review',
    label: 'Review',
    icon: <Star className="w-5 h-5" />,
    description: 'Share your experience'
  },
  {
    value: 'bug',
    label: 'Bug Report',
    icon: <Bug className="w-5 h-5" />,
    description: 'Report an issue'
  },
  {
    value: 'feature_request',
    label: 'Feature Request',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Suggest an improvement'
  },
  {
    value: 'other',
    label: 'Other',
    icon: <MessageSquare className="w-5 h-5" />,
    description: 'General feedback'
  }
];

export default function Support({ onClose }: SupportProps) {
  const { user } = useAuth();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('review');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to submit feedback');
      return;
    }

    if (!subject.trim() || !message.trim() || !email.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('support_feedback')
        .insert({
          user_id: user.id,
          email: email.trim(),
          feedback_type: feedbackType,
          subject: subject.trim(),
          message: message.trim()
        });

      if (submitError) throw submitError;

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
          <div className="mb-3 flex justify-center">
            <div className="bg-green-100 rounded-full p-2.5">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-sm text-gray-600">
            Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-t-3xl sm:rounded-xl shadow-2xl w-full sm:max-w-lg sm:my-8 max-h-[85vh] sm:max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Support & Feedback</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">We'd love to hear from you</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
              What would you like to share?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {feedbackOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFeedbackType(option.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    feedbackType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`flex-shrink-0 ${
                      feedbackType === option.value ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${
                        feedbackType === option.value ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Email (for follow-up)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="subject" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your feedback"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us more about your feedback..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
