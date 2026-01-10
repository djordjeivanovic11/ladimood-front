'use client';

import React, { useState, useEffect } from 'react';
import { addToNewsletter } from '@/api/account/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SubscribeNewsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      await addToNewsletter(email);
      setMessage({ type: 'success', text: 'Successfully subscribed to the newsletter!' });
      setEmail('');
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 400) {
        setMessage({ type: 'error', text: 'This email is already registered.' });
      } else {
        setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [message]);

  return (
    <div className="bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-3xl">
        <CardContent className="p-8 text-center">
          <h2 className="text-3xl font-extrabold">Subscribe to our Newsletter</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stay updated with the latest collections and exclusive offers.
          </p>

          {message && (
            <Badge
              variant={message.type === 'success' ? 'default' : 'destructive'}
              className="mt-4 w-full justify-center py-2"
            >
              {message.text}
            </Badge>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col items-center justify-center sm:flex-row"
          >
            <div className="flex w-full sm:max-w-md">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full"
                required
              />
            </div>
            <Button
              type="submit"
              className="mt-4 rounded-full sm:ml-4 sm:mt-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Subscribe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscribeNewsletter;
