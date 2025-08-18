'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuthSession } from '@/components/auth/SessionProvider';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const { session } = useAuthSession();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    setIsResending(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session?.user?.email }),
      });

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  if (session.user.emailVerified) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Mail className="h-16 w-16 mx-auto mb-4 text-blue-600" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              We&apos;ve sent a verification email to:
            </p>
            <p className="font-medium text-lg mb-6">{session.user.email}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please check your email and click the verification link to continue.
            </p>
          </div>

          {message && (
            <div className={`text-sm text-center p-3 rounded ${
              message.includes('sent') 
                ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                : 'text-red-600 bg-red-50 dark:bg-red-900/20'
            }`}>
              {message}
            </div>
          )}

          <Button
            onClick={handleResendVerification}
            variant="outline"
            className="w-full"
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={() => window.location.href = '/auth'}
              className="text-sm text-gray-600 hover:underline"
            >
              Sign out
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
